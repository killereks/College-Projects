class Inventory {
    constructor(slots) {
        this.slotCount = slots;
        this.items = [];

        this.mouseOverTooltip = false;
        this.visible = false;
        this.sorting = false;

        this.selectedSlot = undefined;
    }
    AddItem(item) {
        // inventory is not full
        var added = false;
        
        for (var i = 0; i < this.items.length; i++) {
            var curItem = this.items[i];
            // found the item in inventory
            if (curItem.name == item.name) {
                var toFullStack = curItem.stackMax - curItem.amount;
                if (toFullStack == 0) continue;
                added = true;
                if (item.amount > toFullStack) {
                    item.amount -= toFullStack;
                    curItem.amount += toFullStack;
                } else {
                    curItem.amount += item.amount;
                    item.amount = 0;
                    break;
                }
            }
        }
        // item is new
        if (!added && item.amount > 0) {
            if (this.items.length < this.slotCount) {
                this.items.push(item);
            }
        }
        // new item that can be equipped and the player
        // has this slot empty, auto equip it!
        var autoEquip = false;
        if (item.slot && (!player[item.slot])){
            autoEquip = true;
        }
        if (item.quality){
            try {
                if (player[item.slot].quality < item.quality){
                    autoEquip = true;
                }
            } catch {}
        }
        try {
            if (autoEquip){
                this.selected(i);
                this.equipSelected();
                camera.NewAnimatedText("Equipped!", player.position, "#eaeaea");
            }
        } catch {}
        
        this.Update();
    }
    HasItem(name, amount) {
        var amountInInventory = 0;
        for (var curItem of this.items) {
            if (curItem.name == name) {
                amountInInventory += curItem.amount;
            }
        }
        return amountInInventory >= amount;
    }
    DeleteItemSlot(item){
        this.items.splice(item,1);
    }
    DeleteItem(name,amount) {
        for (var item of this.items){
            if (item.name == name){
                if (item.amount > amount){
                    item.amount -= amount;
                    break;
                } else {
                    amount -= item.amount;
                    item.amount = 0;
                }
            }
        }
        this.Update();
    }
    DropItem(item, amount) {
        var amountToDrop = amount;
        var itemToDrop = undefined;
        for (var curItem of this.items) {
            if (curItem == item) {
                itemToDrop = curItem;
                if (curItem.amount > amount) {
                    curItem.amount -= amount;
                    break;
                } else {
                    amount -= curItem.amount;
                    curItem.amount = 0;
                }
            }
        }
        if (itemToDrop) {
            //var droppedItem = new ItemWorld(itemToDrop.texture, player.position, itemToDrop.scale,_itemData);
            for (var i = 0; i < amountToDrop; i++){
                var _itemData = Object.create(itemToDrop);
                _itemData.amount = 1;
                
                var droppedItem = new ItemWorld(_itemData, player.position, _itemData.displayName, _itemData.description);
                physics.AddEntity(droppedItem);
            }

            Utils.Get("inventoryTooltip").style.display = "none";
        }
        
        this.selectedSlot = undefined;

        this.Update();
    }
    DropItemID(id) {
        if (id >= this.items.length) return console.warn("Inventory DropItemID: Index out of range.");

        //this.DropItem(this.items[id], this.items[id].amount);
        this.DropItem(this.items[id], 1);
    }
    Full() {
        return this.items.length == this.slotCount;
    }
    ItemFits(item) {
        if (this.items.length < this.slotCount) {
            return true;
        }
        for (var curItem of this.items) {
            if (curItem.name == item.name) {
                if (curItem.amount + item.amount <= curItem.stackMax) {
                    return true;
                }
            }
        }
        return false;
    }
    deleteEmptyItems() {
        for (var i = this.items.length - 1; i >= 0; i--) {
            var item = this.items[i];
            if (item.amount <= 0) {
                this.items.splice(i, 1);
            }
        }
    }
    Update() {
        this.deleteEmptyItems();
        this.UpdateCurrencyDisplay();
        this.updateEquipped();
        player.EquipmentChanged();

        if (!this.visible) {
            $("#playerInventory").slideUp(300);
            $("#inventoryContainer").slideUp(300);
        } else {
            $("#playerInventory").slideDown(300);
            $("#inventoryContainer").slideDown(300);
        }

        var text = "";

        for (var i = 0; i < player.inventory.slotCount; i++) {
            var item = player.inventory.items[i];
            text += this.getSlotHTML(item);
        }
        
        text += `<div class='clear'></div>`;

        Utils.Get("inventory").innerHTML = text;
    }
    getSlotHTML(item) {
        var inside = ``;
        var text = "";

        if (item) {
            var i = this.items.indexOf(item);
            var quality = Inventory.NumberToQuality(item.quality) || "";
            // item image
            inside += `<img src="${item.icon.src}">`;
            // quality box
            inside += `<div class="quality-box ${quality}"></div>`;
            // the number showing amount
            inside += `<div class="item-amount">${item.amount > 1 ? item.amount : ""}</div>`;

            var classes = i == this.selectedSlot ? "selected " : "";
            classes += quality + " ";
            // this creates an inventory slot that has event listeners
            // such as mouse over and out for tooltips
            // onclick for swapping
            // and style for different item qualities
            text += `<div class="inventory-slot ${classes}" onclick=player.inventory.selected(${i}); onmouseover="player.inventory.tooltipIN(${i});" onmouseout="player.inventory.tooltipOUT(${i});" oncontextmenu='player.inventory.DropItemID(${i})'>${inside}</div>`;
        } else {
            text += `<div class=inventory-slot></div>`
        }

        return text;
    }
    UpdateCurrencyDisplay() {
        var allCoins = ["Bronze coin", "Silver coin", "Gold coin", "Diamond coin", "Emerald coin"];
        var index = 0;
        var text = "";
        for (var coin of allCoins) {
            text += `<img src="${item_icons[coin].src}" class='currency-icon'>${Utils.Simplify(player.coins[index])} `;
            index++;
        }
        Utils.Get("currency").innerHTML = text;
    }
    getTooltip(item) {
        var text = "";

        if (item instanceof Weapon) {
            text += "Damage: " + item.damage + "<br>";
            text += "Fire rate: " + item.fireRate + "<br>";
            text += "Range: " + item.range + "<br>";
            text += "Bullet count: " + item.bulletCount + "<br>";
            text += "Accuracy: " + item.accuracy + "<br>";
        }
        if (item instanceof Armor) {
            text += item.description + "<br>";
        }

        text += Identifications.getTooltip(item);

        return text;
    }
    tooltip(item) {
        var text = "";
        var quality = Inventory.NumberToQuality(item.quality);
        quality = quality ? quality.toUpperCase() : "";

        var attributes = "";
        var value = "Value: " + item.cost;
        var canEquip = true;
        var canDrop = true;
        
        if (item instanceof Weapon) {
            var DPS = (1/item.fireRate * item.bulletCount * item.damage).toFixed(1);
            attributes += "Damage: " + item.damage.toFixed(1) + " (DPS: "+DPS+")<br>";
            attributes += "Fire rate: " + (1/item.fireRate).toFixed(1) + " / sec<br>";
            attributes += "Range: " + item.range.toFixed(0) + " pixels<br>";
            attributes += "Projectiles count: " + item.bulletCount.toFixed(0) + "<br>";
            attributes += "Accuracy: " + item.accuracy.toFixed(1) + "<br>";
            attributes += "Projectile: "+Utils.Image(item.projectile,"attribute-projectile")+"<br>";
            attributes += "<hr>";
        }

        attributes += Identifications.getTooltip(item);

        Utils.Get("inventoryItemName").innerHTML = item.displayName;
        Utils.Get("inventoryItemDescription").innerHTML = item.description;
        Utils.Get("inventoryAttributesContainer").innerHTML = attributes;
        Utils.Get("inventoryValue").innerHTML = value;
        Utils.Get("equipBtn").style.display = canEquip ? "block" : "none";
        Utils.Get("dropBtn").style.display = canDrop ? "block" : "none";
    }
    updateEquipped() {
        var slots = ["head", "chest", "hand", "finger", "legs", "feet", "special"];

        for (var slot of slots) {
            var _slot = player[slot];

            if (_slot) {
                var quality = Inventory.NumberToQuality(_slot.quality);
                var classes = quality + " ";

                var selected = this.selected == slot;

                classes += selected ? "selected" : "";

                var html = `<div class="${classes} equipped-item-container" onclick="player.inventory.selected('${slot}');" onmouseover="player.inventory.tooltipIN('${slot}')" onmouseout="player.inventory.tooltipOUT('${slot}');"><img src="${_slot.icon.src}"></div>`;
            }
            
            Utils.Get("player_" + slot).innerHTML = _slot ? html : Utils.SentenceCase(slot);
        }
    }
    tooltipIN(index) {
        // is a number
        if (!isNaN(index)) {
            var canBeEquipped = this.items[index].slot != undefined;

            Utils.Get("dropBtn").style.display = "block";

            this.tooltip(this.items[index]);
            if (canBeEquipped) {
                Utils.Get("equipBtn").innerHTML = "Equip";
                Utils.Get("equipBtn").style.width = "49%";
                Utils.Get("dropBtn").style.width = "49%";
            } else {
                Utils.Get("dropBtn").style.width = "100%";
                Utils.Get("equipBtn").style.display = "none";
            }
        }
        // it's equipped on player
        else {
            this.tooltip(player[index]);
            Utils.Get("equipBtn").innerHTML = "Unequip";
            Utils.Get("dropBtn").style.display = "none";
            Utils.Get("equipBtn").style.width = "100%";
        }
        var tooltip = Utils.Get("inventoryTooltip");
        // decide what direction to take (make sure tooltip goes towards the center of the screen)
        var dirX = Math.sign(window.innerWidth / 2 - Input.mousePosition.x);

        tooltip.style.display = "block";
        tooltip.style.left = (Input.mousePosition.x - 120 + 100 * dirX) + "px";
        tooltip.style.top = (Input.mousePosition.y + 20) + "px";
    }
    tooltipOUT(index) {
        if (index == this.selectedSlot && index != undefined) return;
        if (this.mouseOverTooltip) return;
        Utils.Get("inventoryTooltip").style.display = "none";
    }
    mouseOver(newValue) {
        this.mouseOverTooltip = newValue;
    }
    unequipSelected() {
        var item = player[this.selectedSlot];
        var fits = this.ItemFits(item);
        if (fits) {
            var copy = Utils.CopyClass(item);
            this.AddItem(copy);
            player[this.selectedSlot] = undefined;
        } else {
            var copy = Utils.CopyClass(item);

            var item = new ItemWorld(copy, player.position);
            physics.AddEntity(item);

            player[this.selectedSlot] = undefined;
        }
        this.updateEquipped();
        Utils.Get("inventoryTooltip").style.display = "none";
    }
    equipSelected() {
        /*
        =========
          SLOTS  
        =========
        head
        chest
        hand
        finger
        legs
        feet
        special
        */
        // trying to unequip something
        // (trying to equip something that is equipped)
        if (isNaN(this.selectedSlot)) {
            this.unequipSelected();
            return;
        }

        var item = this.items[this.selectedSlot];
        if (!item) return console.warn("Inventory EquipSelected: Error invalid item.");
        var slot = item.slot;

        var slotEmpty = player[item.slot] == undefined;

        if (slotEmpty) {
            // equip the item
            var itemCopy = Utils.CopyClass(item);

            player[item.slot] = itemCopy;

            this.DeleteItemSlot(this.selectedSlot);

            this.Update();
        } else {
            // there is an item equipped in that spot, swap their positions
            var itemCopy = Utils.CopyClass(item);
            var equipped = Utils.CopyClass(player[item.slot]);

            player[item.slot] = itemCopy;
            this.DeleteItemSlot(this.selectedSlot);
            this.AddItem(equipped);
        }

        this.tooltipOUT();

        Utils.Get("inventoryTooltip").style.display = "none";
        this.selectedSlot = undefined;
        this.Update();
    }
    dropSelected() {
        this.DropItemID(this.selectedSlot);
        this.selectedSlot = undefined;
        this.tooltipOUT();
    }
    selected(index) {
        if (this.selectedSlot != undefined) {
            if (isNaN(index) || isNaN(this.selectedSlot)) {
                // trying to swap equippable with inventory item
                this.selectedSlot = undefined;
                this.Update();
                return;
            }
            this.Swap(index, this.selectedSlot);
            this.selectedSlot = undefined;
        } else {
            this.selectedSlot = index;
        }
        this.Update();
    }
    Swap(index1, index2) {
        var temp = this.items[index1];
        this.items[index1] = this.items[index2];
        this.items[index2] = temp;
        this.Update();
    }
    Sort(how) {
        // "a-z"
        // "quality"
        // "price"
        if (how == "a-z") {
            this.items.sort(function (a, b) {
                if (a.displayName < b.displayName) return -1;
                if (a.displayName > b.displayName) return 1;
                return 0;
            })
        } else if (how == "quality") {
            this.items.sort(function (a, b) {
                return b.quality - a.quality;
            })
        } else if (how == "price") {
            this.items.sort(function (a, b) {
                return b.cost - a.cost;
            })
        }
        else if (how == "slot"){
            this.items.sort(function(a,b){
                if (a.slot < b.slot) return -1;
                if (a.slot > b.slot) return 1;
                return 0;
            });
        }
        /*if (this.sorting) return;
        this.sorting = true;
        var changed = true;
        function _sort(self,how){
            changed = false;
            for (var i = 0; i < self.items.length - 1; i++){
                var changePositions = self.ShouldSwap(how,self.items[i],self.items[i+1]) > 0;
                if (changePositions){
                    Utils.Swap(self.items,i,i+1);
                    changed = true;
                }
            }
            if (changed){
                self.Update();
                setTimeout(_sort,25,self,how);
            } else {
                self.sorting = false;
            }
        }
        _sort(this,how);*/
        
        this.Update();
    }
    
    ShouldSwap(how,a,b){
        if (how == "a-z") {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        } else if (how == "quality") {
            return b.quality - a.quality;
        } else if (how == "price") {
            return b.cost - a.cost;
        }
        else if (how == "slot"){
            if (a.slot < b.slot) return -1;
            if (a.slot > b.slot) return 1;
            return 0;
        }
    }

    static QualityToNumber(quality) {
        var qualities = ["common", "rare", "veryrare", "epic", "legendary", "mythical"];
        return qualities.indexOf(quality);
    }
    static NumberToQuality(number) {
        return ["common", "rare", "veryrare", "epic", "legendary", "mythical"][number];
    }
    static canvasTooltipIN(text, pos, quality) {
        var bound = canvas.getBoundingClientRect();
        var bounding = new Vector(bound.left, bound.top);

        var itemOnScreen = camera.WorldToScreen(pos);

        // canvas to window coordinates
        var coordinates = new Vector(bounding.x, bounding.y);
        coordinates = Vector.add(coordinates, itemOnScreen);

        var canvTooltip = Utils.Get("canvasTooltip");

        canvTooltip.style.left = coordinates.x + "px";
        canvTooltip.style.top = coordinates.y + "px";
        canvTooltip.style.display = "block";
        canvTooltip.innerHTML = text;
        canvTooltip.className = quality || "no-quality";
    }
    static canvasTooltipOUT() {
        Utils.Get("canvasTooltip").style.display = "none";
        Utils.Get("canvasTooltip").className = "";
    }
}

// this will be displayed in the inventory and not in the game world
class Item {
    constructor(name, amount) {
        this.name = name;
        this.icon = item_icons[name];
        if (this.icon == undefined) this.icon = Utils.Get(name.toLowerCase());
        this.stackMax = item_stackMax[name] || 1;
        this.amount = amount || 1;
        this.description = item_description[name];
        this.cost = (1000 * Math.random());
    }
    ApplyAttributes(attributes) {
        for (var attribute in attributes) {
            var value = attributes[attribute];
            this[attribute] = value;
        }
    }
}
class Weapon extends Item {
    constructor(name, damage, firerate, range, bulletcount, accuracy, quality, projectile, dispName, dispDesc) {
        /*
          QUALITIES
          0 = Common       #ECF0F1
          1 = Rare         #85C1E9
          2 = Very rare    #2874A6
          3 = Epic         #E74C3C
          4 = Legendary    #F1C40F
          5 = Mythical     #8E44AD
        */
        super(name, 1);
        this.damage = damage;
        this.fireRate = firerate;
        this.range = range;
        this.bulletCount = bulletcount;
        this.accuracy = accuracy;
        this.quality = quality || 0;
        this.slot = "hand";
        this.projectile = projectile;
        this.displayName = dispName || "";
        this.description = dispDesc || "";
    }
}
class Armor extends Item {
    constructor(name, slot, quality, dispName, dispDesc) {
        super(name, 1);
        // type of the armor, e.g. chestplate, ring
        this.slot = slot;
        this.quality = quality;
        this.displayName = dispName || "";
        this.description = dispDesc || "";
    }
}
class Spell extends Item {
    constructor(name, quality) {
        super(name, 1);

        this.slot = "special";
        this.quality = quality;
    }
}

class Identifications {
    constructor() {
        this.healthRegen = 0;
        this.manaRegen = 0;
        this.poisonResistance = 0;
        // these are % so they should be decimals
        this.spellDamage = 0;
        this.xpBonus = 0;
        this.lootBonus = 0;
        this.walkSpeed = 0;
        this.health = 0;
        this.mana = 0;
        // these are +x to skillpoints
        this.strength = 0; // damage
        this.toughness = 0; // health amount
        this.stamina = 0; // mana amount
        this.dexterity = 0; // speed bonus
        this.defence = 0; // defence
        this.charisma = 0; // extra quest loot bonus
        
        this.itemMagnet = 0;
    }
    random(amount, max) {
        var copy = playerAttributes.slice();

        for (var i = 0; i < amount; i++) {
            var index = Utils.Random(0, copy.length - 1);

            var use = copy.splice(index, 1);

            this[use] = Utils.Random(1, max);
        }
    }
    static getTooltip(item) {
        // javascript does not allow iteration over class, 
        // so i need to have an array with property names

        // used to see what actually changed,
        // (we don't want to tooltip something
        // that has a default value which means
        // no change) so we create a new
        // class that has all default values
        // and perform some logic
        var iden = new Identifications();

        var text = "";

        for (var identification of playerAttributes) {
            // has been changed
            if (item[identification] != iden[identification] && item[identification] != undefined) {
                var extra = ``;
                // if the player has an item equipped
                // in that spot then compare both things
                var slot = player[item.slot];
                var equippedIden;
                // has an item in that slot
                if (slot) {
                    equippedIden = slot[identification];
                }
                // if not trying to compare equipped item with itself
                if (item != slot) {
                    var thisItem = item[identification];

                    var amount = 0;
                    if (equippedIden == undefined) {
                        amount = thisItem;
                    } else {
                        amount = thisItem - equippedIden;
                    }
                    
                    if (amount == 0) {
                        extra += `<span class='bold outline text-orange'> (=)</span>`
                    } else {
                        // this is doing red/green text based
                        // on the value and adding + for positive
                        // numbers
                        extra += `<span class='bold outline ${amount < 0 ? "text-red" : "text-green"}'> (${amount > 0 ? "+"+amount : amount})</span>`;
                    }
                }
                
                text += Utils.WordCase(Utils.IntoSentence(identification)) + ": " + item[identification] + extra + "<br>";
            }
        }

        return text;
    }
}
