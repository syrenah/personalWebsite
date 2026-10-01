import asyncio
import inspect
def repeat(times):
    def decorator(func):
        if inspect.iscoroutinefunction(func):
            async def async_wrapper(*args, **kwargs):
                for _ in range(times):
                    await func(*args, **kwargs)
            return async_wrapper
        else:
            def sync_wrapper(*args, **kwargs):
                for _ in range(times):
                    func(*args, **kwargs)
            return sync_wrapper
    return decorator
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

def repeat_async(times):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            for _ in range(times):
                await func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(7)
def non_async_demo():
    print("non async")

@repeat_async(7)
async def printing_stuff():
    await asyncio.sleep(2)
    print("Hello, World!")

async def main():
    await printing_stuff()
    non_async_demo()

if __name__ == "__main__":
    asyncio.run(main())