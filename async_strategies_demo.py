"""
async_strategies_demo.py

Demonstrates asynchronous strategies and Python classes working together.
Requires Python 3.11+ (uses asyncio.TaskGroup and asyncio.timeout).

Run:  python async_strategies_demo.py

Sections
  1. A fake async API client (a class with async methods)
  2. Strategy pattern: 4 ways to run many calls (sequential, gather,
     semaphore-limited, TaskGroup), each a class sharing one interface
  3. Async context manager (resource setup/teardown)
  4. Async iterator / generator (streaming results)
  5. Producer/consumer with asyncio.Queue and worker classes
  6. Timeouts, retries, and error handling
  7. Running blocking code without freezing the event loop
"""

from __future__ import annotations

import asyncio
import random
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import AsyncIterator


# ---------------------------------------------------------------------------
# 1. A fake async API client
# ---------------------------------------------------------------------------
@dataclass
class Result:
    """Simple data holder returned by the client."""
    item_id: int
    payload: str
    elapsed: float


class ApiClient:
    """Simulates a network service. `await asyncio.sleep` stands in for I/O."""

    def __init__(self, base_latency: float = 0.3, failure_rate: float = 0.0):
        self.base_latency = base_latency
        self.failure_rate = failure_rate
        self.calls_made = 0  # instance state shared across coroutines

    async def fetch(self, item_id: int) -> Result:
        start = time.perf_counter()
        self.calls_made += 1
        # While we "wait on the network", the event loop runs other tasks.
        await asyncio.sleep(self.base_latency + random.uniform(0, 0.1))
        if random.random() < self.failure_rate:
            raise ConnectionError(f"item {item_id}: simulated network failure")
        return Result(item_id, f"data-{item_id}", time.perf_counter() - start)


# ---------------------------------------------------------------------------
# 2. Strategy pattern: different ways to run many async calls
# ---------------------------------------------------------------------------
class FetchStrategy(ABC):
    """Common interface. Subclasses decide HOW the calls are scheduled."""

    name: str = "base"

    @abstractmethod
    async def run(self, client: ApiClient, ids: list[int]) -> list[Result]:
        ...


class SequentialStrategy(FetchStrategy):
    """One at a time. Simple, but total time = sum of all latencies."""

    name = "sequential"

    async def run(self, client, ids):
        return [await client.fetch(i) for i in ids]


class GatherStrategy(FetchStrategy):
    """All at once with asyncio.gather. Fast, but unbounded concurrency."""

    name = "gather"

    async def run(self, client, ids):
        return await asyncio.gather(*(client.fetch(i) for i in ids))


class SemaphoreStrategy(FetchStrategy):
    """All scheduled, but only N run at once (protects rate limits / pools)."""

    name = "semaphore"

    def __init__(self, limit: int = 3):
        self.limit = limit

    async def run(self, client, ids):
        sem = asyncio.Semaphore(self.limit)

        async def guarded(i: int) -> Result:
            async with sem:  # waits here if `limit` calls are already running
                return await client.fetch(i)

        return await asyncio.gather(*(guarded(i) for i in ids))


class TaskGroupStrategy(FetchStrategy):
    """Structured concurrency: if one task fails, siblings are cancelled."""

    name = "taskgroup"

    async def run(self, client, ids):
        async with asyncio.TaskGroup() as tg:
            tasks = [tg.create_task(client.fetch(i)) for i in ids]
        return [t.result() for t in tasks]


async def demo_strategies() -> None:
    print("\n=== 2. Strategy pattern: comparing scheduling approaches ===")
    ids = list(range(1, 9))  # 8 calls, ~0.35s each
    strategies: list[FetchStrategy] = [
        SequentialStrategy(),
        GatherStrategy(),
        SemaphoreStrategy(limit=3),
        TaskGroupStrategy(),
    ]
    for strategy in strategies:
        client = ApiClient()
        start = time.perf_counter()
        results = await strategy.run(client, ids)
        total = time.perf_counter() - start
        print(f"{strategy.name:<11} {len(results)} results in {total:.2f}s")


# ---------------------------------------------------------------------------
# 3. Async context manager
# ---------------------------------------------------------------------------
class AsyncConnection:
    """Acquire on entry, always release on exit (even if an error occurs)."""

    def __init__(self, name: str):
        self.name = name
        self.open = False

    async def __aenter__(self) -> "AsyncConnection":
        await asyncio.sleep(0.05)  # simulate connecting
        self.open = True
        print(f"  [{self.name}] opened")
        return self

    async def __aexit__(self, exc_type, exc, tb) -> bool:
        await asyncio.sleep(0.05)  # simulate cleanup
        self.open = False
        print(f"  [{self.name}] closed")
        return False  # don't swallow exceptions

    async def query(self, sql: str) -> str:
        await asyncio.sleep(0.1)
        return f"rows for: {sql}"


async def demo_context_manager() -> None:
    print("\n=== 3. Async context manager ===")
    async with AsyncConnection("db-1") as conn:
        print(" ", await conn.query("SELECT 1"))
    # Cleanup happens even on failure:
    try:
        async with AsyncConnection("db-2") as conn:
            raise RuntimeError("something broke mid-query")
    except RuntimeError as e:
        print(f"  caught: {e}")


# ---------------------------------------------------------------------------
# 4. Async iterator / generator: stream results as they arrive
# ---------------------------------------------------------------------------
class PageStream:
    """Async iterator class. `async for` calls __anext__ and awaits each page."""

    def __init__(self, client: ApiClient, pages: int):
        self.client = client
        self.pages = pages
        self._next = 0

    def __aiter__(self) -> "PageStream":
        return self

    async def __anext__(self) -> Result:
        if self._next >= self.pages:
            raise StopAsyncIteration
        self._next += 1
        return await self.client.fetch(self._next)


async def stream_completed(client: ApiClient, ids: list[int]) -> AsyncIterator[Result]:
    """Async generator: yields each result as soon as it finishes (any order)."""
    tasks = [asyncio.create_task(client.fetch(i)) for i in ids]
    for finished in asyncio.as_completed(tasks):
        yield await finished


async def demo_iterators() -> None:
    print("\n=== 4. Async iterator and async generator ===")
    client = ApiClient(base_latency=0.1)
    print("  async iterator (in order):")
    async for page in PageStream(client, pages=3):
        print(f"    page {page.item_id}: {page.payload}")

    print("  async generator (as completed, order may vary):")
    async for r in stream_completed(client, [1, 2, 3, 4]):
        print(f"    got {r.payload} after {r.elapsed:.2f}s")


# ---------------------------------------------------------------------------
# 5. Producer / consumer with asyncio.Queue
# ---------------------------------------------------------------------------
class Producer:
    def __init__(self, queue: asyncio.Queue, count: int):
        self.queue = queue
        self.count = count

    async def run(self) -> None:
        for i in range(1, self.count + 1):
            await self.queue.put(i)  # blocks if queue is full (backpressure)
        print(f"  producer: queued {self.count} jobs")


class Worker:
    def __init__(self, worker_id: int, queue: asyncio.Queue, client: ApiClient):
        self.worker_id = worker_id
        self.queue = queue
        self.client = client
        self.processed: list[int] = []

    async def run(self) -> None:
        while True:
            item_id = await self.queue.get()
            try:
                await self.client.fetch(item_id)
                self.processed.append(item_id)
            finally:
                self.queue.task_done()  # lets queue.join() know this job is done


async def demo_queue() -> None:
    print("\n=== 5. Producer/consumer with a Queue ===")
    queue: asyncio.Queue[int] = asyncio.Queue(maxsize=4)  # bounded queue
    client = ApiClient(base_latency=0.1)
    workers = [Worker(n, queue, client) for n in range(1, 4)]

    worker_tasks = [asyncio.create_task(w.run()) for w in workers]
    await Producer(queue, count=12).run()
    await queue.join()          # wait until every job has been processed
    for t in worker_tasks:      # workers loop forever, so cancel them
        t.cancel()
    await asyncio.gather(*worker_tasks, return_exceptions=True)

    for w in workers:
        print(f"  worker {w.worker_id} handled {len(w.processed)} jobs")


# ---------------------------------------------------------------------------
# 6. Timeouts, retries, and error handling
# ---------------------------------------------------------------------------
class ResilientClient:
    """Wraps ApiClient with a per-call timeout and retry with backoff."""

    def __init__(self, client: ApiClient, retries: int = 3, timeout: float = 1.0):
        self.client = client
        self.retries = retries
        self.timeout = timeout

    async def fetch(self, item_id: int) -> Result:
        for attempt in range(1, self.retries + 1):
            try:
                async with asyncio.timeout(self.timeout):
                    return await self.client.fetch(item_id)
            except (ConnectionError, TimeoutError) as e:
                if attempt == self.retries:
                    raise
                delay = 0.1 * 2 ** attempt  # exponential backoff
                print(f"  item {item_id}: {type(e).__name__}, retry {attempt} in {delay:.1f}s")
                await asyncio.sleep(delay)
        raise AssertionError("unreachable")


async def demo_errors() -> None:
    print("\n=== 6. Timeouts, retries, and error handling ===")
    flaky = ApiClient(base_latency=0.05, failure_rate=0.5)
    resilient = ResilientClient(flaky, retries=4)

    # return_exceptions=True: one failure doesn't discard the other results
    outcomes = await asyncio.gather(
        *(resilient.fetch(i) for i in range(1, 7)),
        return_exceptions=True,
    )
    ok = [o for o in outcomes if isinstance(o, Result)]
    failed = [o for o in outcomes if isinstance(o, Exception)]
    print(f"  succeeded: {len(ok)}, failed after retries: {len(failed)}")

    # A timeout on a slow call:
    slow = ApiClient(base_latency=2.0)
    try:
        async with asyncio.timeout(0.3):
            await slow.fetch(1)
    except TimeoutError:
        print("  slow call timed out after 0.3s")


# ---------------------------------------------------------------------------
# 7. Blocking code: don't freeze the event loop
# ---------------------------------------------------------------------------
def blocking_work(n: int) -> int:
    """Stands in for CPU-heavy or blocking library code."""
    time.sleep(0.3)  # time.sleep BLOCKS; asyncio.sleep does not
    return n * n


async def heartbeat(stop: asyncio.Event) -> int:
    ticks = 0
    while not stop.is_set():
        await asyncio.sleep(0.1)
        ticks += 1
    return ticks


async def demo_blocking() -> None:
    print("\n=== 7. Blocking code with asyncio.to_thread ===")
    stop = asyncio.Event()
    beat = asyncio.create_task(heartbeat(stop))

    # Runs in a worker thread, so the heartbeat keeps ticking meanwhile.
    results = await asyncio.gather(*(asyncio.to_thread(blocking_work, n) for n in range(4)))
    stop.set()
    ticks = await beat
    print(f"  results: {results}, heartbeat ticked {ticks} times while waiting")
    print("  (calling blocking_work directly would have frozen the heartbeat)")


# ---------------------------------------------------------------------------
async def main() -> None:
    await demo_strategies()
    await demo_context_manager()
    await demo_iterators()
    await demo_queue()
    await demo_errors()
    await demo_blocking()


if __name__ == "__main__":
    asyncio.run(main())
