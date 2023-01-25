var playerAttributes = "healthRegen manaRegen poisonResistance spellDamage xpBonus lootBonus walkSpeed health mana strength toughness stamina dexterity defence charisma itemMagnet".split(" ");

var swordNames = ["Dawn of Ruins","Convergence","Dirge","Flimsy Warblade","Skullforge Blade","Anguish Diamond Swiftblade","Fearful Copper Reaver","Shadow Strike, Pledge of Horrid Dreams","Betrayal, Rapier of Darkness","Betrayal, Doomblade of Shadow Strikes","The Facelifter","Ragespike","Shadowfang","Bloodvenom Quickblade","Wind-Forged Defender","Arched Adamantite Reaver","Yearning Bronze Mageblade","Shadowsteel, Jaws of Vengeance","Spada, Champion of the Flame","Spineripper, Oath of the Shadows","Aetherius","Echo","Storm-Weaver","Dire Razor","Hungering Warblade","Nightmare Bronze Warblade","Desolation Skeletal Guardian","Doomblade, Oath of Riddles","Sun Strike, Dawn of Blight","Savagery, Saber of the North","Silver Saber","Blind Justice","Suspension","Storm-Forged Mageblade","Brutal Guardian","Mourning Mithril Sabre","Arcane Skeletal Protector","Faithkeeper, Champion of Pride's Fall","Orenmir, Oath of Delusions","Retirement, Reaper of the Lasting Night","Catastrophe","King's Defender","Blind Justice","Smooth Quickblade","Extinction Longsword","Blood-Forged Adamantite Skewer","Antique Diamond Sculptor","Stormbringer, Edge of Wizardry","Blazeguard, Guardian of Eternal Justice","Piece Maker, Ravager of Hell's Games","Devine","Lightning","Piece Maker","Protector's Razor","Feral Sabre","Whistling Diamond Warblade","Unholy Bronze Shortsword","Persuasion, Call of Ashes","Piece Maker, Slayer of Hellish Torment","Trinity, Protector of Fury","Limbo","Aetherius","Stormbringer","Flimsy Blade","Glinting Skewer","Mended Skeletal Defender","Desolation Iron Sabre","Lament, Protector of the Undying","Draughtbane, Cry of Light's Hope","Valkyrie, Etcher of Slaughter"];
var wandNames = ["Silence","Oracle","Harmony","Prudence","Warp Globule","Stormguard Glaive","Furious Scepter","Deluge, Cry of Illumination","Trinity, Stone of Eternal Rest","Nymph, Pledge of the Dreadlord","Solarsong","Moonshard","Frenzy","Blightspore","Ruby Infused Aspect","Vanquisher Seal","Keeper's Idol","Fireweaver, Jewel of Hatred","Dawnlight, Jewel of the East","Hubris, Bauble of Reckoning","Nexus","Deluge","Snowflake","Dreambinder","Guardian's Beads","Crying Cage","Grieving Pouch","Clarity, Call of Traitors","Alakaslam, Breaker of Hope","Ataraxia, Seal of Shadow Strikes","Persuasion","Souleater","Ebony","Lightbane","Massive Charm","Warrior Urn","Retribution Talisman","Hubris, Stone of Cunning","Soulflare, Rod of Mountains","Consecration, Sculptor of the Covenant","Moonshard","Quicksilver","Riddle","Doombinder","Storm-Forged Harp","Banished Harp","Lustful Globule","Clarity, Crystal of the Caged Mind","Soulflare, Fan of Chaos","Necrolight, Skull of Eternal Bloodlust","Penance","Soulflare","Persuasion","Void","Wicked Satchel","Eternal Beacon","Malicious Juju","Stardust, Terror of Wasted Time","Alpha, Bringer of the Banished","Oathkeeper, Call of the Prince","Quicksilver","Trinity","Snowfall","Labyrinth","Battleworn Cane","Honor's Focus","Nightmare Trinket","Lull, Heirloom of Eternal Bloodlust","Phobia, Last Stand of Conquered Worlds","Starlight, Ender of Infinite Trials","Starfall","Apostle","Moonshadow","Mercy","Shamanic Orb","Wretched Satchel","Corrupted Harp","Soulshadow, Wand of the South","Crucifix, Defiler of Giants","Sleepwalker, Slayer of the Flame","Fireweaver","Consecration","Souleater","Phantomsong","Singed Juju","Spectral-Forged Glaive","Barbaric Paragon","Phantomdream, Allegiance of the End","Necrolight, Soul of Infinite Trials","Sanguine, Orb of the King","Persuasion","Deluge","Spire","Lazarus","Savage Knapsack","Arched Ornament","Gladiator Seal","Visage, Champion of Conquered Worlds","Twitch, Bag of Mercy","Crescent, Terror of the Undying"];
var chestPlateNames = ["Batteplate of Hallowed Punishment","Vest of Holy Souls","Bronzed Chestpiece of Condemned Visions","Chain Chestpiece of Immortal Trials","Ivory Tunic","Warrior's Golden Armor","Proud Cuirass of Truth","Banished Greatplate of the Mage","Emissary of the Isles","Birth of the West","Vestment of Timeless Whispers","Tunic of Ominous Dreams","Scaled Vest of Timeless Nights","Rugged Leather Vestment of Immortal Torment","Thunder Heavy Hide Chestguard","Vindication Linen Chestguard","Frenzied Raiment of Horrors","Vengeance Wraps of Broken Worlds","Protection of War","Whisper of Anguish","Garments of Timeless Souls","Raiment of Conquered Hope","Padded Chestguard of Distant Hell","Silk Wraps of Relentless Vengeance","Dragon Rugged Leather Raiment","Sorrow's Heavy Leather Tunic","Banished Breastplate of the Eclipse","Barbarian Wraps of Riddles","Last Hope of Delirium","Destroyer of Devotion","Chestplate of Dark Honor","Chestplate of Demonic Fire","Titanium Chestguard of Ancient Voices","Ebon Cuirass of Broken Dreams","Brutal Bronzed Breastplate","Barbarian Chain Batteplate","Fire Infused Breastplate of Awareness","Soldier's Chestplate of the Basilisk","Pact of the Forgotten","Chestplate of the Falling Sky","Armor of Frozen Magic","Chestguard of Haunted Hope","Obsidian Greatplate of Infinite Nightmares","Demon Vest of Fleeting Damnation","Hollow Ebon Breastplate","Champion's Scaled Breastplate","Hero's Greatplate of the Beast","Recruit's Greatplate of Thieves","Bane of Delusions","Crusader of Awareness"];
var legArmorNames = ["Greaves of Ancient Magic","Skirt of Haunted Nights","Silver Platelegs of Ominous Whispers","Obsidian Kilt of Conquered Misery","Ominous Demon Legplates","Nightmare Golden Skirt","Soldier's Legplates of Dismay","Howling Leggings of Demon Fire","Crusader of Reckoning","Blight of Clarity","Skirt of Fallen Hells","Kilt of Ending Fire","Hide Kilt of Blessed Sorrow","Hide Legguards of Conquered Power","Linen Britches","Hero's Padded Leggings","Wicked Legwraps of Ending Hope","Bloodcursed Kilt of the Lionheart","Deflector of the Lone Wolf","Bond of the Dreadlord","Skirt of Damned Warlords","Robes of Shattered Honor","Silk Skirt of Haunted Damnation","Hide Robes of Silent Nights","Desolation Heavy Hide Breeches","Restored Quilted Britches","Vengeful Breeches of Greed","Ritual Skirt of Dark Souls","Oath of Bloodshed","Glory of Dusk","Skirt of Condemned Trials","Legplates of Cursed Magic","Chain Kilt of Damned Wars","Scaled Platelegs of Haunted Illusions","Vindicator Adamantite Legguards","Grieving Mail Legplates","Ghastly Platelegs of the King","Banished Platelegs of Devotion","Blessing of Shifting Sands","Voice of Cataclysms","Leggings of Blessed Bloodlust","Legguards of Faded Honor","Demon Legguards of Dark Bloodlust","Bone Platelegs of Burning Hope","Doom's Bone Greaves","Defiled Adamantite Skirt","Trainee's Platelegs of Dragonsouls","Malicious Leggings of Oblivion","Defense of the Crown","Bane of the Emperor"];
var helmetNames = ["Headcover of Holy Illusions","Headcover of Hallowed Hells","Mithril Faceguard of Smoldering Honor","Demon Crown of Doomed Glory","Blood Infused Ivory Gaze","Bloodcursed Ivory Visage","Casque of Eternal Struggles","Prime Casque of the Prisoner","Favor of Arcane Magic","Crown of Ends","Mask of Demonic Kings","Helm of Ancient Memories","Heavy Hide Helm of Lost Hells","Linen Headguard of Fallen Freedom","Fusion Heavy Leather Coif","Mended Silk Coif","Prime Cowl of the Depth","Wicked Bandana of the End","Edge of Adventure","Promise of the Lasting Night"," Coif of Conquered Hope","Cowl of Haunted Warlords","Leather Headguard of Lost Fortunes","Heavy Leather Facemask of Cursed Hope","Defender's Heavy Leather Bandana","Vindictive Heavy Hide Hood","Trainee's Mask of the Victor","Reincarnated Headpiece of the Lionheart","Warden of Fury","Favor of the Emperor","Headguard of Infernal Hope","Headcover of Doomed Nights","Titanium Gaze of Holy Protection","Bronzed Casque of Infinite Misery","Legionnaire's Bronze Headguard","Fierce Demon Casque","Inherited Greathelm of Titans","Bloodcursed Jaws of Mysteries","Gaze of Discipline","Protector of Undoing","Headguard of Faded Warlords","Casque of Conquered Might","Ebon Headguard of Immortal Warlords","Ivory Helmet of Haunted Sorrow","Adamantite Headcover","Champion Steel Headcover","Thunderfury Faceguard of Fire Resist","Mourning Headcover of Clarity","Keeper of Demons","Crusader of Archery"];
var bootNames = ["Warboots of Binding Souls","Walkers of Infernal Glory","Bone Boots of Unholy Justice","Bone Walkers of Immortal Fortunes","Grieving Bronze Walkers","Savage Titanium Boots","Defiled Bone Boots","Gladiator Treads of Broken Dreams","Hungering Treads of Devotion","Captain's Walkers of Mysteries","Heels of Ancient Nightmares","Boots of Conquered Misery","Rugged Leather Footsteps of Relentless Hell","Silk Feet of Binding Warlords","Fortune's Embroided Footguards","Remorse Quilted Heels","Massive Leather Sandals","Spite Footpads of Paradise","Fearful Footpads of Danger","Baneful Footguards of the Gods","Treads of Blessed Magic","Boots of Frozen Nightmares","Leather Footguards of Sacred Fortune","Rugged Leather Boots of Timeless Misery","Ghastly Hide Treads","Brutality Linen Walkers","Defender's Scaled Sprinters","Hollow Footsteps of Mists","Vindicator Walkers of the Night Sky","Yearning Footpads of Water Walking","Feet of Burning Protection","Greaves of Shattered Nightmares","Mail Stompers of Eternal Punishment","Silver Sabatons of Shattered Power","Ghostly Chainmail Greatboots","Defiled Silver Boots","Dire Bone Walkers","Windsong Spurs of Blessed Fortune","Mourning Sabatons of the Whale","Desolation Sabatons of Fire Resist","Greaves of Demonic Justice","Stompers of Holy Vengeance","Bronze Walkers of Imminent Fires","Silver Greaves of Ominous Glory","Judgement Steel Warboots","Ebon Greatboots","Demon Walkers","Primitive Greatboots of the Forest","Wrathful Walkers of Might","Bloodcursed Boots of the Night Sky","Greatboots of Fleeting Justice","Greatboots of Relentless Warlords","Scaled Greatboots of Demonic Torment","Demon Footguards of Infernal Hell","Warrior Silver Spurs","Savage Titanium Sabatons","Cursed Steel Greaves","Spurs of Broken Bones","Treachery's Greatboots of Assassins","Military Boots of the Eagle"];
var ringNames = ["The Idle Mind","The Playful Twin","The Grateful Hum","The Illustrious Crest","The Grand Cross","The Angel Riddle Bracelet","The Stunning Core Amulet","The Jasper Lure Pendant","The Purity Breath Pin","The Pearl Dewdrop Amulet","The Velvet Flame","The Shadow Droplet","The Glistening Sun","The Bright Glamour","The Adored Panther","The Solar Trinket Pendant","The Lunar Bubble Pendant","The Jasper Tear Necklace","The Pristine Eye Ring","The Parallel Hope Bracelet","The Gifted Panther","The Grateful Blossom","The Feline Stone","The Curvy Image","The Faint Vow","The Humble Globe Choker","The Sapphire Prospect Necklace","The Adored Seal Bracelet","The Quiet Voice Ring","The Gracious Rainbow Amulet","The Silent Poem","The Amethyst Bauble","The Ocean Eye","The Earnest Flower","The Shadow Clover","The Serpentine Teardrop Bracelet","The Serpent Vision Pendant","The Coral Soul Necklace","The Velvet Spirit Bracelet","The Innocent Petal Pin","The Loyal Flame","The Handsome Oculus","The Illustrious Image","The Secret Wing","The Spotless Fan","The Scented Poem Pendant","The Virtuous Droplet Anklet","The Solar Soul Amulet","The Majestic Leaf Bracelet","The Free Mind Bracelet"];


var item_icons = {
    "Bronze coin": Utils.Get("bronze_coin"),
    "Silver coin": Utils.Get("silver_coin"),
    "Gold coin": Utils.Get("gold_coin"),
    "Diamond coin": Utils.Get("diamond_coin"),
    "Emerald coin": Utils.Get("emerald_coin"),
    // test items
    "Wand": Utils.Get("wand"),
    "Boots": Utils.Get("boots"),
    "Chestplate": Utils.Get("chestplate"),
    "Helmet": Utils.Get("helmet"),
    "Ring": Utils.Get("ring"),
    "Trousers": Utils.Get("trousers"),
    "Sword": Utils.Get("sword"),

    "heal": Utils.Get("healIcon"),

    "arrow": Utils.Get("arrow"),
    "swordSlash": Utils.Get("swordSlash"),
    "map": Utils.Get("map"),
    "shovel": Utils.Get("shovel"),
    
    "wood": Utils.Get("wood"),
    "stone": Utils.Get("stone"),
    "wheat": Utils.Get("wheat"),
    
    "frost_epilepsy": Utils.Get("frost_epilepsy"),
    "mans_cramp": Utils.Get("mans_cramp"),
    "lizard_paralysis": Utils.Get("lizard_paralysis"),
    
    "XP": Utils.Get("xp"),
    
    "arrow": Utils.Get("arrow"),
    "ball": Utils.Get("ball"),
    "bullet": Utils.Get("bullet"),
    "fire_bolt": Utils.Get("fire_bolt"),
    "fire_goo": Utils.Get("fire_goo"),
    "green_goo": Utils.Get("green_goo"),
    "ice_bolt": Utils.Get("ice_bolt"),
    "lightning_bolt": Utils.Get("lightning_bolt"),
    "ninja_star": Utils.Get("ninja_star"),
    "poison_arrow": Utils.Get("poison_arrow"),
    "purple_plasma": Utils.Get("purple_plasma"),
    "purple_projectile": Utils.Get("purple_projectile"),
    "web": Utils.Get("web"),
    "wiggle_arrow": Utils.Get("wiggle_arrow"),
    "yellow_star": Utils.Get("yellow_star")
}
var item_stackMax = {
    "Bronze coin": 1000,
    "Silver coin": 1000,
    "Gold coin": 1000,
    "Diamond coin": 1000,
    "Emerald coin": 1000,
    "shovel": 10,
    "wood": 1000,
    "stone": 1000,
    "wheat": 1000
}
var item_description = {
    "Bronze coin": "Used to buy various things, lowest value.",
    "Silver coin": "Shiny, worth 1000 bronze coins.",
    "Gold coin": "Even shinier, worth 1000 silver coins.",
    "Diamond coin": "Do not try to bite it, worth 1000 gold coins.",
    "Emerald coin": "No one will believe you have it, worth 1000 diamond coins.",
    
    "Sword": "The blade itself is bare. No markings can be found, any engravings could only diminish the strength of the blade.",
    "Wand": "This wand is made out of Spruce Wood, which often seeks out those who will serve a greater purpose.",
    "Boots": "These shoes fit you perfectly and make travelling less painful.",
    "Chestplate": "The breastplate is made from many layers, ensuring your protection.",
    "Helmet": "Protects your head.",
    "Ring": "Looks like a regular ring.",
    "Trousers": "The lower legs are protected by shin guards which have curved, pointed edges below the knee.",
    
    "frost_epilepsy": "Smells like an unwanted dog.",
    "mans_cramp": "I can feel it in my muscles.",
    "lizard_paralysis": "Very fragile bottle.",

    "heal": "Heals you for 40% of max health.",
    "map": "Shows you the location of the treasure. It reads: 600,800.",
    
    "wood": "A basic resource.",
    "stone": "A basic resource.",
    "wheat": "A basic resource.",
    
    "shovel": "Quest item."
}
var item_scale = {
    "Coin": new Vector(12, 12),

    "Wand": new Vector(16, 32),
    "Boots": new Vector(32, 10),
    "Chestplate": new Vector(32, 28),
    "Helmet": new Vector(20, 14),
    "Ring": new Vector(24, 24),
    "Trousers": new Vector(16, 24),
    
    "frost_epilepsy": new Vector(32,32),
    "mans_cramp": new Vector(32,32),
    "lizard_paralysis": new Vector(32,32),
    
    "arrow": new Vector(17,5),
    "ball": new Vector(22,13),
    "bullet": new Vector(19,6),
    "fire_bolt": new Vector(19,9),
    "fire_goo": new Vector(17,6),
    "green_goo": new Vector(19,7),
    "ice_bolt": new Vector(19,9),
    "lightning_bolt": new Vector(21,9),
    "ninja_star": new Vector(20,11),
    "poison_arrow": new Vector(16,5),
    "purple_plasma": new Vector(25,8),
    "purple_projectile": new Vector(18,7),
    "web": new Vector(19,22),
    "wiggle_arrow": new Vector(19,9),
    "yellow_star": new Vector(20,18),
    "swordSlash": new Vector(16,32),
    
    "map": new Vector(32,32),
    "shovel": new Vector(32,32),
    "particleSize": new Vector(32,32),
    "XP": new Vector(12,12),
    "wheat": new Vector(18,15),
    "stone": new Vector(11,9),
    "wood": new Vector(24,11),
}

var spell_cooldowns = {
    "heal": 10,
}
