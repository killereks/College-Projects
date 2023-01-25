// Everything to do with the player goes here

class Player extends AliveEntity {
    constructor(texture, position, scale) {
        super(texture, position, scale);
        this.isPlayer = true;
        this.enableControls = true;
        this.walk = 0;
        this.velocity = new Vector(0, 0);
        this.targetSpeed = 3;
        // main data
        this.health = 10000;
        this.healthMax = 10000;
        // create a new vector so that it has no reference to the position
        this.spawnPos = new Vector(position.x, position.y);

        this.mana = 0;
        this.manaMax = 10;
        
        this.level = 1;
        this.xp = 0;
        this.xpN = this.GetXPNeeded();
        this.skillpoints = 0;

        // this will be kept in the weapon class probably.
        this.shootDelay = 0;
        // put this later into inventory class
        this.coins = [0, 0, 0, 0, 0]; // corresponds to [bronze,silver,gold,diamond,emerald];

        this.spellCooldown = 0;

        // EQUIPPED ITEMS DATA
        this.head = undefined;
        this.chest = undefined;
        this.hand = undefined;
        this.finger = undefined;
        this.legs = undefined;
        this.feet = undefined;
        this.special = undefined;
        // inventory data
        this.inventory = new Inventory(10);

        // player attributes
        this.strength = 0; // amount of damage
        this.toughness = 0; // amount of health
        this.stamina = 0; // amount of mana
        this.dexterity = 0; // speed bonus
        this.defence = 0; // defence bonus
        this.charisma = 0; // extra quest loot bonus
        this.itemMagnet = 0;
        
        this.equipmentIdentification = new Identifications();

        this.quests = [];
        this.questCurrent = 0;
        // keyframes
        this.animationFrame = 1;
        
        this.selectedBuilding = "";
        this.currentBuilding = undefined;
        
        this.skilltree = [{
            name: "Strength",
            tooltip: "Deal more damage.",
            level: 0,
            levelMax: 10
        }, {
            name: "Toughness",
            tooltip: "More health.",
            level: 0,
            levelMax: 10
        }, {
            name: "Stamina",
            tooltip: "More mana.",
            level: 0,
            levelMax: 10,
        }, {
            name: "Dexterity",
            tooltip: "Run faster.",
            level: 0,
            levelMax: 10,
        }, {
            name: "Defence",
            tooltip: "Take less damage.",
            level: 0,
            levelMax: 10,
        }, {
            name: "Charisma",
            tooltip: "Drop better loot.",
            level: 0,
            levelMax: 10,
        }]
    }
    UpdateSkillTree(){
        var text = '';
        var index = 0;
        for (var skill of this.skilltree){
            var btnColor = this.skillpoints > 0 ? "green" : "red";
            
            var addBtn = `<button class='ui bottom attached button ${btnColor}' onclick='player.AddSkillPoint(${index})';>Add point</button>`;
            var color = skill.level == skill.levelMax ? "green" : "red";
            
            var html = `
            <div class="card ${color}">
                <div class="ui top attached button ${color}"'>${skill.level} / ${skill.levelMax}</div>
                <div class="content">
                    <div class="header">${skill.name}</div>
                    <div class="description">${skill.tooltip}</div>
                </div>
                ${skill.level == skill.levelMax || this.skillpoints == 0 ? "" : addBtn}
            </div>`;
            text += html;
            index++;
        }
        Utils.Get("skilltreeContent").innerHTML = text;
    }
    AddSkillPoint(index){
        // add a skillpoint to a specific skill
        this.skilltree[index].level++;
        this[this.skilltree[index].name.toLowerCase()]++;
        this.skillpoints--;
        this.UpdateSkillTree();
    }
    GetXPNeeded(){
        return 100 * Math.pow(1.2, this.level - 1);
    }
    draw(){
        // naming scheme:
        // player_walk_[dir]_[frame]
        
        // dir
        // 0 = up
        // 1 = right
        // 2 = down
        // 3 = left
        var texture = "player";
        
        if (this.animationFrame >= 4){
            this.animationFrame = 0;
        }
        
        var frame = (this.animationFrame | 0);
        var dir = -1; // idle
        
        if (this.velocity.y < -0.1) dir = 0;
        if (this.velocity.y > 0.1) dir = 2;
        
        if (dir != -1){
            texture = "player_walk_"+dir+"_"+frame;
            this.animationFrame += 0.15;
        } else {
            if (frame >= 2) frame = 0;
            texture = "player_idle_"+frame;
            this.animationFrame += 0.02;
        }
        
        var ent = new Entity(Utils.Get(texture),this.position,this.scale);
        camera.DrawSingle(ent);
    }
    UpdateProgressBars() {
        Utils.Get("player_healthbar").style.width = (this.health / this.healthMax * 100) + "%";
        Utils.Get("player_manabar").style.width = (this.mana / this.manaMax * 100) + "%";
        Utils.Get("player_levelbar").style.width = (this.xp / this.xpN * 100) + "%";

        Utils.Get("player_healthbar").innerHTML = `${Utils.Round(this.health,1)}/${Utils.Round(this.healthMax,1)}`;
        Utils.Get("player_manabar").innerHTML = `${Utils.Round(this.mana,1)}/${Utils.Round(this.manaMax,1)}`;

        Utils.Get("player_levelbar").innerHTML = `${Utils.Round(this.xp,1)}/${Utils.Round(this.xpN,1)}`;
        
        player.mana = Utils.Clamp(player.mana, 0, player.manaMax);
        player.health = Utils.Clamp(player.health, 0, player.healthMax);
        
        if (player.special) {
            // remove the percent class
            var classes = Utils.Get("player_specialbar").classList;
            for (var class_ of classes) {
                if (class_.match(/p(\d)/g)) {
                    classes.remove(class_);
                    break;
                }
            }
            var cooldown = spell_cooldowns[this.special.name];

            // add it again with the new percent
            var percent = 100 - (this.spellCooldown / cooldown * 100) | 0;
            classes.add("p" + percent);
        }
    }
    InputManager() {
        this.UpdateProgressBars();
        if (!this.enableControls) {
            this.velocity = new Vector(0, 0);
            return;
        }
        var friction = 0.5;
        // divide by friction because the physics will multiply by the friction
        // first and then the player will be updated
        var speed = this.targetSpeed / friction;
        if (Input.GetKey("w")) this.velocity.y = -speed;
        if (Input.GetKey("s")) this.velocity.y = speed;
        if (Input.GetKey("a")) this.velocity.x = -speed;
        if (Input.GetKey("d")) this.velocity.x = speed;

        var deltaTime = 1 / 60;

        this.velocity = Vector.mult(this.velocity, friction);

        if (this.shootDelay > 0) {
            this.shootDelay -= deltaTime;
        }
        if (this.spellCooldown > 0) {
            this.spellCooldown -= deltaTime;
        }

        if (this.velocity.magnitude() > 1) {
            this.walk += 0.1;
            this.walk %= 4;
        }

        if (Input.GetMouseButton(0) && this.shootDelay <= 0 && this.frozen <= 0 && this.selectedBuilding == "") {
            this.Shoot();
        }
        if (Input.GetKey("1")) {
            this.Spell();
        }
        
        if (this.xp >= this.xpN){
            this.xp -= this.xpN;
            camera.NewAnimatedText("LEVEL UP!",player.position, "yellow");            
            this.level++;
            this.skillpoints++;
            if (this.level % 2 == 0){
                camera.NewAnimatedText("+SLOT",Vector.addY(player.position,10), "white");
                this.inventory.slotCount++;
            }
            this.xpN = this.GetXPNeeded();
        }
        
        if (Input.GetMouseButton(0) && player.selectedBuilding){
            var texture = Utils.Get(player.selectedBuilding);
            var name = Utils.SentenceCase(player.selectedBuilding);
            
            Building.Build(texture,camera.ScreenToWorld(Input.mousePosition),name, 1);
        }
        
        this.Effects();
    }
    Select(name){
        this.selectedBuilding = name;
    }
    TakeDamage(amount) {
        this.health -= amount * Math.max(0.5, 1 - (this.equipmentIdentification.defence + this.defence) * 0.02);
        
        camera.NewAnimatedText("-"+amount.toFixed(1),this.position,"white");
        
        if (this.health <= 0) {
            // respawn with only 50% of the maximum health
            this.health = this.healthMax;
            this.position = new Vector(this.spawnPos.x, this.spawnPos.y);
        }
    }
    Spell() {
        // spell is at cooldown or there is no spell equipped
        if (!this.special || this.spellCooldown > 0) return;

        var spellName = this.special.name;
        var quality = this.special.quality;
        
        var dmg = this.equipmentIdentification.spellDamage;

        this.spellCooldown = spell_cooldowns[spellName];
        // i dont have enough time to complete the spells, but this code
        // below does work I just haven't added the items for the spells
//        if (spellName == "bullet ring") {
//            var max = 8 + quality * 4; // base of 8, then add 4 for extra quality, (mythical = 28)
//            for (var i = 0; i < max; i++) {
//                var angle = Math.PI * 2 * i / max;
//                var velocity = Vector.fromAngle(5, angle);
//                var newArrow = new ProjectileEntity(item_icons.arrow, this.position, item_scale.arrow, velocity, 1, 250, "player");
//
//                physics.AddEntity(newArrow);
//            }
//        }
//        else if (spellName == "heal"){
//            this.healthEffectTime = 2;
//        }
    }
    EquipmentChanged(){
        var stats = this.GetItemStats();
        this.equipmentIdentification = stats;
        
        // healthRegen manaRegen poison fire spellDamage xpBonus lootBonus walkSpeed health mana strength toughness stamina dexterity defence charisma
        
        // default speed of 2, then add 5% for each point including skill tree
        this.targetSpeed = 2 + (stats.walkSpeed + stats.dexterity + this.dexterity) * 0.05;
        
        this.manaMax = (15 + stats.mana + this.stamina * 2);
        this.healthMax = (20 + stats.health * 20 + this.toughness * 20);
        
        this.itemMagnet = stats.itemMagnet;
    }
    GetItemStats() {
        var slots = ["head", "chest", "hand", "finger", "legs", "feet", "special"];

        var iden = new Identifications();

        // sum all of the item attributes
        for (var slot of slots) {
            // there is an item there
            if (this[slot]) {
                // go through each property
                for (var property of playerAttributes) {
                    // if the property exists in the item
                    if (this[slot][property]) {
                        // add it
                        iden[property] += this[slot][property];
                    }
                }
            }
        }

        return iden;
    }
    Shoot() {
        // default values for no weapon
        var accuracy = 0.1,
            bulletCount = 1,
            damage = 1 + this.equipmentIdentification.strength * 0.1 + this.strength * 0.1,
            range = 75,
            delay = 0.5,
            projectile = "swordSlash";

        // if player has a weapon equipped
        if (player.hand) {
            accuracy = player.hand.accuracy;
            bulletCount = player.hand.bulletCount;
            damage = player.hand.damage * (1 + this.equipmentIdentification.strength * 0.1 + this.strength * 0.1);
            range = player.hand.range;
            delay = player.hand.fireRate;
            projectile = player.hand.projectile;
        }

        for (var i = 0; i < bulletCount; i++) {
            var mouse = new Vector(Input.mousePosition.x, Input.mousePosition.y);
            var _playerPos = camera.WorldToScreen(this.position);

            var direction = Vector.sub(mouse, _playerPos).normalized();
            direction = Vector.add(direction, Vector.random(accuracy));
            direction.setMagnitude(Utils.Random(4.5, 5.5));

            var bullet = new ProjectileEntity(item_icons[projectile], new Vector(this.position.x, this.position.y), item_scale[projectile], direction, damage, range, "player", "bounce");

            physics.AddEntity(bullet);
        }
        this.shootDelay = delay;
    }
    
    UpdatePlayerInformation(){
        var text = '';
        
        text += `<div class='ui horizontal divider'></div>`;
        text += `<div class='ui label purple fluid'>Level<div class='detail'>${this.level}</div></div>`;
        text += `<div class='ui horizontal divider'>Identifications</div>`;
        
        var stat = this.GetItemStats();
        
        stat.strength += this.strength;
        stat.toughness += this.toughness;
        stat.stamina += this.stamina;
        stat.dexterity += this.dexterity;
        stat.defence += this.defence;
        stat.charisma += this.charisma;
        
        for (var _s of playerAttributes){
            var val = stat[_s];
            var name = Utils.WordCase(Utils.IntoSentence(_s));
            text += "<br>";
            
            if (val > 0){
                text += `<div class='ui label green fluid' onmouseleave='player.Explain("");' onmouseover='player.Explain("${name}")'>${name}<div class='detail right-align'>${val}</div></div>`;
            } else {
                text += `<div class='ui label red fluid' onmouseleave='player.Explain("");' onmouseover='player.Explain("${name}")'>${name}<div class='detail right-align'>${val}</div></div>`;
            }
        }
        
        Utils.Get("playerInformationHTML").innerHTML = text;
    }
    Explain(what){
        var tooltips = {
            "Health Regen": "How much health regenerates per second. Each point gives 0.1 per second extra.",
            "Mana Regen": "How much mana regenerates per second. Each point gives 1% per second extra.",
            "Poison Resistance": "How quickly the poison ends. Poison goes away 10% faster per point.",
            "Spell Damage": "Extra damage for the spells.",
            "Xp Bonus": "You get extra 10% xp for each kill per point.",
            "Loot Bonus": "You get 10% chance of getting a better quality equipment per point.",
            "Walk Speed": "Each point gives you extra 5% walk speed.",
            "Health": "Each point gives you +20 to maximum health.",
            "Mana": "Each point gives you +1 to maximum mana.",
            "Strength": "Weapons deal extra 10% damage.",
            "Toughness": "Gives you extra +2 health per point.",
            "Stamina": "Extra +2 maximum mana per point.",
            "Dexterity": "Extra 5% walk speed per point.",
            "Defence": "You receive 2% less damage from all sources (min 50%) per point.",
            "Charisma": "You get 5% chance of receiving betteer quality equipment per point.",
            "Item Magnet": "Each point allows you to reach all items (including coins) 16px closer per point.",
        }
        
        Utils.Get("playerInfoTooltip").innerHTML = tooltips[what] || "Hover over a label to see what the identification does.";
    }
}
