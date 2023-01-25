// This will calculate collisions and do 
// an appropriate action based on that collision

var Utils = {
    Random: function (min, max) {
        return (Math.random() * (max - min + 1) + min) | 0;
    },
    CopyObject: function (object) {
        return JSON.parse(JSON.stringify(object));
    },
    InRange: function (a, b, range) {
        var dist = Vector.sub(a, b).magnitudeSquared();
        return dist <= range * range;
    },
    Commas(number) {
        return number.toLocaleString();
    },
    SentenceCase(str) {
        if (str.length == 0) return "";
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        })
    },
    CopyClass(obj) {
        return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
    },
    Get(id) {
        return document.getElementById(id);
    },
    Clamp(num,min,max){
        return Math.max(min,Math.min(max,num));
    },
    Swap(arr,i,j){
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    },
    WithinRange(num,min,max){
        return (min <= num && num <= max);
    },
    ColorFromPerc(r,g,b,perc){
        r = (r * perc) | 0;
        g = (g * perc) | 0;
        b = (b * perc) | 0;
        
        return this.rgbTohex(r,g,b);
    },
    rgbTohex(r,g,b){
        function componentToHex(c){
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        
        return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    },
    Image(name, _class){
        _class = _class || "";
        // without getting the source again javascript refers to original object,
        // we want to create a completely new html element
        return `<img src='${Utils.Get(name).src}' class='${_class}'>`
    },
    IntoSentence(string){
        var text = "";
        for (var i = 0; i < string.length; i++){
            if (string.charAt(i).match(/[A-Z]/)){
                text += " "+string.charAt(i).toLowerCase();
            } else {
                text += string.charAt(i);
            }
        }
        return text;
    },
    WordCase(string){
        return string.replace(/\b\w/g, word => word.toUpperCase());
    },
    Round(num, dp){
        dp = dp || 1;
        dp = Math.pow(10,dp);
        return ((num * dp) | 0) / dp;
    },
    ColorLerp(r,g,b,r1,g1,b1,perc){
        var newR = (r + (r1 - r) * perc) | 0,
            newG = (g + (g1 - g) * perc) | 0,
            newB = (b + (b1 - b) * perc) | 0;
        
        newR = Utils.Clamp(newR, 0, 255);
        newG = Utils.Clamp(newG, 0, 255);
        newB = Utils.Clamp(newB, 0, 255);
        
        return Utils.rgbTohex(newR,newG,newB);
    },
    Simplify: function(num){
        var names = ["","k","m","b","t","qa","qt"];
        
        var index = (Math.log10(num) / 3) | 0;
        var factor = Math.pow(10,index*3);
        
        return Utils.Round(num/factor,2) + "" + names[index];
    }
}

class Physics {
    constructor(map) {
        this.entities = [];
        this.map = map;
        // create quad tree that will contain the whole map
        this.qtree = map.qtree.copy(); // the map already has the quadtree data initialized
        this.entitiesQuadtree = this.NewQuadtree();
        
        this.bloodParticles = 0;
        this.bloodParticlesMax = 100;
    }
    Delete(entity) {
        this.entitiesQuadtree.delete(entity);
        var index = this.entities.indexOf(entity);
        
        if (entity.texture == Utils.Get("blood")) this.bloodParticles--;
        
        // After 2 hours i figured out the item might be deleted
        // therefore this will delete a random item (thanks js);
        if (index == -1) return;
        this.entities.splice(index, 1);
    }
    NewQuadtree() {
        return new QuadTree(this.qtree.boundary, 8);
    }
    // since things are moving (projectiles, enemies) we need to remake the quadtree again.
    // This might seem like is a bad idea but actually it will still run very quickly
    UpdateQuadtree() {
        this.entitiesQuadtree = this.NewQuadtree();
        for (var entity of this.entities) {
            this.entitiesQuadtree.insert(entity);
        }
    }
    AddEntity(entity) {
        //this.qtree.insert(entity);
        this.entities.push(entity);
    }
    newItem(itemName, amount, pos, value) {
        var itemData = new Item(itemName, amount);
        itemData.displayName = itemName;
        if (value != undefined){
            itemData.cost = value;
        }

        var item = new ItemWorld(itemData, pos);
        this.AddEntity(item);
    }
    newWeapon(pos, name, damage, firerate, range, bulletcount, accuracy, quality, projectile, ident, dispName, dispDesc) {
        // constructor(name,damage, firerate, range, bulletcount, accuracy, quality)
        var itemData = new Weapon(name, damage, firerate, range, bulletcount, accuracy, quality, projectile, dispName, dispDesc);

        if (ident) {
            itemData.ApplyAttributes(ident);
        }

        var item = new ItemWorld(itemData, pos, dispName, dispDesc);
        this.AddEntity(item);
    }
    newArmor(pos, type, name, quality, ident, displayName, displayDesc) {
        var itemData = new Armor(name, type, quality, displayName, displayDesc);
        
        itemData.ApplyAttributes(ident);

        var item = new ItemWorld(itemData, pos, displayName, displayDesc);
        this.AddEntity(item);
    }
    newCoin(type, position) {
        var name = ["Bronze coin", "Silver coin", "Gold coin", "Diamond coin", "Emerald coin"][type];
        var itemData = new Item(name, 1);

        var item = new ItemWorld(itemData, position);

        this.AddEntity(item);
    }
    newXP(amount, position){
        var item = new XP(amount, position);
        
        item.velocity = Vector.randomCircle(5);
        
        this.AddEntity(item);
    }
    newSpell(name, quality, position) {
        var itemData = new Spell(name, quality);

        var item = new ItemWorld(itemData, position);
        itemData.displayName = name;

        this.AddEntity(item);
    }
    newParticle(texture,position,scale,velocity,lifeTime,trail){
        var particle = new Particle(texture,position,scale,lifeTime);
        particle.velocity = velocity;
        particle.trail = trail || 1;
        
        this.AddEntity(particle);
    }
    update() {
        this.mapCollision();
        this.UpdateQuadtree();
        
        var NPCs = [];

        camera.ClearEntityMoving();

        Inventory.canvasTooltipOUT();

        for (var entity of this.entities) {
            if (entity.hasOwnProperty("velocity") && !entity.hasOwnProperty("isPlayer")) {
                camera.AddEntityMoving(entity);
            }
            if (entity instanceof ProjectileEntity) this.projectileLogic(entity);
            if (entity instanceof AliveEntity && !entity.isPlayer) entity.Update();
            if (entity instanceof Particle) entity.update();
            if (entity instanceof ItemWorld) this.pickup(entity);
            if (entity instanceof NPC) NPCs.push(entity);
            if (entity instanceof XP) this.XPLogic(entity);

            if (entity.hasOwnProperty("timeExisted")) {
                entity.timeExisted++;
                if (entity.timeExisted > entity.maxExistanceTime) {
                    removeEntity(entity);
                }
            }

            this.clampToMap(entity);
        }
        
        return NPCs;
    }
    XPLogic(ent){
        if (this.intersection(player, ent)){
            player.xp += ent.amount;
            removeEntity(ent);
        } else {
            ent.MoveTowardsPlayerAccelerate();
        }
    }
    pickup(item) {
        var closestNonCoinItem = undefined;
        var closestItemDist = Infinity;
        // do nothing if coin is outside 64 units
        if (!Utils.InRange(player.position, item.position, 64+player.itemMagnet*16)) {
            return;
        }

        var itemFits = player.inventory.ItemFits(item.itemData);
        if (this.intersection(player, item) && item.isCoin) {
            // if it's a coin we can collect it straight away
            if (item.isCoin) {
                player.coins[item.coinType]++;
                player.inventory.UpdateCurrencyDisplay();
                removeEntity(item);
            }
        } else {
            // if it's an item and inventory is not full, do magnet effect
            if (item.isCoin) {
                // coin can always fit
                item.MoveTowardsPlayer();
            } else {
                // get the closest item to the player (non-coin)
                var dist = Vector.sub(item.position, player.position).magnitudeSquared();
                if (dist < closestItemDist && itemFits) {
                    closestItemDist = dist;
                    closestNonCoinItem = item;
                }
            }
        }
        // closestNonCoinItem now contains a weapon
        // or armor piece that is the closest to the player
        if (closestNonCoinItem) {
            var _item = closestNonCoinItem;
            var _data = _item.itemData

            var text = `[E] to pick up ${_data.displayName} (${_data.amount})<br>` + player.inventory.getTooltip(_data);
            var quality = Inventory.NumberToQuality(_data.quality);

            Inventory.canvasTooltipIN(text, _item.position, quality);

            if (Input.GetKey("e")) {
                player.inventory.AddItem(_data);
                removeEntity(_item);
            }
        }
    }
    projectileLogic(entity) {
        if (this.outsideMap(entity) || entity.distanceTravelled > entity.distanceMax) {
            removeEntity(entity);
        }
        if (entity.hitSomething){
            entity.timeExisted += 60;
        }
        // check collisions
        var query = new Rectangle(entity.position.x, entity.position.y, entity.scale.x + 128, entity.scale.y + 128);
        var around = this.entitiesQuadtree.query(query);
        
        entity.specialDelay -= 1/60;
        
        if (entity.special == "accelerate-mouse"){
            if (entity.sentFrom == "player"){
                entity.velocity = Vector.sub(camera.ScreenToWorld(Input.mousePosition), entity.position);
            } else {
                entity.velocity = Vector.sub(player.position, entity.position);
            }
            entity.velocity.setMagnitude(5);
        }

        for (var collision of around) {
            var canDamage = (collision.isPlayer && entity.sentFrom == "monster") || (!collision.isPlayer && entity.sentFrom == "player");
            // if the object cannot move, do not check collisions
            // Only resolve collisions on things that are moving
            if (!collision.hasOwnProperty("velocity")) continue;
            // is itself
            if (entity == collision) continue;
            
            if (collision instanceof AliveEntity && canDamage && entity.specialDelay < 0){                
                if (entity.special == "chain"){
                    var vel = Vector.sub(collision.position, entity.position);
                    vel.setMagnitude(5);
                    
                    var pro = new ProjectileEntity(entity.texture, entity.position, entity.scale, vel, entity.damage * 0.03, entity.distanceMax, entity.sentFrom);
                    
                    pro.special = ""; // make sure we do not crash (the spawned projectiles would otherwise spawn even more projectiles etc.);
                    physics.AddEntity(pro);
                    entity.specialDelay = 0.05;
                }
                if (entity.special == "multiply"){
                    var vel = Vector.randomUniform(5);
                    var pro = new ProjectileEntity(entity.texture, entity.position, entity.scale, vel, entity.damage * 0.1, entity.distanceMax, entity.sentFrom);
                    
                    pro.special = "";// make sure we do not crash (the spawned projectiles would otherwise spawn even more projectiles etc.);
                    physics.AddEntity(pro);
                    entity.specialDelay = 0.1;
                }
                if (entity.special == "multiply-circle"){
                    for (var i = 0; i < 8; i++){
                        var angle = i/8 * 2 * Math.PI;
                        var vel = Vector.fromAngle(5, angle);
                        
                        var pro = new ProjectileEntity(entity.texture, entity.position, entity.scale, vel, entity.damage * 0.25, entity.distanceMax, entity.sentFrom);
                        
                        pro.special = "";// make sure we do not crash (the spawned projectiles would otherwise spawn even more projectiles etc.);
                        physics.AddEntity(pro);
                    }
                    entity.specialDelay = 0.3;
                }
                if (entity.special == "accelerate"){
                    entity.MoveTowardsEntityAccelerate(0.01, collision);
                }
            }
            // are colliding
            if (this.intersection(collision, entity)) {
                // if the thing we hit is an alive entity
                if (collision instanceof AliveEntity && canDamage) {
                    collision.TakeDamage(entity.damage);
                    if (entity.special == "poison") collision.poison = Utils.Random(2,4);
                    if (entity.special == "freeze") collision.frozen = Utils.Random(1,2);
                    physics.BloodSplash(collision,entity,100);
                    // delete me (projectile)
                    removeEntity(entity);
                }
            }
        }
    }
    BloodSplash(from,to,amount){
        var dir = to.velocity.normalized();
        
        for (var i = 0; i < amount; i++){
            if (this.bloodParticles > this.bloodParticlesMax) break;
            this.bloodParticles++;
            var newDir = Vector.add(dir,Vector.random(0.3));
            var speed = Vector.mult(newDir,Math.random() * 2 + 5);
            var life = Math.random() * 60 + 30;
            
            this.newParticle(Utils.Get("blood"),to.position,new Vector(2,2),speed,life,6);
        }
    }
    intersection(ent1, ent2) {
        // simple intersection formula
        var pos1 = Vector.sub(ent1.position, ent1.halfScale),
            pos2 = Vector.sub(ent2.position, ent2.halfScale);

        var scale1 = ent1.scale,
            scale2 = ent2.scale;

        return pos1.x < pos2.x + scale2.x && pos1.x + scale1.x > pos2.x && pos1.y < pos2.y + scale2.y && scale1.y + pos1.y > pos2.y;
    }
    // ent1 has to be bigger than ent2
    intersectionFull(ent1,ent2){
        var x = ent1.position.x - ent1.halfScale.x;
        var y = ent1.position.y - ent1.halfScale.y;
        var x1 = ent2.position.x - ent2.halfScale.x;
        var y1 = ent2.position.y - ent2.halfScale.y;
        
        return (Utils.WithinRange(x1, x, x + ent1.scale.x) &&
                Utils.WithinRange(x1 + ent2.scale.x, x, x + ent1.scale.x) &&
                Utils.WithinRange(y1, y, y + ent1.scale.y) &&
                Utils.WithinRange(y1 + ent2.scale.y, y, y + ent1.scale.y));
    }
    pointInRect(point, rect){
        var pos = rect.position;
        var scale = rect.halfScale;
        
        return (Utils.WithinRange(point.x, pos.x - scale.x, pos.x + scale.x) && Utils.WithinRange(point.y, pos.y - scale.y, pos.y + scale.y));
    }
    
    LineToLine(p0,p1,p2,p3){
        var x1 = p0.x, y1 = p0.y,
            x2 = p1.x, y2 = p1.y,
            x3 = p2.x, y3 = p2.y,
            x4 = p3.x, y4 = p3.y;
        
        var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denom == 0){
            return undefined;
        }
        var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
        
        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1){
            return new Vector(x1 + ua * (x2 - x1), y1 + ua * (y2 - y1));
        }
        return undefined;
    }
    rayIntersection(ray, ent1){
        var rayPos = ray.position;
        var rayEndPos = ray.endPosition;
        
        // left side
        var topLeft = Vector.sub(ent1.position,ent1.halfScale);
        var topRight = new Vector(ent1.position.x + ent1.halfScale.x, ent1.position.y - ent1.halfScale.y);
        var bottomLeft = new Vector(ent1.position.x - ent1.halfScale.x, ent1.position.y + ent1.halfScale.y);
        var bottomRight = Vector.add(ent1.position,ent1.halfScale);
        
        var closestDist = 1e99;
        var closestHit = undefined;
        
        var left = this.LineToLine(rayPos,rayEndPos,bottomLeft,topLeft);
        var top = this.LineToLine(rayPos,rayEndPos,topLeft,topRight);
        var right = this.LineToLine(rayPos,rayEndPos,topRight,bottomRight);
        var bottom = this.LineToLine(rayPos, rayEndPos, bottomRight, bottomLeft);
        
        if (left) var leftDist = Vector.sub(left, ray.position).magnitudeSquared();
        if (top) var topDist = Vector.sub(top, ray.position).magnitudeSquared();
        if (right) var rightDist = Vector.sub(right, ray.position).magnitudeSquared();
        if (bottom) var bottomDist = Vector.sub(bottom, ray.position).magnitudeSquared();
        
        if (left)
            if (leftDist < closestDist){
                closestDist = leftDist;
                closestHit = left;
            }
        
        if (top)
            if (topDist < closestDist){
                closestDist = topDist;
                closestHit = top;
            }
        
        if (right)
            if (rightDist < closestDist){
                closestDist = rightDist;
                closestHit = right;
            }
        
        if (bottom)
            if (bottomDist < closestDist){
                closestDist = bottomDist;
                closestHit = bottom;
            }
        
        return closestHit;
    }
    outsideMap(entity) {
        var pos = entity.position;
        if (pos.x < 0 || pos.x > this.map.scale.x || pos.y < 0 || pos.y > this.map.scale.y) {
            return true;
        }
        return false;
    }
    clampToMap(entity) {
        if (entity.position.x + entity.halfScale.x > this.map.scale.x) entity.position.x = this.map.scale.x - entity.halfScale.x;
        if (entity.position.x < entity.halfScale.x) entity.position.x = entity.halfScale.x;

        if (entity.position.y - entity.halfScale.y > this.map.scale.y) entity.position.y = this.map.scale.y + entity.halfScale.y;
        if (entity.position.y < entity.halfScale.y) entity.position.y = entity.halfScale.y;
    }
    mapCollision() {
        for (var entity of this.entities) {
            if (entity.hitSomething){
                entity.actualVelocity = new Vector(0,0);
                continue;
            }

            var newPosition = Vector.add(entity.position, entity.velocity);
            // here check if it intersects anything
            var query = new Rectangle(entity.position.x, entity.position.y, entity.scale.x + 64, entity.scale.y + 64);
            var possibleIntersections = this.map.qtree.query(query);

            var willCollideOnX = false,
                willCollideOnY = false;
            // we need to create copy of the entity because we want
            // to check its position next frame (position += velocity)
            // and then determine if we should move
            var copy = new Entity(entity.texture, entity.position, entity.scale);
            copy.velocity = entity.velocity;
            // we need to do 2 axis separately otherwise
            // when the player is colliding only
            // the reverse key will make him move
            var velocityX = new Vector(copy.velocity.x, 0);
            var velocityY = new Vector(0, copy.velocity.y);

            // collision entity
            for (var colEnt of possibleIntersections) {
                if (entity.ignoreMapCollision) break;
                if (colEnt.walkable) continue;

                copy.position = Vector.add(entity.position, velocityX);

                if (this.intersection(colEnt, copy)) {
                    willCollideOnX = true;
                    if (entity.stopWhenHit && entity.special != "bounce") {
                        entity.hitSomething = true;
                    }
                }

                copy.position = Vector.add(entity.position, velocityY);
                if (this.intersection(colEnt, copy)) {
                    willCollideOnY = true;
                    if (entity.stopWhenHit && entity.special != "bounce") {
                        entity.hitSomething = true;
                    }
                }
            }

            if (!willCollideOnX) entity.position = Vector.add(entity.position, velocityX);
            if (!willCollideOnY) entity.position = Vector.add(entity.position, velocityY);

            if (entity.hasOwnProperty("distanceTravelled")) {
                entity.distanceTravelled += Math.hypot(copy.velocity.x, copy.velocity.y);
            }

            if (entity.rotateToMotion) {
                entity.rotation = entity.velocity.heading();
            }
            
            if (entity.special == "bounce"){
                if (willCollideOnX){
                    entity.velocity = new Vector(-entity.velocity.x, entity.velocity.y);
                    entity.velocity.setMagnitude(entity.velocity.magnitude() + 1);
                }
                if (willCollideOnY){
                    entity.velocity = new Vector(entity.velocity.x, -entity.velocity.y);
                    entity.velocity.setMagnitude(entity.velocity.magnitude() + 1);
                }
            }

            entity.velocity = Vector.mult(entity.velocity, entity.friction);
        }
    }
    // this code was originally used for lighting
    // in the game however it slows the game down a lot so I am not using it
    light(){
        var quality = 100;
        var radius = 300;
        
        var rect = new Rectangle(player.position.x,player.position.y,radius,radius);
        var around = this.entitiesQuadtree.query(rect);
        
        var mapObjects = map.qtree.query(rect);
        for (var mapObj of mapObjects){
            if (!mapObj.walkable){
                around.push(mapObj);
            }
        }
        
        var points = [];
        
        for (var i = 0; i < quality; i++){
            var angle = i/quality * Math.PI * 2;
            var ray = new Ray(player.position, angle, radius);
            
            var hitPos = undefined;
            var closestHit = radius * radius;
            
            for (var ent of around){
                if (ent.isPlayer) continue;
                
                var pos = this.rayIntersection(ray,ent);
                if (!pos) continue;
                var dist = Vector.sub(player.position,pos).magnitudeSquared();
                
                if (dist < closestHit){
                    hitPos = new Vector(pos.x,pos.y);
                    closestHit = dist;
                }
            }
            if (hitPos){
                points.push(hitPos);
            } else {
                points.push(ray.endPosition);
            }
            /*if (hitPos){
                camera.DrawLines(ray.position,hitPos);
            } else {
                camera.DrawLines(ray.position,ray.endPosition);
            }*/
        }
        ctx.lineWidth = 2;
        ctx.beginPath();
        var pos = camera.WorldToScreen(points[0]);
        ctx.moveTo(pos.x,pos.y);
        for (var i = 1; i < points.length; i++){
            pos = camera.WorldToScreen(points[i]);
            ctx.lineTo(pos.x,pos.y);
        }
        ctx.fillStyle = 'rgba(200,200,200,0.5)';
        ctx.fill();
    }
}
// ray used for the light calculations
class Ray {
    constructor(position,direction,length){
        length = length || 1;
        this.position = position;
        this.direction = direction;
        this.length = length;
        this.endPosition = Vector.add(position,Vector.fromAngle(length, direction));
    }
    static FromPositions(pos1,pos2){
        var dist = Vector.sub(pos1,pos2).magnitude();
        var dir = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
        return new Ray(pos1, dir, dist);
    }
}