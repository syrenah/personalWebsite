class Bird:
    def __init__(self,name, shoeSize=10, hatColor="red"):
        self.name=name
        self.__shoeSize = shoeSize
        self.__hatColor = hatColor

    def talk(self):
        print("cheep")
    #encapsulation and preventing accidental access, not preventing a determined programmer from accessing the data.
    #######################################
    @property
    def shoeSize(self):
        return self.__shoeSize

    @shoeSize.setter
    def shoeSize(self, size):
        self.__shoeSize = size
    ###################################
    # @property
    def __hatColor(self):
        return self.__hat_color

    # @__hatColor.setter
    # def __hatColor(self, color):
    #     self.__hat_color = color
    #################################
    def describe(self):
        print(f"{self.name} has a {self.__hatColor} hat")


class Chicken(Bird):
    def __init__(self):
          super().__init__("Bruno")
          self.talk()
        #   talk()  
        # needs self.talk() to access methods in a class
    @property
    def name(self):
        return self._name
    
    @name.setter
    def name(self, name):
        if len(name) > 15:
            print("Name must be 15 characters or fewer")
            return
        self._name = name

    @staticmethod
    def frolic():
        print("Chicken is frolicing")

   
    def be_happy(self):
        print(f"{self.name} is happy")


if __name__ == "__main__":
    chicken =  Chicken()
    chicken.talk()
    print(chicken.name)
    chicken.name="Charles"
    print(chicken.name)
    chicken.name="Charlesssssssssssssss"
    print(chicken.name)
    chicken.frolic()
    # print(chicken.__hatColor) #doesnt work
    chicken.describe()
    chicken.be_happy()
    chicken._hatColor = "blue"
    chicken.describe()