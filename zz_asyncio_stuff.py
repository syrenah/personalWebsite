import asyncio

class Bird:
    def __init__(self,name):
        self.name=name

    def talk():
        print("cheep")

class Chicken(Bird):
    def __init__(self):
          super().__init__("Bruno")
          self.talk()

    @staticmethod
    def talk():
        print("cluck")

def repeat_async(times):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            for _ in range(times):
                await func(*args, **kwargs)
        return wrapper
    return decorator

def repeat(times):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(7)
def demo():
    print("non async")

@repeat_async(7)
async def printing_stuff():
    await asyncio.sleep(2)
    print("asynHello, World!")


async def main():
    await printing_stuff()
    demo()


if __name__ == "__main__":
    asyncio.run(main())
    chicken =  Chicken()
    chicken.talk()