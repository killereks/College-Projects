class Building extends Entity {
    constructor(texture, position, name, completionTime){
        
        var _name = name.toLowerCase();
        
        var cost = {
            "woodhut": {
                "wood": 100,
                "stone": 0,
                "wheat": 0
            },
            "farm": {
                "wood": 20,
                "stone": 0,
                "wheat": 0
            },
            "cave": {
                "wood": 250,
                "stone": 500,
                "wheat": 0
            },
            "marketplace": {
                "wood": 500,
                "stone": 1000,
                "wheat": 2000
            },
            "workshop": {
                "wood": 500,
                "stone": 1000,
                "wheat": 2000
            }
        }
        var canBuy = true;
        if (!player.inventory.HasItem("wood", cost[_name].wood)){
            canBuy = false;
        }
        if (!player.inventory.HasItem("stone", cost[_name].stone)){
            canBuy = false;
        }
        if (!player.inventory.HasItem("wheat", cost[_name].wheat)){
            canBuy = false;
        }
        if (!canBuy){
            camera.NewAnimatedText("Not enough materials.", camera.ScreenToWorld(Input.mousePosition), "white");
        }
        
        if (canBuy){
            player.inventory.DeleteItem("wood", cost[_name].wood);
            player.inventory.DeleteItem("stone", cost[_name].stone);
            player.inventory.DeleteItem("wheat", cost[_name].wheat);
        }
        
        super(texture, position, new Vector(64,64));
        
        var resources = {
            "woodhut": "wood",
            "farm": "wheat",
            "cave": "stone"
        }
        var buildTimes = {
            "woodhut": 40,
            "farm": 30,
            "cave": 60,
            "marketplace": 1,
            "workshop": 1
        }
        var timeMax = {
            "woodhut": 64,
            "farm": 32,
            "cave": 128,
            "marketplace": 1,
            "workshop": 1,
        }
        var value = {
            "wood": 2,
            "wheat": 1,
            "stone": 4,
        }
        
        this.name = name;
        this.time = 0;
        this.timeMax = timeMax[_name] || 1;
        this.buildTime = buildTimes[_name];
        this.buildTimeMax = buildTimes[_name];
        this.buildingIconIndex = 0;
        this.storageMax = 5;
        this.storage = 0;
        this.resource = resources[_name];
        this.perCompletion = 1;
        this.resourceValue = value[this.resource];
        this.destroy = false;
        
        this.speedPrice = 0;
        this.amountPrice = 0;
        this.capacityPrice = 0;
        
        // stupid javascript doesn't let me exit the class without calling 'super' first which creates the entity,
        // SO I NEED TO DELETE IT RIGHT AFTER PLACING
        if (!canBuy){
            this.destroy = true;
        }
    }
    
    static GetSpeedPrice(){
        return Math.ceil(50.0 / hoverBuildingSelected.timeMax);
    }
    static GetAmountPrice(){
        return Math.ceil(100.0 * Math.pow(hoverBuildingSelected.perCompletion, 3));
    }
    static GetCapacityPrice(){
        return Math.ceil(1 * Math.pow(hoverBuildingSelected.storageMax / 4, 2));
    }
    
    static UpgradeSpeed(){
        // speed uses diamond (3)
        var price = Building.GetSpeedPrice();
        if (player.coins[3] >= price){
            player.coins[3] -= price;
            hoverBuildingSelected.timeMax *= 0.5;
            hoverBuildingSelected.time *= 0.5;
        }
        Building.UpdateUI(hoverBuildingSelected);
    }
    static UpgradeAmount(){
        // amount uses emerald (4)
        var price = Building.GetAmountPrice();
        if (player.coins[4] >= price){
            player.coins[4] -= price;
            hoverBuildingSelected.perCompletion++;
        }
        Building.UpdateUI(hoverBuildingSelected);
    }
    static UpgradeCapacity(){
        // capacity uses gold (2)
        var price = Building.GetCapacityPrice();
        if (player.coins[2] >= price){
            player.coins[2] -= price;
            hoverBuildingSelected.storageMax *= 2;
        }
        Building.UpdateUI(hoverBuildingSelected);
    }
    
    static SellResources(){
        player.coins[0] += hoverBuildingSelected.storage * hoverBuildingSelected.resourceValue;
        hoverBuildingSelected.storage = 0;
    }
    
    Update(){
        if (this.buildTime > 0){
            this.buildTime -= 1/60;
            return;
        }
        
        if (!this.resource) return;
        
        if (this.time < this.timeMax){
            this.time += 1/60;
            if (this.time > this.timeMax){
                this.time = this.timeMax;
            }
        }
        
        if (this.time >= this.timeMax && this.storage < this.storageMax){
            this.time = 0;
            this.completed();
        }
    }
    completed(){
        this.storage += this.perCompletion;
        if (this == hoverBuildingSelected){
            Building.UpdateUI(this);
        }
    }
    static Build(texture, position, name, completionTime){
        position.round(buildingSnapTo);
        var ent = new Building(texture, position, name, completionTime);
        
        var canPlace = Building.CanPlace(position);
        
        if (canPlace){
            buildings.push(ent);
            camera.AddEntity(ent);
            map.qtree.insert(ent);
            player.selectedBuilding = "";
        }
    }
    static CanPlace(pos){
        var canPlace = false;
        // create a temporary entity to test for collisions
        var ent = new Entity(undefined, pos, new Vector(64,64));
        // is in build area
        for (var area of buildAreas){
            if (physics.intersectionFull(area,ent)){
                canPlace = true;
                break;
            }
        }
        // is not intersecting with other buildings
        for (var build of buildings){
            if (physics.intersection(build, ent)){
                canPlace = false;
                break;
            }
        }
        // intersection with the player
        if (physics.intersection(player,ent)){
            canPlace = false;
        }
        
        return canPlace;
    }
    static Manager(){
        if (player.selectedBuilding) return;
        
        var pos = camera.ScreenToWorld(Input.mousePosition);
        
        var buildingsInRange = [];
        var entitiesOnScreen = camera.drawEntities.query(camera.QueryInCamera());
        
        for (var entity of entitiesOnScreen){
            if (entity instanceof Building){
                buildingsInRange.push(entity);
            }
        }
        
        var buildingHover = undefined;
        
        for (var build of buildingsInRange){
            if (physics.pointInRect(pos, build) && build.buildTime <= 0){
                buildingHover = build;
                break;
            }
        }
        
        hoverBuildingSelected = buildingHover;
        
        if (buildingHover != undefined){
            this.UpdateUI(buildingHover);
        } else {
            $('#buildingManager').hide(300);
        }
    }
    static CanvasClick(){
        this.Manager();
    }
    static UpdateUI(building){
        $('#buildingManager').show(300);
        
        Utils.Get("build_name").innerHTML = building.name;
        Utils.Get("resource_name").innerHTML = building.resource || "-";
        Utils.Get("resource_value").innerHTML = (building.storage || "-") + "/" + (building.storageMax || "-");
        Utils.Get("build_speed").innerHTML = building.resource ? building.timeMax+"s" : "-";
        Utils.Get("build_amount").innerHTML = building.resource ? building.perCompletion : "-";
        
        Utils.Get("building_speed_price").innerHTML = Building.GetSpeedPrice() + Utils.Image("diamond_coin","image-padding");
        Utils.Get("building_amount_price").innerHTML = Building.GetAmountPrice() + Utils.Image("emerald_coin","image-padding");
        Utils.Get("building_capacity_price").innerHTML = Building.GetCapacityPrice() + Utils.Image("gold_coin","image-padding");
        
        var available = "#4CAF50",
            notAvailable = "#E74C3C";
        
        Utils.Get("speedBuyBtn").style.backgroundColor = Building.GetSpeedPrice() > player.coins[3] ? notAvailable : available;
        Utils.Get("amountBuyBtn").style.backgroundColor = Building.GetAmountPrice() > player.coins[4] ? notAvailable : available;
        Utils.Get("capacityBuyBtn").style.backgroundColor = Building.GetCapacityPrice() > player.coins[2] ? notAvailable : available;
        
        Utils.Get("sell_price").innerHTML = hoverBuildingSelected.resourceValue * hoverBuildingSelected.storage + Utils.Image("bronze_coin","image-padding");
        
        var marketplace = Building.HasBuilding("marketplace");
        var workshop = Building.HasBuilding("workshop");
        
        Utils.Get("sell_resources_parent").style.display = marketplace && building.resource ? "block" : "none";
        Utils.Get("marketplaceBuild").style.display = marketplace ? "none" : "inline-block";
        Utils.Get("workshopBuild").style.display = workshop ? "none" : "inline-block";
        
        var _name = building.name.toLowerCase();
        
        var getResourcesEnabled = _name != "workshop" && _name != "marketplace";
        // if get resources are disabled this means that the building does not produce
        // a resource therefore doesn't require upgrades
        Utils.Get("getResourcesParent").style.display = getResourcesEnabled ? "block" : "none";
        Utils.Get("buildingUpgrades").style.display = getResourcesEnabled ? "block" : "none";
        Utils.Get("craftingSettings").style.display = _name == "workshop" ? "block" : "none";
    }
    static CraftPrices(){
        var prices = [];
        
        var amount = Utils.Get("idenCraftAmount").value;
        var level = Utils.Get("idenCraftLevel").value;
        
        if (isNaN(amount) || isNaN(level) || amount < 0 || level < 0) return null;
        
        amount = parseInt(amount);
        level = parseInt(level);
        
        for (var i = 0; i <= 5; i++){
            prices.push((i+1) * Math.pow(amount+level+1,(i+amount+level+1)/4));
        }
        return prices;
    }
    static CraftUpdate(){
        var prices = Building.CraftPrices();
        if (prices != null){
            for (var i = 0; i <= 5; i++){
                Utils.Get("craft"+i+"price").innerHTML = Utils.Simplify(prices[i]) + Utils.Image("bronze_coin","image-padding");
                Utils.Get("craft"+i+"price").style.backgroundColor = prices[i] >= player.coins[0] ? "#F5B7B1" : "#A3E4D7";
            }
        }
    }
    static Craft(index){
        var prices = Building.CraftPrices();
        if (player.coins[0] >= prices[index]){
            player.coins[0] -= prices[index];
            
            var types = [
                {
                    "slot": "head",
                    "name": "Helmet",
                    range: 5,
                }, {
                    "slot": "chest",
                    "name": "Chestplate",
                    range: 41,
                }, {
                    "slot": "legs",
                    "name": "Trousers",
                    range: 0,
                }, {
                    "slot": "feet",
                    "name": "Boots",
                    range: 4,
                }, {
                    "slot": "finger",
                    "name": "Ring",
                    range: 23,
                }
            ];
            var type = types[Utils.Random(0,types.length-1)];
            // it has already been checked before, no need to do it again
            var amount = Utils.Get("idenCraftAmount").value;
            var level = Utils.Get("idenCraftLevel").value;
            
            var ident = new Identifications();
            ident.random(amount, level);
            var name = type.name;
            if (type.range != 0){
                name = type.name.toLowerCase()+Utils.Random(0,type.range);
            }
            
            physics.newArmor(player.position, type.slot, name, index, ident, "Hand Crafted Piece Of Armour!", "You crafted them! Yay, go you!");
        }
    }
    static HasBuilding(name){
        for (var b of buildings){
            if (b.name.toLowerCase() == name.toLowerCase()){
                return true;
            }
        }
        return false;
    }
    static GetResources(){
        var name = hoverBuildingSelected.resource;
        
        physics.newItem(name, hoverBuildingSelected.storage, player.position, 0.1);
        hoverBuildingSelected.storage = 0;
        this.Manager();
    }
    static Destroy(){
        Building.DestroySpecific(hoverBuildingSelected);
    }
    static DestroySpecific(build){
        // remove from buildings array
        buildings.splice(buildings.indexOf(build),1);
        // remove from the map
        map.qtree.delete(build);
        // remove from the camera
        camera.map.qtree.delete(build);
        // remove completely from physics and camera
        removeEntity(build);
        // we have nothing selected now
        hoverBuildingSelected = undefined;
        // update the manager
        this.Manager();
    }
}
class BuildArea extends Entity {
    constructor(pos1, scale){
        super(Utils.Get("buildArea"), pos1, scale);
    }
    Render(){
        ctx.globalAlpha = 0.3;
        camera.DrawImage(this.texture, this.position,this.scale);
        ctx.globalAlpha = 1;
    }
}