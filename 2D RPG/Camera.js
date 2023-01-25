// Main camera in the game
// should have these methods:
// ScreenToWorld (which will transform the point from the screen to the world position);
// WorldToScreen (which will transform the point from the world to the screen);

class Camera {
    // position is from center
    constructor(pos, size, map) {
        this.position = pos;
        this.size = size;
        this.map = map;
        
        this.drawColliders = false;

        this.drawingEntitiesCount = 0; // Debugging purposes
        this.drawingMapTiles = 0; // debugging purposes

        this.drawEntities = this.NewQuadTree();
        this.drawEntitiesMoving = this.NewQuadTree();
        
        this.barsPercent = 0;
        
        this.animatedTextEntities = [];
    }
    // creates cinematic bars for a cutscene (has to be called each frame the cutscene happens)
    Cinematic(){
        var height = canvas.height * 0.1;
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,height*this.barsPercent);
        ctx.fillRect(0,canvas.height-height*this.barsPercent,canvas.width,height*this.barsPercent);
        if (this.barsPercent < 1){
            this.barsPercent += 0.1;
        }
    }
    // deletes the entities from own quad trees
    Delete(entity) {
        this.drawEntities.delete(entity);
        this.drawEntitiesMoving.delete(entity);
    }
    // remake a quad tree
    NewQuadTree() {
        return new QuadTree(new Rectangle(map.scale.x / 2, map.scale.y / 2, map.scale.x / 2, map.scale.y / 2), 8);
    }
    // add a new entity
    AddEntity(entity) {
        this.drawEntities.insert(entity);
    }
    // create a new quad tree for the moving entities
    ClearEntityMoving(entity) {
        this.drawEntitiesMoving = this.NewQuadTree();
    }
    // add an entity that moves around
    AddEntityMoving(entity) {
        this.drawEntitiesMoving.insert(entity);
    }
    // returns the bounds required to get everything in the camera vision space
    QueryInCamera() {
        return new Rectangle(this.position.x, this.position.y, this.size.x, this.size.y);
    }
    // draw entities in batch that are added to the camera
    DrawBatch() {
        var query = this.QueryInCamera();
        query.w += 64;
        query.h += 64;

        var physicsEntities = this.drawEntitiesMoving.query(query);
        var toDraw = this.drawEntities.query(query);// static non moving things

        this.drawingEntitiesCount = toDraw.length + physicsEntities.length;
        // everything that we have on the screen current is inside toDraw list
        for (var i = 0; i < toDraw.length; i++) {
            var ent = toDraw[i];
            
            this.DrawSingle(ent);
            if (ent instanceof Building){
                var value, color;
                // a building is beingt built
                if (ent.buildTime > 0){
                    // calculate the percentage and color based on percentage
                    value = ent.buildTime / ent.buildTimeMax;
                    color = Utils.ColorFromPerc(255 * value, 255, 255 - 255 * value, 1);
                    // building icon
                    var icon = new Entity(Utils.Get("buildIcon"), Vector.subY(ent.position, 32), new Vector(32,32));
                    // animate the building hammer above the building
                    var cutx = (ent.buildingIconIndex | 0) * 20;
                    // draw a specific part of a spritesheet
                    camera.DrawSpriteSheet(icon, cutx, 0, 20, 17);
                    // loop the animation and slow it down appropriately
                    ent.buildingIconIndex = (ent.buildingIconIndex + 1/6) % 3;
                } else {
                    // the building only has a progress bar when it can produce a resource
                    if (ent.resource != undefined){
                        value = ent.time / ent.timeMax;
                        color = Utils.ColorFromPerc(255 - 255 * value,255 * value, 0, 1);
                    }
                }
                // draw the progress bar if the building requires it
                if (ent.resource != undefined || ent.buildTime > 0){
                    this.ProgressBar(Vector.addY(ent.position,ent.scale.y), Vector.mult(ent.scale,0.75), color, value);
                }
            }
        }
        // save monsters separately so that we can draw them on top of the blood
        var monsters = [];
        // everything that moves
        for (var i = 0; i < physicsEntities.length; i++) {
            var ent = physicsEntities[i];
            
            if (ent instanceof AliveEntity){
                monsters.push(ent);
            } else {
                // particles have a trail so they are drawn differently
                if (ent instanceof Particle){
                    this.DrawSingle(ent);
                    for (var j = 0; j < ent.lastPositions.length; j++){
                        this.DrawImage(ent.texture, ent.lastPositions[j], ent.scale);
                    }
                }
                else {
                    this.DrawSingle(ent);
                }
            }
        }
        // make sure all monsters are on top of blood and items
        for (var monster of monsters){
            this.DrawSingle(monster);
            camera.DrawText(Utils.WordCase(`[${monster.level}] `+monster.name), Vector.subY(monster.position, monster.scale.y));
        }
    }
    // draws one entity considering camera coordinates
    DrawSingle(entity) {
        var drawPos = this.WorldToScreen(entity.position);
        // perform translation and rotation based on the entity rotation and position
        ctx.save();
        ctx.translate(drawPos.x, drawPos.y);
        ctx.rotate(entity.rotation);
        ctx.drawImage(entity.texture, -entity.halfScale.x, -entity.halfScale.y, entity.scale.x, entity.scale.y);
        ctx.restore();
        // are we in debug mode ?
        if (this.drawColliders && !(entity instanceof Particle)){
            ctx.strokeStyle = "red";
            ctx.rect(drawPos.x - entity.halfScale.x, drawPos.y - entity.halfScale.y, entity.scale.x,entity.scale.y);
            ctx.stroke();
        }

        if (entity instanceof AliveEntity) {
            this.DrawHealthBar(entity);
        }
    }
    NewAnimatedText(text, position, color){
        // some default settings for the animated text
        this.animatedTextEntities.push({
            life: 30,
            position: position,
            text: text,
            color: color || "white",
        })
    }
    UpdateAnimatedText(){
        var index = 0;
        // update the text and display it
        for (var text of this.animatedTextEntities){
            text.life--;
            text.position = Vector.subY(text.position, 1);
            this.DrawText(text.text, text.position, "center", text.color);
            if (text.life < 0){
                this.animatedTextEntities.splice(index, 1);
            }
            index++;
        }
    }
    DrawText(text,pos,align, color){
        align = align || "center";
        ctx.textAlign = align;
        
        var drawPos = this.WorldToScreen(pos);
        ctx.fillStyle = color || "white";
        // create a black outline so the text is easier to read
        ctx.strokeStyle = "black";
        ctx.font = "20px PT Mono";
        ctx.strokeText(text,drawPos.x,drawPos.y);
        ctx.fillText(text,drawPos.x,drawPos.y);
    }
    // draw lines given a list of vectors.
    DrawLines(){
        var pos = camera.WorldToScreen(arguments[0]);
        ctx.strokeStyle = "red";
        
        ctx.beginPath();
        ctx.moveTo(pos.x,pos.y);
        for (var i = 1; i < arguments.length; i++){
            pos = camera.WorldToScreen(arguments[i]);
            ctx.lineTo(pos.x,pos.y);
        }
        ctx.stroke();
    }
    // draw a specific sprite from a spritesheet
    DrawSpriteSheet(entity, cutx, cuty, cutwidth, cutheight) {
        // image(texture, cutx, cuty, cutwidth, cutheight, x,y,width,height);
        var drawPos = this.WorldToScreen(entity.position);
        ctx.drawImage(entity.texture, cutx, cuty, cutwidth, cutheight, drawPos.x - entity.scale.x / 2, drawPos.y - entity.scale.y / 2, entity.scale.x, entity.scale.y);
    }
    // draw image at a given position (doesn't use transformations)
    DrawImage(texture, pos, scale) {
        pos = this.WorldToScreen(pos);
        ctx.drawImage(texture, pos.x - scale.x / 2, pos.y - scale.y / 2, scale.x, scale.y);
    }
    DrawHealthBar(entity) {
        this.ProgressBar(entity.position, entity.scale, "red", entity.health / entity.healthMax);
    }
    DrawRect(pos,scale,color){
        pos = this.WorldToScreen(pos);
        ctx.fillStyle = color;
        ctx.fillRect(pos.x-scale.x/2,pos.y-scale.x/2,scale.x,scale.y);
    }
    ProgressBar(drawPos, scale, color, perc){
        perc = Utils.Clamp(perc,0,1);
        drawPos = this.WorldToScreen(drawPos);
        
        var padding = 2;
        var height = 12;
        
        ctx.fillStyle = "black";
        ctx.fillRect(drawPos.x - scale.x/2, drawPos.y - scale.y/2 - 15, scale.x,height);
        
        var width = scale.x * perc - padding * 2;
        // work out paddings and widths for the progress bar
        if (width > 0){
            ctx.fillStyle = color;
            ctx.fillRect(drawPos.x - scale.x/2 + padding,
                         drawPos.y - scale.y/2 - 15 + padding,
                         scale.x * perc - padding * 2,
                         height - padding * 2);
        
        }
    }
    // transform position x,y to the camera relative coordinates
    // this means you can pass in an entity.position and it will
    // return coordinates for the camera to draw from
    WorldToScreen(position) {
        var pos = Vector.sub(position, this.position);
        pos = Vector.add(pos, this.size);

        return pos;
    }
    // smoothly move the camera to that position
    FocusOn(position, smoothness) {
        smoothness = smoothness || 0.03;

        // calculate the boundaries of the map.
        var minx = this.size.x;
        var maxx = this.map.scale.x - this.size.x - this.size.x / 2;
        var miny = this.size.y;
        var maxy = this.map.scale.y - this.size.y - this.size.y / 2;

        this.position = Vector.lerp(this.position, position, smoothness);
        this.position.clamp(minx, maxx, miny, maxy);
    }
    // transforms from screen coordinates to world, useful for tracking where mouse is in the world
    ScreenToWorld(position) {
        var pos = Vector.add(this.position, position);
        return Vector.sub(pos, this.size);
    }
    // returns coordinates from the top left corner
    TopLeftCoordinates() {
        return new Vector(this.position.x - this.size.x / 2, this.position.y - this.size.y / 2);
    }
    // render the map using quadtree technique
    RenderMap() {
        // use quad tree to get the map to draw
        var boundary = this.QueryInCamera();
        // we need to add another block size to the query as it only works on edges
        boundary.w += this.map.blockSize;
        boundary.h += this.map.blockSize;

        var blocksToDraw = this.map.qtree.query(boundary);

        this.drawingMapTiles = blocksToDraw.length;
        
        var objects = [];

        for (var _block of blocksToDraw) {
            if (_block.background){
                this.DrawImage(_block.texture, _block.position, _block.scale);
            } else {
                objects.push(_block);
            }
        }
        for (var obj of objects){
            this.DrawImage(obj.texture, obj.position, obj.scale);
        }
    }
    // smoothly move vector from one vector to another
    Lerp(position, time) {
        time = time || 0.03;
        this.position = Vector.lerp(this.position, position, time);
    }
    // delete a given entity
    delete(entity) {
        this.drawEntities.delete(entity);
    }
}
