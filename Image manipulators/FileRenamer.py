from PIL import Image
import glob, os

n = input("Name?")

index = 0
for file in glob.glob("*.png"):
    os.rename(file,n+str(index)+".png")
    index += 1
