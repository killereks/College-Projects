/*
TYPES OF QUESTS
================
Collect x of an item
Go to position x
Kill x of some monster

*/

class Quest {
    /**
     * [[Description]]
     * @param {array} tasks             what to do in the quest
     * @param {function} oncomplete     rewards and quest unlocking here
     */
    constructor(status,tasks,oncomplete, name){
        // (status)
        // 0 = not unlocked
        // 1 = unlocked not accepted yet
        // 2 = accepted
        // 3 = completed
        this.status = 0;
        this.tasks = tasks;
        this.oncomplete = oncomplete;
        this.progress = 0; // what task the player is on
        this.name = name;
    }
    static QuestUpdate(){
        if (player.quests.length > 0){
            if (Message.DialogOpen()) return;
            
            var quest = player.quests[player.questCurrent];
            // if quest is not accepted, leave
            // if (quest.status != 2) return;
            if (quest.progress >= quest.tasks.length){
                // completed the task
                quest.status = 3;
                quest.oncomplete();
                Quest.UpdateUI();
                player.quests.splice(player.questCurrent, 1);
                return;
            }
            var task = quest.tasks[quest.progress];
            // it's a task
            if (task instanceof Task){
                // walk to
                if (task.type == 0){
                    // no square root to make it faster
                    var distToTarget = Vector.sub(player.position,task.target).magnitudeSquared();
                    if (distToTarget <= 30*30){
                        if (task.ontrigger && task.messageTriggered == false){
                            task.ontrigger();
                            task.messageTriggered = true;
                        }
                        quest.progress++;
                        Quest.UpdateUI();
                    }
                    else {
                        this.QuestArrow(task.target);
                    }
                }
                // collect x items
                else if (task.type == 1){
                    if (player.inventory.HasItem(task.item,task.amount)){
                        var distToTarget = Vector.sub(player.position,task.target.position).magnitudeSquared();
                        if (distToTarget <= 30*30){
                            player.inventory.DeleteItem(task.item,task.amount);
                            // player.inventory.DeleteItem(); if anything breaks
                            if (task.ontrigger && task.messageTriggered == false){
                                task.ontrigger();
                                task.messageTriggered = true;
                            }
                            quest.progress++;
                            Quest.UpdateUI();
                        }
                        // once player has the item.
                        this.QuestArrow(task.target.position);
                    }
                }
                // kill monster
                else if (task.type == 2){
                    if (task.amount >= task.amountMax){
                        if (task.ontrigger && task.messageTriggered == false){
                            task.ontrigger();
                            task.messageTriggered = true;
                        }
                        quest.progress++;
                        Quest.UpdateUI();
                    }
                }
            }
            // it's a cutscene
            else if (task instanceof Cutscene){
                camera.Cinematic();
                player.enableControls = false;
                
                var distToTarget = Vector.sub(task.npc.position,task.target).magnitudeSquared();
                // move npc to the target
                task.npc.MoveTo(task.target,2);
                // if there is a dialog say it
                if (task.dialog){
                    var pos = Vector.subY(task.npc.position,task.npc.halfScale.y)
                    camera.DrawText(task.dialog,pos);
                }
                // if npc has stopped to the count down
                if (distToTarget <= 32*32){
                    task.delay -= deltaTime;
                    // cutscene done
                    if (task.delay <= 0){
                        task.npc.velocity = new Vector(0,0);
                        if (task.ontrigger){
                            task.ontrigger();
                        }
                        quest.progress++;
                    }
                }
            }
        }
    }
    static QuestArrow(target){
        // calculate time for the sine function
        var time = (new Date()).getTime() * 0.004;
        // direction to target
        var dirToTarget = Vector.sub(target,player.position);
        // target position on the screen
        // (world -> screen)
        // calculate the arrow position
        var arrowPos = camera.WorldToScreen(target);
        // padding on the arrow to the canvas
        var borderSize = 25;
        var isOffScreen = arrowPos.x <= 0 || arrowPos.x >= canvas.width || arrowPos.y <= 0 || arrowPos.y >= canvas.height;
        
        // default sprite (arrow)
        var sprite = Utils.Get("arrowRight");
        var rotation = dirToTarget.heading();
        var scale = new Vector(30*1.3,26*1.3);
        
        if (isOffScreen){
            arrowPos.x = Utils.Clamp(arrowPos.x, borderSize, canvas.width - borderSize);
            arrowPos.y = Utils.Clamp(arrowPos.y, borderSize, canvas.height - borderSize);
            // they have to be in the same dimension (unit)
            var targetScreen = camera.WorldToScreen(target);
            
            rotation = Vector.sub(targetScreen,arrowPos).heading();
        } else {
            sprite = Utils.Get("redExclamation");
            rotation = 0;
            // make the exclamation mark go up and down rather than
            // side to side
            dirToTarget = new Vector(0,1);
            // make it appear above the target
            arrowPos = Vector.add(arrowPos, new Vector(0,-50));
            // scale for the exclamation mark
            scale = new Vector(5*3,16*3);
        }
        // need to convert to world coordinates
        // as the camera only accepts world coordinates
        arrowPos = camera.ScreenToWorld(arrowPos);
        // offset for the arrow to 'animate'
        var offset = Vector.mult(dirToTarget.normalized(), Math.sin(time) * 10);
        
        // arrow itself
        var arrow = new Entity(sprite,Vector.add(arrowPos,offset),scale);
        arrow.rotation = rotation;
        
        camera.DrawSingle(arrow);
    }
    static UpdateUI(){
        var list = Utils.Get("questList");
        
        var html = "";
        
        // <a class="item crossed-out">Talk to Oklo</a>
        // <a class="item">???</a>
        
        var currentQuest = player.quests[player.questCurrent];
        // 3 means finished, if quest is finished do not display anything.
        
        Utils.Get("questName").innerHTML = currentQuest.name;
        
        if (currentQuest && currentQuest.status != 3){
            // start at 1 because the tasks include description for action
            // that will be completed on the next one.
            var i = 0;
            for (var task of currentQuest.tasks){
                var extra = "";
                // kill
                if (task.type == 2){
                    extra += " ["+task.amount+"/"+task.amountMax+"]";
                }
                if (task.description){
                    // task has been done
                    if (currentQuest.progress > i){
                        html += `<a class='item crossed-out grey-text'><p class='questItem-finished'>${task.description+extra}</p></a>`;
                    }
                    // Current task
                    else if (currentQuest.progress == i){
                        html += `<a class='item black-text'>${task.description+extra}</a>`;
                    }
                    // unknown (future task)
                    else {
                        // i dont want the player to see how much of the task is left
                        break;
                        html += `<a class='item black-text'>???</a>`;
                    }
                }
                i++;
            }
        }
        
        list.innerHTML = html;
    }
    static KilledMonster(entity){
        if (player.quests.length < 1) return;
        if (player.questCurrent >= player.quests.length) return;
        
        var quest = player.quests[player.questCurrent];
        if (quest.progress >= quest.tasks.length) return;
        
        var task = quest.tasks[quest.progress];
        if (task.target == entity.name){
            task.amount++;
            Quest.UpdateUI();
            Quest.QuestUpdate();
        }
    }
}

class Task {
    // target can be position (where to walk)
    // or item (how much to collect)
    // or monster (how many to kill)
    // ====
    // type
    // ====
    // 0 = walk
    // 1 = item collect
    // 2 = kill a monster
    constructor(type,description,target,ontrigger,item,amount){
        this.type = type; // what task is it (walk/kill/get)
        this.target = target; // npc or vector depending on type
        this.amount = amount || 0; // how many monsters to kill or items to collect
        this.ontrigger = ontrigger; // what happens after this is done (function)
        this.messageTriggered = false; // make sure the message pops up once
        this.description = description; // description of the quest
        this.item = item; // item to get
        this.amountMax = 0; // used for tracking progress
        // kill monster task
        if (type == 2){
            this.amountMax = amount;
            this.amount = 0;
        }
    }
    static Walk(description, target,ontrigger){
        return new Task(0, description, target, ontrigger);
    }
    static ItemCollect(description, npc, item, amount, ontrigger){
        return new Task(1, description, npc, ontrigger, item, amount);
    }
    static Kill(description, name, amount, ontrigger){
        return new Task(2, description, name, ontrigger,"",amount);
    }
}

class Cutscene {
    /**
     * Creates a cutscene
     * @param {Entity} npc       The npc reference
     * @param {Vector} target      Target location
     * @param {Number} delay     How long to wait before next event
     * @param {string} dialog    What the NPC is saying ?
     */
    constructor(npc,target,delay,dialog,ontrigger){
        this.npc = npc;
        this.target = target;
        this.delay = delay || 0;
        this.dialog = dialog || "";
        this.ontrigger = ontrigger || undefined;
    }
}

var Message = {
    queue: [],
    // header = The title of the msg
    // description = text inside
    // speaker = name of character speaking (optional);
    newMessage: function(speaker,text){
        this.queue.push({
            speaker: speaker,
            text: text,
            speed: 25, // ms per letter
            finished: false,
        })
    },
    Display: function(){
        player.enableControls = false;
        if (this.queue.length > 0){
            Utils.Get("dialogContainer").style.display = "block";
            var msg = this.queue[0];
            
            var text = "";
            var finishedText = "";
            var index = 0;
            
            Utils.Get("dialogSpeaker").innerHTML = msg.speaker;
            // type out the message, since
            // Display is private when x runs, 
            // we need to pass it into argument
            // also if i do this.MessageHTML(msg);
            // inside the this is actually reference
            // to the function hence the argument
            function x(self){
                text += msg.text.charAt(index);
                Utils.Get("dialogMsg").innerHTML = text;
                
                if (index++ < msg.text.length){
                    setTimeout(x,msg.speed,self);
                } else {
                    msg.finished = true;
                }
            }
            
            x(this);
        }
    },
    Close: function(){
        Utils.Get("dialogContainer").style.display = "none";
        player.enableControls = true;
        Quest.UpdateUI();
    },
    Next: function(){
        if (this.queue.length <= 0){
            this.Close();
            return;
        }
        var fastSpeed = 1;
        if (this.queue[0].speed == fastSpeed || this.queue.length == 1){
            // next dialog
            this.queue.splice(0,1);
            this.Display();
        } else {
            this.queue[0].speed = 1;
        }
    },
    Skip: function(){
        this.queue = [];
        this.Close();
    },
    DialogOpen: function(){
        return this.queue.length > 0;
    }
}

function newTaskTemp(){
    var tasks = [];
    tasks.push(Task.Walk("Talk to the Farmer.", farmer.position, function(){
        Message.newMessage("Farmer","Yes! I was looking for somebody like you, I need your help.");
        Message.newMessage("You","Sure, what is it?");
        Message.newMessage("Farmer","Come here, look at this lake. It's a disaster. All of my fish died! Help me do something about it. Perhaps the monster specialist will know what has happened to them.");
        Message.Display();
    }))
    tasks.push(Task.Walk("Find Monster Specialist.", monsterSpecialist.position, function(){
        Message.newMessage("Monster Specialist","Waaat brings yer 'ere adventurer?");
        Message.newMessage("You","The farmer is complaining about...");
        Message.newMessage("Monster Specialist","Ah dat auld farmer only complainin' aboyt everythin'.");
        Message.newMessage("You","It's serious this time!");
        Message.newMessage("Monster Specialist","'oi serious?");
        Message.newMessage("You","Look, all of his fish died in the lake, you have to tell me what caused them to die out.");
        Message.newMessage("Monster Specialist","It must 'av been <b>elephant blisters</b>. 'owever de only way ter decontaminate de lake is ter create a poshun av <b>frost epilepsy</b>. oi 'av never created any poshuns before so yer 'ill nade ter find de witch.");
        Message.Display();
    }))
    tasks.push(Task.Walk("Find the Witch.", witch.position, function(){
        Message.newMessage("Witch","Oi! Stop right there, what the hell do you want?");
        Message.newMessage("You","I need a potion of Frost Epilepsy");
        Message.newMessage("Witch","Shhh! Don't be so loud, I have just lost an ingredient required to make it. Get me a <b>Man's Cramp</b>.");
        Message.newMessage("You","Where can I find it?");
        Message.newMessage("Witch","I don't care how you find it, hurry up.");
        Message.Display();
    }))
    tasks.push(Task.Walk("Find information about Man's Cramp", monsterSpecialist.position, function(){
        Message.newMessage("Monster Specialist", "Waaat de 'ell ye com back for.");
        Message.newMessage("You","Where can I find <b>Man's Cramp</b>?");
        Message.newMessage("Monster Specialist","Oi 'av sum 'ahahah, oi'm gonna guess dat <b>Living Mounds</b> 'av dat, they lure victims into a place wha naw wan can find dem an' den they steal their breath, cramps an' eyes. de victim den can try an' escape but withoyt eyes 'tis pure murder. naw wan 'as lived ter tell de tale.");
        Message.newMessage("You","I'm definitelly not looking forward to that.");
        Message.newMessage("Monster Specialist","Oi don't tink yer 'ill be lookin' at al' 'ahaha.");
        Message.Display();
    }))
    tasks.push(Task.ItemCollect("Get Man's Cramp", witch, "mans_cramp",1,function(){
        Message.newMessage("Witch","Give me that! Yeees! Now I can finally make that <b>Quivering Scurvy</b> potion I needed!");
        Message.newMessage("You","What about me? I need the potion for the farmer!");
        Message.newMessage("Witch","The farmer you say? I never cared about him enough, I never cared enough about anyone.");
        Message.newMessage("Witch","Alright, I will make you the potion just to get you out of here, I'm already sick of you.");
        Message.newMessage("Witch","However I need <b>Lizard Paralysis</b> for my magical taser. That way the stupid villagers won't get in my way again. That should be very easy to get.");
        Message.Display();
    }))
    tasks.push(Task.ItemCollect("Find Lizard Paralysis", witch, "lizard_paralysis", 1, function(){
        Message.newMessage("Witch","Alright, give me 17.3 seconds.");
        Message.newMessage("Witch","Here you go, now I don't want to see you again, GET OUT!");
        Message.Display();
        physics.newItem("frost_epilepsy", 1, witch.position, 0);
    }))
    tasks.push(Task.ItemCollect("Bring the potion back to the farmer", farmer, "frost_epilepsy", 1, function(){
        Message.newMessage("Farmer","I have no idea how you managed to get it but well done.");
        Message.newMessage("Farmer","Now off you go, you can go and do something");
        Message.newMessage("You","...");
        Message.newMessage("Farmer","You except me to give you something? Fine. I hope you like wheat because that's all I have.");
        Message.Display();
        for (var i = 0; i < 20; i++){
            physics.newItem("wheat", 1, farmer.position, 0);
        }
    }))
    
    player.quests.push(new Quest(2,tasks,function(){
        for (var i = 0; i < 100; i++){
            physics.newXP(1, farmer.position);
        }
    },"Lake Disaster"));
    
    Quest.UpdateUI();
}
setTimeout(newTaskTemp,1000);