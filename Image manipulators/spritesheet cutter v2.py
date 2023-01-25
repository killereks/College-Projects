from PIL import Image, ImageDraw
import random

class Vector:
    def __init__(self,x,y):
        self.x = x
        self.y = y

spritesheet = Image.open("spritesheet.png")
spritesheet = spritesheet.convert("RGBA")

width, height = spritesheet.width, spritesheet.height

background_color = (255,255,255)
background_color = spritesheet.getpixel((0,0))
print("Using color",background_color,"as the background.")

startPos = None
size = None

floodedHistory = []

im = Image.new("RGB",(width,height))

def fill():
    for i in range(len(floodedHistory)):
        vector = floodedHistory[i]
        if inBoundary(vector.x,vector.y):
            spritesheet.putpixel((vector.x,vector.y),background_color)
counter = 0
def manageImage(x,y):
    global floodedHistory, counter
    
    while len(floodedHistory) > 0: floodedHistory.pop(0)
    
    floodFill(x,y)
    print("Found image of area",len(floodedHistory),"pixels.")
    startPos = Vector(width,height)
    endPos = Vector(0,0)

    for i in range(len(floodedHistory)):
        vector = floodedHistory[i]
        startPos.x = min(startPos.x, vector.x)
        startPos.y = min(startPos.y, vector.y)
        endPos.x = max(endPos.x, vector.x+1)
        endPos.y = max(endPos.y, vector.y+1)

    try:
        detectedImage = spritesheet.crop((startPos.x,startPos.y,endPos.x,endPos.y))
        detectedImage.save("spritesheet"+str(counter)+".png")
    except:
        pass
    counter += 1
    # delete from the original image
    fill()

def inHistory(x,y):
    for i in range(len(floodedHistory)):
        if floodedHistory[i].x == x and floodedHistory[i].y == y:
            return True
    return False

def getAvailable(x,y):
    arr = []
    for i in range(-1,2):
        for j in range(-1,2):
            if not(inBoundary(x+i,y+j)): continue
            if inHistory(x+i,y+j): continue
            if spritesheet.getpixel((x+i,y+j)) == background_color: continue
            
            arr.append(Vector(x+i,y+j))
    return arr

def inBoundary(x,y):
    if x < 0 or x >= width or y < 0 or y >= height:
        return False
    return True

backtrack = []
def floodFill(x,y):
    global floodedHistory, backtrack
    '''current = Vector(x,y)
    while True:
        around = getAvailable(current.x,current.y)
        if len(around) == 0: break

        randomNear = random.choice(around)
        
        backtrack.append(current)
        floodedHistory.append(randomNear)
        
        current = randomNear'''
    toCheck = []
    toCheck.append(Vector(x,y))
    while len(toCheck) > 0:
        current = toCheck.pop(0)
        around = getAvailable(current.x,current.y)
        for i in range(len(around)):
            floodedHistory.append(around[i])
        toCheck += around
    
    for i in range(len(floodedHistory)):
        im.putpixel((floodedHistory[i].x,floodedHistory[i].y),(255,255,0))
    im.save("preview.png")
        
    
    
def detectImage():
    global floodedHistory
    x = 0
    y = 0
    while x < width or y < height:
        x += 1
        if x >= width:
            x = 0
            y += 1
            if y >= height:
                return

        color = spritesheet.getpixel((x,y))
        if color != background_color:
            manageImage(x,y)
            x = 0
            y = 0

detectImage()
