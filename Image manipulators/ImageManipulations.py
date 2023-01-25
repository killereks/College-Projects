from PIL import Image
import glob, os

def firstThreeSame(c1,c2):
    return c1[0] == c2[0] and c1[1] == c2[1] and c1[2] == c2[2]

colorToRemove = (0,0,0)
newColor = (255,255,255,255)

for file in glob.glob("*.png"):
    img = Image.open(file)
    img = img.convert("RGBA")

    for y in range(img.height):
        for x in range(img.width):
            color = img.getpixel((x,y))
            if firstThreeSame(color,colorToRemove):
                img.putpixel((x,y),newColor)


    img.save(file)
