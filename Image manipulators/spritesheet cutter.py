from PIL import Image, ImageDraw
import sys
import random

sys.setrecursionlimit(20000)

class Vector:
    def __init__(self,x,y):
        self.x = x
        self.y = y

spritesheetName = "spritesheet.png"

spritesheet = Image.open(spritesheetName)
spritesheet = spritesheet.convert("RGBA")

background_color = (255,255,255,0)
background_color = spritesheet.getpixel((0,0))
print(background_color)

draw = ImageDraw.Draw(spritesheet)

floodedHistory = []

counter = 0

def cropImage(topLeft,size):
    global counter
    w, h = spritesheet.size
    try:
        croppedImage = spritesheet.crop((topLeft.x,topLeft.y,size.x,size.y))
        croppedImage.save("spritesheet"+str(counter)+".png")
    
        counter += 1
    except:
        pass

def fillRectangle(fill):
    for i in range(len(floodedHistory)):
        vector = floodedHistory[i]
        if vector.x < 0 or vector.y < 0 or vector.x > spritesheet.width or vector.y > spritesheet.height: continue
        spritesheet.putpixel((vector.x,vector.y),fill)

    spritesheet.save("spritesheetEdited.png")
    

def detectImage(x,y):
    # flood fill the image and get the dimensions
    floodFill(x,y)
    print("Found image of area",len(floodedHistory),"pixels")
    # smallest value (top left)
    startPos = Vector(spritesheet.width,spritesheet.height)
    # largest value (bottom right)
    size = Vector(0,0)

    for i in range(len(floodedHistory)):
        history = floodedHistory[i]
        startPos.x = min(history.x,startPos.x)
        startPos.y = min(history.y,startPos.y)
        size.x = max(size.x, history.x)
        size.y = max(size.y, history.y)
    
    #print("StartPos",startPos.x,startPos.y)
    #print("Size",size.x,size.y)

    cropImage(startPos,size)
    fillRectangle(background_color)

def inHistory(x,y):
    for i in range(len(floodedHistory)):
        vector = floodedHistory[i]
        if vector.x == x and vector.y == y:
            return True
    return False

def floodFill(x,y):
    if inHistory(x,y): return
    if x < 0 or y < 0 or x >= spritesheet.width or y >= spritesheet.height: return
    if spritesheet.getpixel((x,y)) == background_color: return
    floodedHistory.append(Vector(x,y))

    for i in range(-1,2):
        for j in range(-1,2):
            if not(inHistory(x+i,y+j)):
                floodFill(x+i,y+j)

    
def start():
    global floodedHistory
    y = 0
    x = 0
    while y <= spritesheet.height or x <= spritesheet.width:
        x += 1
        if x >= spritesheet.width:
            y += 1
            x = 0
            if y >= spritesheet.height:
                break
        color = spritesheet.getpixel((x,y))
        if color != background_color:
            detectImage(x,y)
            while len(floodedHistory) > 0: floodedHistory.pop(0)
            x = 0
            y = 0
    print("Finished.")    
            

start()
