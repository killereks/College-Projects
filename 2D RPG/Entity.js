// Everything to do with entities, things like AI
// Include also AliveEntity which will have health

// Everything that can be drawn
class Entity {
    constructor(texture, pos, scale) {
        this.texture = texture;
        this.position = pos;
        this.scale = scale || new Vector(texture.width, texture.height);
        this.halfScale = new Vector(this.scale.x / 2, this.scale.y / 2);
        this.rotation = 0;
    }
}
// Everything that moves
class PhysicsEntity extends Entity {
    constructor(texture, pos, scale) {
        super(texture, pos, scale);
        this.velocity = new Vector(0, 0);
        this.friction = 1;
    }
    MoveTo(target,speed){
        var dir = Vector.sub(target,this.position);
        var dist = dir.magnitudeSquared();
        
        var speed = speed || 2;
        
        if (dist > 10*10){
            this.velocity = Vector.mult(dir.normalized(),speed);
        } else {
            this.velocity = new Vector(0,0);
        }
    }
    MoveTowardsPlayer() {
        this.velocity = Vector.sub(player.position, this.position);
        this.velocity.setMagnitude(3);
    }
    MoveAwayFromPlayer() {
        this.velocity = Vector.sub(this.position, player.position);
        this.velocity.setMagnitude(3);
    }
    MoveTowardsPlayerAccelerate(mag){
        mag = mag || 0.03;
        var dir = Vector.sub(player.position, this.position);
        this.velocity = Vector.add(Vector.mult(dir, mag), this.velocity);
    }
    MoveTowardsEntityAccelerate(mag, entity){
        mag = mag || 0.03;
        var dir = Vector.sub(entity.position, this.position);
        this.velocity = Vector.add(Vector.mult(dir, mag), this.velocity);
    }
}

// All projectiles, (fireball, arrows etc);
class ProjectileEntity extends PhysicsEntity {
    constructor(texture, pos, scale, velocity, damage, distMax, sentFrom) {
        super(texture, pos, scale);
        this.rotateToMotion = true;
        this.ignoreMapCollision = false;
        this.velocity = velocity;
        this.damage = damage;
        this.distanceTravelled = 0;
        this.distanceMax = distMax || 1e99;
        this.timeExisted = 0;
        this.maxExistanceTime = 60 * 60; // 3600 frames so about 60 seconds 
        // if it's sent from player, we can only damage everything that isn't
        // a player, if it's sent by monster only damage the player.
        this.sentFrom = sentFrom;
        this.stopWhenHit = true; // When it hits something it will stop (environment);
        this.hitSomething = false; // Used to determine if we hit something (important for variable above)
        
        var specials = {
            "ball": "bounce",
            "ice_bolt": "freeze",
            "poison_arrow": "poison",
            "green_goo": "poison",
            "web": "freeze",
            "lightning_bolt": "chain",
            "purple_projectile": "multiply-circle",
            "yellow_star": "multiply",
            "ninja_star": "accelerate",
            "purple_plasma": "accelerate-mouse",
        }
        
        this.special = specials[texture.id] || "";
        this.specialDelay = 0;
    }
}

class Particle extends PhysicsEntity {
    constructor(texture, pos, scale, lifetime) {
        super(texture, pos, scale);
        this.lifetime = 0;
        this.lifetimeMax = lifetime || 30;
        this.velocity = Vector.random(5);
        this.trail = 0;
        this.lastPositions = [];
    }
    update() {
        this.lastPositions.push(this.position);
        if (this.lastPositions.length > this.trail){
            this.lastPositions.shift();
        }
        this.position = Vector.add(this.position, this.velocity);
        this.velocity = Vector.mult(this.velocity, 0.9);

        this.lifetime++;
        if (this.lifetime >= this.lifetimeMax) {
            removeEntity(this);
        }
    }
}
// Everything that can be killed
class AliveEntity extends PhysicsEntity {
    constructor(texture, pos, scale, health, name) {
        super(texture, pos, scale);

        this.level = 1;

	var hp = Math.pow(2, this.level);

        this.name = name;
        this.health = hp;
        this.healthMax = hp;
        
        this.damage = 0.1 * Math.pow(2,this.level);
        // effects
        this.regen = 3;
        this.frozen = 0;
        this.fire = 0;
        this.poison = 0;

        this.walkTo = this.position;
    }
    TakeDamage(dmg) {
        this.health -= dmg;
        if (this.health <= 0) {
            this.drop();
            Quest.KilledMonster(this);
            if (!this.isPlayer) {
                removeEntity(this);
            }
        }
        camera.NewAnimatedText("-"+dmg.toFixed(1),this.position,"white");
    }
    drop() {
        var amount = 0; //(Math.random() * 300) | 0;
        for (var i = 0; i < amount; i++) {
            physics.newCoin(0, this.position);
        }
        
        var xpDrop = (1 + player.equipmentIdentification.xpBonus * 0.1);
        
        var quality = (Math.random() * 6) | 0;
        
        var items = [{
                dropChance: 0.04,
                slot: "feet",
                name: "Boots",
                displayName: bootNames[Utils.Random(0,bootNames.length)],
                desc: item_description.Boots,
                range: 4,
            }, {
                dropChance: 0.02,
                slot: "chest",
                name: "Chestplate",
                displayName: chestPlateNames[Utils.Random(0,chestPlateNames.length)],
                desc: item_description.Chestplate,
                range: 41
            }, {
                dropChance: 0.05,
                slot: "head",
                name: "Helmet",
                displayName: helmetNames[Utils.Random(0,helmetNames.length)],
                desc: item_description.Helmet,
                range: 5
            }, {
                dropChance: 0.05,
                slot: "finger",
                name: "Ring",
                displayName: ringNames[Utils.Random(0,ringNames.length)],
                desc: item_description.Ring,
                range: 23,
            }, {
                dropChance: 0.03,
                slot: "legs",
                name: "Trousers",
                displayName: legArmorNames[Utils.Random(0,legArmorNames.length)],
                desc: item_description.Trousers,
                range: 0,
            }]
        
        function GetQuality(){
            var quality = 0;
            var qualityRand = Math.random();
            while (qualityRand > 0){
                // creates a distribution with curve y=0.5/(2^n) which makes
                // the next quality be twice as less likely as the current quality
                qualityRand -= 0.5 / (Math.pow(2,quality));
                quality++;
            }
            quality--;
            quality = Utils.Clamp(quality, 0, 5);
            
            return quality;
        }
        
        var itemDrops = {
            "livingmound": [{
                name: "mans_cramp",
                chance: 0.05,
                amount: 1,
                value: 0,
            }],
            "floatingeye0": {
                name: "lizard_paralysis",
                chance: 0.05,
                amount: 1,
                value: 0,
            }
        }
        
        var itemDrop = itemDrops[this.name.toLowerCase()];
        if (itemDrop){
            for (var i = 0; i < itemDrop.length; i++){
                var rand = Math.random();
                if (rand < itemDrop[i].chance){
                    physics.newItem(itemDrop[i].name, itemDrop[i].amount, this.position, itemDrop[i].value);
                }
            }
        }
        
        // chance for a new weapon
        if (Math.random() < 0.03) {
            var ident = new Identifications();
            
            var identAmount = Math.random();
            if (identAmount > 0.95) identAmount = 5;
            else if (identAmount > 0.7) identAmount = 4;
            else if (identAmount > 0.5) identAmount = 3;
            else if (identAmount > 0.3) identAmount = 2;
            else identAmount = 1;
            
            ident.random(identAmount, this.level*3);
            
            var name, damage, fireRate, range, bulletCount, accuracy;
            var dispName, dispDesc;
            var projectile = "";
            
            var sword = Math.random() > 0.5;
            if (sword){
                dispDesc = item_description.Sword;
                dispName = swordNames[Utils.Random(0,swordNames.length)];
                name = "Sword"+Utils.Random(0,47);
                damage = Math.random() * this.level * 6;
                range = Utils.Random(20,80);
                bulletCount = Math.random() < 0.2 ? 2 : 1;
                accuracy = Math.random();
                fireRate = damage * Utils.Random(0.7,1.3);
                projectile = "swordSlash";
            } else {
                name = "wand"+Utils.Random(0,27);
                dispDesc = item_description.Wand;
                dispName = wandNames[Utils.Random(0,wandNames.length)];
                damage = Math.random() * this.level * 2;
                range = Utils.Random(200,400);
                
                var bltCount = Math.random();
                if (bltCount > 0.95) bulletCount = 5;
                else if (bltCount > 0.9) bulletCount = 4;
                else if (bltCount > 0.8) bulletCount = 3;
                else if (bltCount > 0.4) bulletCount = 2;
                else bulletCount = 1;
                
                fireRate = damage * Utils.Random(0.9,1.5);
                accuracy = Math.random();
                var projectiles = ["arrow","ball","bullet","fire_bolt","fire_goo","green_goo","ice_bolt","lightning_bolt","ninja_star","poison_arrow","purple_plasma","purple_projectile","web","wiggle_arrow","yellow_star"];
                
                projectile = projectiles[Utils.Random(0,projectiles.length-1)];
            }
            
            physics.newWeapon(this.position, name, damage, fireRate, range, bulletCount, accuracy, GetQuality(), projectile, ident, dispName, dispDesc);
        }
        
        var partitions = Utils.Random(3,15);
        for (var i = 0; i < partitions; i++){
            physics.newXP(xpDrop/partitions, this.position);
        }
        
        for (var _item of items){
            // divide by the bonuses because we are aiming for the lowest number possible
            var rand = Math.random() / (1 + player.charisma * 0.05 + player.equipmentIdentification.charisma * 0.05 + player.equipmentIdentification.lootBonus * 0.1);
            
            var quality = GetQuality();
            
            var iden = new Identifications();
            iden.random(quality+1, this.level+1);
            
            var name = _item.name;
            if (_item.range != 0){
                name = _item.name.toLowerCase()+Utils.Random(0,_item.range);
            }
            
            if (rand < _item.dropChance){
                physics.newArmor(this.position, _item.slot, name, quality, iden, _item.displayName, _item.desc);
            }
        }
        
        // COIN DROP
        // create some sort of distribution
        // to get emerald coin we will need to get 3x 4 in a row meaning 1/4 ^ 3 = 1/64 chance
        var coinType = (Utils.Random(0,4) * Utils.Random(0,4) * Utils.Random(0,4) / 16) | 0;
        var amount = Utils.Random(0,40) * this.level;
        
        for (var i = 0; i < amount; i++){
            physics.newCoin(coinType, this.position);
        }
    }
    Update() {
        var distToTarget = Vector.sub(this.position, this.walkTo).magnitudeSquared();
        if (distToTarget <= 4) {
            this.walkTo = Vector.add(this.position, Vector.random(64));
        } else {
            this.velocity = Vector.sub(this.walkTo, this.position);
            this.velocity.setMagnitude(0.5);
        }

        if (this.fire <= 0 && distToTarget <= 30) {
            var velocity = Vector.sub(player.position, this.position).normalized();
            velocity.setMagnitude(10);
            velocity = Vector.add(velocity, player.velocity);

            var newArrow = new ProjectileEntity(Utils.Get("arrow"), this.position, item_scale.lightning_bolt, velocity, this.damage, 1000, "monster");
            physics.AddEntity(newArrow);

            this.fire = Math.random() * 1;
        }
        this.fire -= 1 / 60;
        
        this.Effects();
    }
    Effects(delta){
        var pos = Vector.addY(this.position,-50);
        var offset = -item_scale.particleSize.y;
        
        delta = delta || 60;
        var dt = 1/delta;
        
        if (this.isPlayer){
            this.health += this.equipmentIdentification.healthRegen * 0.01 * this.healthMax * dt;
            this.mana += this.equipmentIdentification.manaRegen * 0.2 * dt;
        }
        // regen, poison, speed
        if (this.regen > 0){
            this.regen -= dt;
            this.health += dt;
            this.health = Utils.Clamp(this.health,-1,this.healthMax);
            
            camera.DrawSingle(new Entity(Utils.Get("healIcon"),pos,item_scale.particleSize));
            
            // if more there is more than 1 effect, stack them
            pos = Vector.addY(pos,offset);
        }
        if (this.frozen > 0){
            this.velocity = new Vector(0,0);
            this.frozen -= dt;
            camera.DrawSingle(new Entity(Utils.Get("frozenIcon"),pos,item_scale.particleSize));
            
            // if more there is more than 1 effect, stack them
            pos = Vector.addY(pos,offset);
        }
        // poison cannot damage if player is below 5% of the max health
        if (this.poison > 0 && this.health > this.healthMax * 0.05){
            this.TakeDamage(this.healthMax * 0.05 * dt);
            this.poison -= this.isPlayer ? dt * (1 + 0.1 * this.equipmentIdentification.poisonResistance) : dt;
            camera.DrawSingle(new Entity(Utils.Get("limeSkull"),pos,item_scale.particleSize));
            // if more there is more than 1 effect, stack them
            pos = Vector.addY(pos,offset);
        }
    }
}
// Item that will be in the world
class ItemWorld extends PhysicsEntity {
    constructor(item, pos, displayName, displayDescription) {
        var texture = item_icons[item.name];
        if (texture == undefined) texture = Utils.Get(item.name.toLowerCase());
        
        var scale = item_scale[item.name]; // item.name is the texture name of the item
        
        super(texture, pos, scale);
        
        this.displayName = displayName || ""; // this is the name that will be seen when hovered over this item in the inventory
        this.description = displayDescription || ""; // the description of the item

        this.velocity = Vector.randomCircle(5);
        this.friction = 0.95;
        this.isItem = true;
        this.isCoin = item.name.includes("coin");

        this.coinType = this.isCoin ? ["Bronze coin", "Silver coin", "Gold coin", "Diamond coin", "Emerald coin"].indexOf(item.name) : -1;

        this.timeExisted = 0; // how long has the particle existed for ? (frames)
        this.maxExistanceTime = 60 * 30 * (Math.random() * 0.02 + 0.99); // max 30 seconds

        this.itemData = item;
        this.itemData.scale = scale;
        this.itemData.texture = texture;
    }
}

class Coin extends ItemWorld {
    constructor(coinName, amount) {
        var texture = item_icons[coinName];
        var scale = item_scale.Coin;

        super(texture, pos, scale);
        this.isCoin = true;
        // from the values (0 = bronze, 1 = silver, 2 = gold, 3 = diamond, 4 = emerald);
        this.coinName = coinName;
        this.maxExistanceTime = 60 * 10; // 10 seconds roughly
    }
}
class XP extends PhysicsEntity {
    constructor(amount, position){
        super(item_icons.XP, position, item_scale.XP);
        this.amount = amount;
    }
}

class Spawner {
    constructor(position, monster, level, triggerRange, resetRange, spawnRange){
        this.position = position;
        this.monster = monster;
        this.level = level;
        this.resetRange = resetRange; // how far the player needs to leave before resetting spawner
        this.triggerRange = triggerRange; // how close the player has to be to trigger spawnining
        this.spawnRange = spawnRange; // how close together to monsters spawn
        this.spawned = false;
        
        this.debug = false;
        
        this.entitiesSpawned = [];
    }
    Check(){
        // get the distance squared for optimisation purposes
        var dist = Vector.sub(player.position,this.position).magnitudeSquared();
        // if we are within the trigger range and we haven't spawned anything, then we spawn it!
        if (dist <= this.triggerRange * this.triggerRange && !this.spawned){
            this.spawned = true;
            
            var spawnCount = Utils.Random(3,10);
            var health = Math.pow(1.6,this.level);
            
            for (var i = 0; i < spawnCount; i++){
                var pos = Vector.add(this.position,Vector.randomCircle(this.spawnRange));
                var scale = new Vector(64,64);
                
                var ai = new AliveEntity(Utils.Get(this.monster), pos, scale, health, this.monster);
                ai.level = this.level;
                this.entitiesSpawned.push(ai);
                physics.AddEntity(ai);
            }
            // when we go outside the reset range we can remove the entities as the player is too far away to even see them
        } else if (dist > this.resetRange * this.resetRange && this.spawned){
            this.spawned = false;
            for (var ent of this.entitiesSpawned){
                removeEntity(ent);
            }
        }
        // this is used to help me visualize all of the distances
        if (this.debug){
            this.Debug();
        }
    }
    Debug(){
        // draw all different ranges to see if they are good for the game
        var pos = camera.WorldToScreen(this.position);
        
        ctx.lineWidth = 2;
        // reset radius
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.arc(pos.x,pos.y,this.resetRange,0,2*Math.PI);
        ctx.stroke();
        // trigger radius
        ctx.beginPath();
        ctx.strokeStyle = "lime";
        ctx.arc(pos.x,pos.y,this.triggerRange,0,2*Math.PI);
        ctx.stroke();
        // spawn radius
        ctx.beginPath();
        ctx.strokeStyle = "blue";
        ctx.arc(pos.x,pos.y,this.spawnRange,0,2*Math.PI);
        ctx.stroke();
    }
}
class NPC extends PhysicsEntity {
    constructor(texture, pos, scale) {
        super(texture, pos, scale);
        // generate a name for this NPC, we need this for the conversations
        var names = ["Lisabeth","Malika","Jaymie","Le","Krystal","Cyril","Holley","Kyong","Brigitte","Emelina","Adolph","Gisela","Angelena","Ina","Patrica","Charlie","Majorie","Alysha","Janel","Rayna","Johna","Tomika","Deeanna","Diedre","Rhea","Shanika","Kalyn","Antwan","Edith","Idell","Elwanda","Joshua","Sibyl","Mindy","Lovie","Kala","Jinny","Malka","Rosalie","Janna","Natalie","Bernardina","Pennie","Nettie","Steve","Wendie","Leatha","Claretha","Margarett","Tory","Olinda","Shizuko","Viva","Oralia","Miyoko","Ardell","Luba","Otto","Whitney","Lawerence","Mac","Bill","Jackqueline","Renea","Jolene","Derrick","Hortense","Willard","Signe","Jessi","Carli","Andre","Mario","Megan","Frankie","Rossana","Garfield","Lillia","Harriett","Kaleigh","Haywood","Terrance","Irmgard","Wilbert","Jesenia","Rubi","Elizabeth","Ming","Shanon","Garry","Kecia","Mercedez","Joane","Beata","Monty","Damien","Marylyn","Jacalyn","Venessa","Belle"];
        // pick a random name from the list
        this.name = names[Utils.Random(0,names.length-1)];
        // movement destination
        this.destination = pos;
        // movement related variables
        this.movementDelay = 2;
        this.walkSpeed = 2;
        // conversation related variables
        this.conversation = undefined; // current conversation
        this.conversationDelay = Utils.Random(3,20); // how long until next conversation after leaving
        this.talkDelay = 0; // how long until next time we talk
        this.sentenceDelay = 0; // how long should sentence appear
        this.currentSentence = ""; // current sentence that is being spoken
        this.conversationStatus = 0; // the conversation status (start, middle, end);
    }
    updateNPC(){
        // the NPC is speaking, display the text
        if (this.currentSentence){
            camera.DrawText(this.currentSentence,Vector.subY(this.position, this.halfScale.y));
        }
        
        this.movementDelay -= deltaTime;
        // calculate distance to new position
        var dist = Vector.sub(this.position, this.destination).magnitudeSquared();
        // we can move somewhere else
        if (this.movementDelay <= 0 && dist <= 2){
            this.movementDelay = Utils.Random(1,4);
            this.destination = this.newDestination();
        }
        
        this.conversationDelay -= deltaTime;
        if (this.conversationDelay <= 0){
            // we are not in a conversation, attempt one
            if (this.conversation == undefined){
                this.attemptConversation();
            }
        }
        this.sentenceDelay -= deltaTime;
        // we finished talking, delete the sentence
        if (this.sentenceDelay <= 0){
            this.currentSentence = "";
        }
        // we are not talking we can move where we want to
        if (this.conversation == undefined){
//            var dist = Vector.sub(this.destination, this.position).magnitudeSquared();
//            if (dist <= 3*3){
//                this.destination = this.newDestination();
//            }
            //console.log(Vector.sub(this.destination, this.position), this.movementDelay, dist);
            this.MoveTo(this.destination, this.walkSpeed);
        } else {
            // we are in a conversation, move to an appropriate position
            this.MoveTo(this.conversation.MyPosition(this), this.walkSpeed);
            this.talkDelay -= deltaTime;
            
            // we are about to talk
            if (this.talkDelay <= 0){
                this.talkDelay = Utils.Random(0.6,2);
                // sentence is shorter than conversation talk delay so that there are some pauses
                this.sentenceDelay = this.talkDelay * 0.7;
                // get a new sentence
                if (this.conversation.members.length > 1){
                    this.currentSentence = this.conversation.GetSentence(this.conversationStatus, this.name);
                }
                
                // reversed order to make sure that the conversation status happens atleast once
                if (this.conversationStatus == 2){
                    this.conversationStatus = 0;
                    this.leaveConversation();
                }
                if (this.conversationStatus == 1 && Utils.Random(0,100) < 20) this.conversationStatus = 2;
                if (this.conversationStatus == 0) this.conversationStatus = 1;
            }
        }
    }
    // calculate a new walking position
    newDestination(){
        return Vector.add(Vector.randomUniform(400),this.position);
    }
    attemptConversation(){
        var rectangle = new Rectangle(this.position.x, this.position.y, 512, 512);
        var around = physics.entitiesQuadtree.query(rectangle);
        // attempt to get entities around that can talk
        for (var ent of around){
            // we have an NPC that is not us
            if (ent instanceof NPC && ent != this){
                // we are not in a conversation
                if (this.conversation == undefined){
                    // there is a conversation nearby, join it
                    if (ent.conversation != undefined){
                        ent.conversation.NewMember(this);
                        // assign the conversation to our current conversation
                        this.conversation = ent.conversation;
                    } else {
                        // there is no nearby conversations, make one
                        this.conversation = new Conversation(this.position);
                        this.conversation.NewMember(this);
                    }
                }
            }
        }
    }
    // we are done, leave the conversation
    leaveConversation(){
        this.conversation.Leave(this);
        this.conversation = undefined;
        this.conversationDelay = Utils.Random(5,30);
    }
}
class Conversation {
    constructor(pos){
        // everyone in the current conversation
        this.members = [];
        // where the conversation is taking place
        this.destination = pos;
        // starting sentences
        this.talk_start = ["Hello {i}!","Hi {i}!","How are you {i}?","Hey {i}!","What's up {i}?","Good to see you {i}!","I didn't see you in ages {i}!","Howdy!","Hiya!","Yo!"];
        // mid-talk sentences
        this.talk_middle = ["{i} have you ever considered going outside?","I'm considering buying a cat.","I think dogs are awesome!","You'll What?","There is this new guy in town, have you seen him?","{i}, we should talk about this later.","{i} surprise me and say something intelligent.","I'm so sick of you.","We should talk about this later.","Tomorrow we can discuss it.","I could really drink coffee now, anyone wanna come?","My grass is growing extremely well!","Urgh.. Who cares {i}?","{i} that is offensive!","{i} you need to go right now.","I met the lumberjack yesterday.","Working in a cave is very hard.","I'm making no money, even on the marketplace.","I wish I could do some quests.","My skill tree is very basic.","I'd rather be a bird than a fish.","How was the math test?","I am never at home on Sundays.","She did her best to help him.","The lake is a long way from here.","She folded her handkerchief neatly.","{i} this is not how you do that!","Everyone was busy, so I went to the movie alone.","It was getting dark, and we weren’t there yet.","I'm scared of dark.","I would have gotten the promotion, but my attendance wasn’t good enough.","I love eating toasted cheese and tuna sandwiches.","The river stole the gods.","The sky is clear; the stars are twinkling.","Wow, does that work?","Please wait outside of the house next time.","The stranger officiates the meal.","Is it free?","Rock music approaches at high velocity.","A song can make or ruin a person’s day if they let it get to them.","She wrote him a long letter, but he didn't read it.","Cats are good pets, for they are clean and are not noisy.","A glittering gem is not enough.","Two seats were vacant.","This is a Japanese doll {i}.","Where did you get that from {i}?","She works two jobs to make ends meet; at least, that was her reason for not having time to join us.","I am counting my calories, yet I really want dessert.","I'm hungry.","I miss her so much.",":(","...","?","!"];
        // last conversation sentences
        this.talk_end = ["Good bye {i}!","Bye {i}!","Bye!","See you later.","See ya!","I will see you next time {i}!"];
    }
    // add a new member to this conversation
    NewMember(member){
        this.members.push(member);
    }
    // someone is leaving the conversation, remove him
    Leave(member){
        if (this.members.indexOf(member)){
            this.members.pop(this.members.indexOf(member));
        }
    }
    // calculate the position of the member based on the time the NPC joined.
    // new NPCs that join a conversation will be at the end of the circle.
    // it calculates the percentage of the member position and transforms it
    // into an angle that calculates where the new position will be for this member.
    MyPosition(member){
        if (this.members.indexOf(member) == -1) return member.position;
        
        var perc = Math.PI * 2 * this.members.indexOf(member) / this.members.length;
        return Vector.add(this.destination, Vector.fromAngle(80, perc));
    }
    // is there no one to talk to?
    OnlyMember(){
        return this.members.length == 1;
    }
    GetSentence(status, myName){
        // save sentence temporarily
        var sentence = "";
        // status
        // 0 = just started talking
        // 1 = Middle of the conversation
        // 2 = Saying goodbye (leaving)
        if (status == 0){
            sentence = this.talk_start[Utils.Random(0,this.talk_start.length-1)];
        } else if (status == 1){
            sentence = this.talk_middle[Utils.Random(0,this.talk_middle.length-1)];
        } else {
            sentence = this.talk_end[Utils.Random(0,this.talk_end.length-1)];
        }
        // some sentences mention names, {i} means individual and is replaced
        // by a name that the NPC is talking to
        var name = this.members[Utils.Random(0,this.members.length-1)].name;
        
        sentence = sentence.replace(/{i}/g, name);
        
        return sentence;
    }
    // used when the NPCs talk to multiple NPCs at once
    GetMembers(){
        var members = "";
        for (var member of this.members){
            members += member.name+", ";
        }
        return members;
    }
}