// Code all game logic here

/*
Make sure to split all things into files
Here should only be things like main game loop and calling other functions

DO NOT CALCULATE ANYTHING HERE
*/

/*
============
    BUGS
============
camera quad tree and physics quad tree are not synced up.
something is deleting player whenever he shoots
not deleting entities properly

*/
// the canvas that we will be drawing to getContext means we are using a 2d space rather than OpenGL
var ctx = Utils.Get("canvas").getContext("2d");
// our target fps
var fps = 60;
var deltaTime = 1 / fps;
// two variables below are only used for performance testing purposes, in the final game they can be removed.
//                        min, max
var fpsRange = new Vector(1e99, -1);
var lastFps = [];

var player;
// what the grid size is for building snapping
const buildingSnapTo = 16;
// read the map from a file

var map = Map.ReadFromFile(Utils.Get("mapDataTerrain"), Utils.Get("mapDataBuildings"), 64);

// monster spawners
var spawners = [];
spawners.push(new Spawner(new Vector(5200,800),"livingmound", 1, 800,1600,200));
spawners.push(new Spawner(new Vector(4900,1500),"floatingEye0", 3, 800,1600,200));
spawners.push(new Spawner(new Vector(6500,900),"floatingEye1", 2, 800,1600,200));
spawners.push(new Spawner(new Vector(6840,350),"crawler", 3, 800,1600,200));
spawners.push(new Spawner(new Vector(1400,4850),"wraithlord", 8, 800,1600,200));
spawners.push(new Spawner(new Vector(1400,4850),"wraithlord", 8, 800,1600,200));
spawners.push(new Spawner(new Vector(3700,4000),"wormmass", 8, 800,1600,200));
spawners.push(new Spawner(new Vector(4000,3000),"trollwraith", 5, 800,1600,200));
spawners.push(new Spawner(new Vector(5600,2100),"trickster", 5, 800,1600,200));
spawners.push(new Spawner(new Vector(500,1650),"spider", 1, 800,1600,200));
spawners.push(new Spawner(new Vector(1650,3300),"snake", 1, 800,1600,200));
spawners.push(new Spawner(new Vector(7000,2000),"spectre", 1, 800,1600,200));
spawners.push(new Spawner(new Vector(7200,4000),"spirit", 1, 800,1600,200));

var buildAreas = [];
var buildings = [];

var hoverBuildingSelected = undefined;
var camera;
var physics = new Physics(map);
// how often the spawners are checked for the presence of the player
var nextSpawnerCheckTime = 0.25;
// create the NPCs
var monsterSpecialist = new PhysicsEntity(Utils.Get("people6"), new Vector(2500, 860), new Vector(64,64));
var witch = new PhysicsEntity(Utils.Get("mage11"), new Vector(7692, 480), new Vector(64,64));
var kid = new PhysicsEntity(Utils.Get("people9"), new Vector(1160, 1700), new Vector(64,64));
var farmer = new PhysicsEntity(Utils.Get("farmer"),new Vector(4090, 940), new Vector(64,64));
physics.AddEntity(monsterSpecialist);
physics.AddEntity(witch);
physics.AddEntity(kid);
physics.AddEntity(farmer);
// spawn randomly people around the cities
for (var i = 0; i < 15; i++){
    var ai = new NPC(Utils.Get("people"+Utils.Random(0,15)),Vector.add(new Vector(1200,400),Vector.random(1000)), new Vector(64,64));
    physics.AddEntity(ai);
}
// disable anti-aliasing (since the graphics are in a pixelart style we dont need AA)
ctx.imageSmoothingEnabled = false;
// easily remove an entity from the game completely
function removeEntity(entity) {
    camera.Delete(entity);
    physics.Delete(entity);
}
// used to show up a specific menu to the player
function openMenu(id,self){
    // list of ids
    var menus = ["inventory","questMenu","buildMenu","playerInformation","skilltree"];
    
    $('.top-nav-menu').find(".active").removeClass("active");
    $(self).addClass("active");
    
    for (var menu of menus){
        if (id == "inventory"){
            player.inventory.visible = true;
        } else {
            player.inventory.visible = false;
        }
        if (id == "playerInformation"){
            player.UpdatePlayerInformation();
        }
        if (id == "skilltree"){
            player.UpdateSkillTree();
        }
        document.getElementById(menu).style.display = id == menu ? "block" : "none";
    }
    player.inventory.Update();
}
// where the player can build his buildings
var b = new BuildArea(new Vector(1024,512),new Vector(512,512));
buildAreas.push(b);
// main loop for the game
function gameLoop() {
    var started = performance.now();
    camera.RenderMap();
    var NPCs = physics.update();
    
    camera.DrawBatch();

    player.InputManager();
    Quest.QuestUpdate();
    camera.FocusOn(player.position, 0.05);
    
    for (var npc of NPCs){
        npc.updateNPC();
    }

    // draw build areas here (before the player)
    // we are currently trying to build something
    // we can display some information to the player
    if (player.selectedBuilding){
        for (var area of buildAreas){
            area.Render();
        }
        var displayPos = camera.ScreenToWorld(Input.mousePosition);
        displayPos = Vector.addX(displayPos, 32);
        
        camera.DrawText("[F] to cancel.",displayPos,"left"); camera.DrawText(Utils.WordCase(Utils.IntoSentence(player.selectedBuilding)),Vector.subY(displayPos,20),"left");
        if (Input.GetKey("f")){
            player.selectedBuilding = "";
        }
    }
    // update each building's progress bar
    for (var build of buildings){
        if (build.destroy){
            Building.DestroySpecific(build);
            continue;
        }
        build.Update();
    }
    // this bit is responsible for placing and informing the player if we can place something
    if (player.selectedBuilding){
        var position = camera.ScreenToWorld(Input.mousePosition);
        //position = Vector.add(position,new Vector(32,32));
        position.round(buildingSnapTo);
        
        var canPlace = Building.CanPlace(position);
        // i really like using ternary operators which are basically an if and else statement in one line
        // CONDITION ? WHEN TRUE : WHEN FALSE
        // we specify a condition and based on if it's true or not the appropriate line will run after the question mark
        camera.DrawRect(position,new Vector(64,64),canPlace ? "lime" : "red");
    }
    // draw the player last
    player.draw();
    // in case there is some animated text we can update it
    camera.UpdateAnimatedText();
    // delta time makes sure everything is FPS independent
    nextSpawnerCheckTime -= deltaTime;
    if (nextSpawnerCheckTime <= 0){
        for (var spawner of spawners){
            spawner.Check();
        }
        nextSpawnerCheckTime = 1;
    }
    // calculate the fps and new deltaTime
    fps = 1000 / (performance.now() - started);
    deltaTime = 1 / fps;
    // the lines below this up to requestAnimationFrame(gameloop); are only for testing purposes to see how well the game performs and what the bottlenecks would be.
    fpsRange.x = Math.min(fpsRange.x, fps);
    fpsRange.y = Math.max(fpsRange.y, fps);

    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillRect(0, 0, 160, 35);

    ctx.fillStyle = "black";
    ctx.fillText(fps.toFixed(1) + " FPS", 30, 10);
    ctx.fillText("Min: " + fpsRange.x.toFixed(0) + ", Max: " + fpsRange.y.toFixed(0), 30, 20);
    ctx.fillText("Drawn: " + camera.drawingEntitiesCount + " entities. (Total: " + physics.entities.length + ")", 30, 30);
    // make sure we loop but synchronize with monitor's refresh rate (V-Sync)
    requestAnimationFrame(gameLoop);
}
//when the game fully loads do some calculations
window.onload = function () {
    player = new Player(Utils.Get("player"), new Vector(1500, 200), new Vector(48, 60));
    physics.entities.push(player);

    var aspectRatio = canvas.width / canvas.height;
    
    canvas.width = window.innerWidth - 10;
    canvas.height = window.innerHeight - 10;
    // in case if the first AA didn't turn off we turn it off again after everything has loaded
    ctx.imageSmoothingEnabled = false;

    camera = new Camera(new Vector(0, 0), new Vector(canvas.width / 2, canvas.height / 2), map);

    gameLoop();
    // get the inventory script ready
    player.inventory.Update();
    
    physics.newWeapon(player.position, "Wand", 1, 0.1, 1000, 2, 0.1, 4, "ball", "Wand", "Wand");
    physics.newWeapon(player.position, "Wand", 1, 0.1, 1000, 2, 0.1, 4, "ice_bolt", "Wand", "Wand");
    physics.newWeapon(player.position, "Wand", 1, 0.1, 1000, 2, 0.1, 4, "poison_arrow", "Wand", "Wand");
    physics.newWeapon(player.position, "Wand", 1, 0.1, 1000, 2, 0.1, 4, "green_goo", "Wand", "Wand");
    physics.newWeapon(player.position, "Wand", 1, 0.1, 1000, 2, 0.1, 4, "web", "Wand", "Wand");
    physics.newWeapon(player.position, "Wand", 1, 0.1, 1000, 2, 0.1, 4, "lightning_bolt", "Wand", "Wand");
    physics.newWeapon(player.position, "Wand", 1, 0.1, 1000, 2, 0.1, 4, "purple_projecitle", "Wand", "Wand");
    physics.newWeapon(player.position, "Wand", 1, 0.1, 1000, 2, 0.1, 4, "yellow_star", "Wand", "Wand");
    physics.newWeapon(player.position, "Wand", 1, 0.1, 1000, 2, 0.1, 4, "ninja_star", "Wand", "Wand");
    physics.newWeapon(player.position, "Wand", 1, 0.1, 1000, 2, 0.1, 4, "purple_plasma", "Wand", "Wand");
    
    // turn off all menus
    // we dont want the player greeted with tons of information at once
    // as this discourages the player from playing
    openMenu("");
}
// only used for testing and visualising the FPS of the game
function performanceGraph() {
    lastFps.push(fps);
    if (lastFps.length > 100) {
        lastFps.shift();
    }

    var largestValue = Math.max.apply(null, lastFps);

    ctx.fillStyle = "black";
    ctx.fillRect(0, canvas.height - 50, 100, 50);

    ctx.textAlign = "left";
    ctx.fillText(largestValue.toFixed(0), 0, canvas.height - 55);

    ctx.fillStyle = "lime";
    for (var i = 0; i < lastFps.length; i++) {
        var h = lastFps[i] / largestValue * 50;
        ctx.fillRect(i, canvas.height - h, 1, h);
    }
}
