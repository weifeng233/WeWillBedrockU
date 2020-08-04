/*
BUILD INFO:
  dir: source/dev
  target: source/main.js
  files: 12
*/



// file: header.js

/*
 * __        __ __        ___ _ _ ____           _                _    _   _
 * \ \      / /_\ \      / (_) | | __ )  ___  __| |_ __ ___   ___| | _| | | |
 *  \ \ /\ / / _ \ \ /\ / /| | | |  _ \ / _ \/ _` | '__/ _ \ / __| |/ / | | |
 *   \ V  V /  __/\ V  V / | | | | |_) |  __/ (_| | | | (_) | (__|   <| |_| |
 *    \_/\_/ \___| \_/\_/  |_|_|_|____/ \___|\__,_|_|  \___/ \___|_|\_\\___/
 */

var Level = ModAPI.requireGlobal("Level");

var BuildConfig = {
	get(key) {
		let buildConfig = FileTools.ReadJSON(__dir__ + "build.config");
		if (key) return buildConfig[key];
		return buildConfig;
	},
	set(key, value) {
		let buildConfig = this.get();
		buildConfig[key] = value;
		FileTools.WriteJSON(__dir__ + "build.config", buildConfig, true);
	},
	getResourceDir(type) {
		let resources = this.get("resources");
		for (r in resources)
			if (resources[r].resourceType == type) return __dir__ + resources[r].path;
	}
}

Math.randomRange = function (min, max, float) {
	let random = Math.random() * (max - min) + min;
	return float ? random : Math.round(random);
}

Player.getSpeed = function () {
	let vel = Player.getVelocity();
	return Math.sqrt(vel.x * vel.x + vel.z * vel.z);
}
Player.getBlockPos = function () {
	let pos = Player.getPosition();
	return {x: pos.x ^ 0, y: pos.y ^ 0, z: pos.z ^ 0};
}
Player.getSneaking = function () {
	return Entity.getSneaking(Player.get());
}




// file: callback.js

Callback.addCallback("LevelSelected", function () {
	BCore.worldSeed = Level.getSeed();
});


Callback.addCallback("DestroyBlockStart", function (coords, block) {
	if (Player.getCarriedItem().id == ItemID.bedrock_pickaxe) {
		if (block.id == 7 || block.id == BlockID.bedrock_anvil)
			Callback.invokeCallback("UseBedrockPickaxe", coords);
		else
			Game.prevent();
	}
});

Callback.addCallback("DestroyBlock", function (coords, block) {
	let item = Player.getCarriedItem();
	if (item.id == ItemID.bedrock_pickaxe) {
		if (Game.getGameMode() != 1 && block.id == 7)
			World.drop(coords.x, coords.y, coords.z, 7, 1, 0);
		item.data += !Game.getGameMode();
		Player.setCarriedItem(item.id, item.count, item.data, item.extra);
		if (item.data > 64) {
			Player.setCarriedItem(0, 0, 0);
			World.playSoundAtEntity(Player.get(), "random.break", 1);
		}
	}

	if (item.extra && item.extra.getBoolean("canBreak")) {
		Player.setCarriedItem(item.id, item.count, 0, item.extra);
	}
});

Callback.addCallback("ItemUse", function (coords, item, block) {
	if (item.extra && item.extra.getBoolean("canBreak")) {
		Player.setCarriedItem(item.id, item.count, 0, item.extra);
	}
});

Callback.addCallback("PlayerAttack", function (attcker, victim) {
	let item = Player.getCarriedItem();
	if (item.extra && item.extra.getBoolean("canBreak"))
		Game.prevent();
	if (item.id == ItemID.bedrock_sword)
		Callback.invokeCallback("UseBedrockSword", victim);
});

Callback.addCallback("tick", function () {
	if (Player.getSpeed() > 1.8) {
		let pos = Player.getBlockPos();
		World.destroyBlock(pos.x, pos.y - 1, pos.z, false);
		Game.message("Wow!");
	}
});




// file: translation.js

Translation.addTranslation("Bedrock ", {zh: "基岩"});

Translation.addTranslation("Bedrock Anvil", {zh: "基岩砧"});

Translation.addTranslation("Bedrock Food", {zh: "基岩食物"});
Translation.addTranslation("Bedrock Compass", {zh: "基岩指南针"});
Translation.addTranslation("Bedrock Pickaxe", {zh: "基岩镐"});
Translation.addTranslation("Bedrock Sword", {zh: "基岩剑"});

Translation.addTranslation("Unbreakable", {zh: "无法损坏"});

Translation.addTranslation("Start searching, please wait a monent", {zh: "已开始搜索 请稍等一会"});
Translation.addTranslation("The nearest bedrock magic area is", {zh: "最近的基岩魔法区域在"});
Translation.addTranslation("Can't find the bedrock magic area.", {zh: "无法在附近找基岩魔法区域"});
Translation.addTranslation("Only can use in the overworld", {zh: "只可在主世界使用"});

Translation.addTranslation("Sleep Now! You shouldn't stay late", {zh: "给爷去睡觉，你不适合修仙"});




// file: core/core.js

//Bedrock Core
var BCore = {
	setUnbreakable(item) {
		let extra = item.extra, name = Item.getName(item.id, item.data);
		if (!extra)
			extra = new ItemExtraData();
		name = extra.getCustomName() ? extra.getCustomName() : "§r§b" + name;
		extra.setCustomName(name + "§r\n§7" + Translation.translate("Unbreakable"));
		if (!extra.getBoolean("canBreak"))
			extra.putBoolean("canBreak", true);
		return {id: item.id, count: item.count, data:item.data, extra: extra};
	},

	canBreakBedrock(coords) {
		let dimension = Player.getDimension();
		if (dimension < 2)
			return dimension ? coords.y > 4 && coords.y < 123 : coords.y > 4;
		return false;
	},

	worldSeed: 0,

	isMagicArea(cx, cz) { //Magic area uses magic number to generate, lol.
		let seed = cx * 0x1f1f1f1f ^ cz;
		seed ^= this.worldSeed;
		seed ^= seed >> 15;
		seed ^= seed << 9;
		seed ^= seed >> 14;
		seed = (seed << 52) | (seed >> 12);
		return !(seed % 3871);
	},

	findNearestArea(coords) {
		let cx = coords.x / 16 ^ 0, cz = coords.z / 16 ^ 0;
		let n = 128;
		let lengths = [], targetCoords = [];
		for (let xx = cx - n; xx < cx + n; xx++) {
			for (let zz = cz - n; zz < cz + n; zz++) {
				if (BCore.isMagicArea(xx, zz)) {
					targetCoords.push([xx * 16, zz * 16]);
					lengths.push(Math.sqrt((xx - cx) * (xx - cx) + (zz - cz) * (zz - cz)));
				}
			}
		}
		return targetCoords[lengths.indexOf(Math.min.apply(null, lengths))];
	},

	food: {},
	addFood(namedId, name, texture, params) {
		IDRegistry.genItemID(namedId);
		name = Translation.translate("Bedrock ") + Translation.translate(name);
		let food = Item.createItem(namedId, name, texture, params);
		food.setProperties(JSON.stringify({
			use_animation: "eat",
			use_duration: 128,
			food: {
				nutrition: params.food,
				saturation_modifier: "supernatural",
				is_meat: params.meat || false,
				can_always_eat: true,
				effects: [{
					name: "resistance",
					chance: 1.0,
					duration: 300,
					amplifier: 4
				}]
			}
		}));
		food.setUseAnimation(1);
		food.setMaxUseDuration(128);
		food.setGlint(true);
		this.food[params.id] = ItemID[namedId];
	},

	tool: [],
	addTool(id) {
		this.tool.push(id);
	}
}

BCore.tool = [256, 257, 258, 269, 270, 271, 273, 274, 275, 276, 277, 278, 279, 284, 285, 286, 290, 291, 293, 294];

ToolAPI.canBedrockEnchant = function (id) {
	return BCore.tool.indexOf(id) != -1;
}




// file: core/structure.js

var Structure = {
	structures: {},
	structureDir: BuildConfig.getResourceDir("resource") + "structure/", 
	addStructure(name, blocks) {
		if (this.structures[name])
			throw 'Cant add the "' + name + '" as a structure name, it has been added.';
		this.structures[name] = blocks;
	},
	setStructureDir(file) {
		this.structureDir = file;
	},
	loadStructureFromFile(fileName, name) {
		let blocks = FileTools.ReadJSON(this.structureDir + fileName + ".json");
		this.addStructure(name || fileName, blocks);
	},
	compareStructure(coords, name) {
		let blocks = this.structures[name];
		for (block in blocks) {
			let x = coords.x + blocks[block][0],
			y = coords.y + blocks[block][1],
			z = coords.z + blocks[block][2];
			let id = eval(blocks[block][3]), data = blocks[block][4];
			let block_r = World.getBlock(x, y, z); //世界中实际放置的方块

			if (block_r.id != id || (data !== undefined && data != -1 && data != block_r.data))
				return false;
		}
		return true;
	},
	setupStructure(coords, name) {
		let blocks = this.structures[name];
		for (block in blocks) {
			let x = coords.x + blocks[block][0],
			y = coords.y + blocks[block][1],
			z = coords.z + blocks[block][2];
			World.setBlock(x, y, z, eval(blocks[block][3]), blocks[block][4]);
		}
	}
}




// file: core/world_gen.js

//World Generation[世界生成]

Callback.addCallback("GenerateChunkUnderground", function (chunkX, chunkZ, ramdom, dismension) {
	if (BCore.isMagicArea(chunkX, chunkZ) && !dismension) {
		let coords = GenerationUtils.randomCoords(chunkX, chunkZ, 5, 5);
		World.setBlock(coords.x, coords.y, coords.z, 7);
	}
});




// file: block/bedrock_anvil.js

IDRegistry.genBlockID("bedrock_anvil");
var bedrockAnvil = Block.createSpecialType({
	opaque: false,
	lightlevel: 9,
	lightopacity: 0,
	destroytime: -1,
	explosionres: 8000
});
Block.createBlock("bedrock_anvil", [{name: "Bedrock Anvil", texture: [["bedrock", 0]], inCreative: true}], bedrockAnvil);
Block.setBlockMaterial("bedrock_anvil", "unbreaking");
Block.setShape(BlockID.bedrock_anvil, 2 / 16, 0 / 16, 2 / 16, 14 / 16, 12 / 16, 14 / 16);

Recipes.addShaped({id: BlockID.bedrock_anvil, data: 0, count: 1}, ["   ", "BRB", " A "], ["B", 7, 0, "R", 152, 0, "A", 145, -1]);


{
	let render = new ICRender.Model();
	let model = BlockRenderer.createModel();
	model.addBox(2 / 16, 0 / 16, 2 / 16, 14 / 16, 1 / 16, 14 / 16, 7, 0);
	model.addBox(4 / 16, 1 / 16, 4 / 16, 12 / 16, 4 / 16, 12 / 16, 7, 0);
	model.addBox(6 / 16, 4 / 16, 6 / 16, 10 / 16, 6 / 16, 10 / 16, 7, 0);
	model.addBox(3 / 16, 6 / 16, 5 / 16, 13 / 16, 10 / 16, 11 / 16, 7, 0);
	model.addBox(12 / 16, 10 / 16, 5 / 16, 13 / 16, 12 / 16, 10 / 16, 7, 0);
	model.addBox(3 / 16, 10 / 16, 6 / 16, 4 / 16, 12 / 16, 11 / 16, 7, 0);
	model.addBox(4 / 16, 10 / 16, 10 / 16, 13 / 16, 12 / 16, 11 / 16, 7, 0);
	model.addBox(3 / 16, 10 / 16, 5 / 16, 12 / 16, 12 / 16, 6 / 16, 7, 0);
	model.addBox(4 / 16, 10 / 16, 6 / 16, 12 / 16, 11 / 16, 10 / 16, 152, 0);
	render.addEntry(model);
	BlockRenderer.setStaticICRender(BlockID.bedrock_anvil, 0, render);
}

//加载祭坛结构
Structure.loadStructureFromFile("bedrock_altar");

TileEntity.registerPrototype(BlockID.bedrock_anvil, {
	defaultValues: {
		item: {
			id: 0,
			data: 0
		},
		rotation: 0,
		canEnchant: false,
		enchantType: null,
		enchantProgress: 0
	},
	anim: null,
	init() {
		this.anim = new Animation.Item(this.x + .5, this.y + .78125, this.z + .5);
		this.anim.describeItem({
			id: this.data.item.id,
			count: 1,
			data: this.data.item.data
		});
		this.anim.load();
	},
	destroyRedstone() {
		World.destroyBlock(this.x + 1, this.y, this.z, false);
		World.destroyBlock(this.x - 1, this.y, this.z, false);
		World.destroyBlock(this.x, this.y, this.z + 1, false);
		World.destroyBlock(this.x, this.y, this.z - 1, false);
	},
	replaceBedrock() {
		World.setBlock(this.x + 1, this.y - 1, this.z, 1);
		World.setBlock(this.x + 2, this.y - 1, this.z, 1);
		World.setBlock(this.x - 1, this.y - 1, this.z, 1);
		World.setBlock(this.x - 2, this.y - 1, this.z, 1);
		World.setBlock(this.x, this.y - 1, this.z + 1, 1);
		World.setBlock(this.x, this.y - 1, this.z + 2, 1);
		World.setBlock(this.x, this.y - 1, this.z - 1, 1);
		World.setBlock(this.x, this.y - 1, this.z - 2, 1);
	},
	tick() {
		this.data.rotation++;
		this.anim.setItemRotation(-Math.PI / 2, (this.data.rotation % 360) / 180 * Math.PI, 0);
		this.anim.load();

		if (this.data.canEnchant) {
			this.data.enchantProgress++;
			if (this.data.enchantProgress >= 100 && this.data.enchantType === 0) {
				this.data.canEnchant = false, this.data.enchantType = null, this.data.enchantProgress = 0;
				this.data.item.id = BCore.food[this.data.item.id];
				this.anim.describeItem({
					id: this.data.item.id,
					count: 1,
					data: this.data.item.data,
					size: 0.5
				});
				this.anim.load();
			} else if (this.data.enchantProgress >= 400 && this.data.enchantType === 1) {
				if (this.data.enchantProgress == 400)
					World.playSound(this.x, this.y, this.z, "bedrock.levelup", 1);

				if (this.data.enchantProgress >= 500) {
					Math.random() > 0.8 && this.replaceBedrock();
					this.destroyRedstone();
					this.data.canEnchant = false, this.data.enchantType = null, this.data.enchantProgress = 0;
					this.data.item = BCore.setUnbreakable(this.data.item);

					if (this.data.item.id == 276 && this.data.item.extra && this.data.item.extra.getEnchantLevel(9) == 5) {
						this.data.item = {
							id: ItemID.bedrock_sword,
							data: 0,
							count: 1
						};
						this.anim.describeItem({
							id: this.data.item.id,
							count: 1,
							data: this.data.item.data,
							size: 0.5
						});
						this.anim.load();
					}

					for (let n = 0; n < Math.randomRange(9, 18); n++) {
						let rV = Math.randomRange(-0.5, 0.5, true); //Random Vector
						Particles.addParticle(33, this.x, this.y + .5, this.z, rV, rV, rV, 60);
					}
				}
			}
		}
	},
	click(id, count, data) {
		Game.prevent();
		if (this.data.item.id || Player.getSneaking()) {
			let dropEntity = World.drop(this.x + .75, this.y + 1, this.z + .5, this.data.item.id, 1, this.data.item.data, this.data.item.extra);
			Entity.setVelocity(dropEntity, 0, 0.05, 0);
			this.data.item = {};
		}
		if (!Player.getSneaking()) {
			this.data.item = Player.getCarriedItem();
			!Game.getGameMode() && Player.decreaseCarriedItem();
			this.anim.describeItem({
				id: id,
				count: 1,
				data: data,
				size: 0.5,
				rotation: [-Math.PI / 2, 0, 0]
			});
			this.anim.load();

			if ((BCore.food[id] || ToolAPI.canBedrockEnchant(id)) && BCore.isMagicArea(this.x / 16 ^ 0, this.z / 16 ^ 0) && Structure.compareStructure({
					x: this.x,
					y: this.y,
					z: this.z
				}, "bedrock_altar")) {
				if (BCore.food[id]) this.data.enchantType = 0;
				else if (ToolAPI.canBedrockEnchant(id)) this.data.enchantType = 1;
				this.data.canEnchant = true;
			}
		} else {
			this.anim.describeItem({
				id: 0,
				count: 1,
				data: 0
			});
			this.anim.load();
		}
	},
	destroy() {
		if (this.data.item.id) {
			let dropEntity = World.drop(this.x + .75, this.y + 1, this.z + .5, this.data.item.id, 1, this.data.item.data, this.data.item.extra);
			Entity.setVelocity(dropEntity, 0, 0.05, 0);
			this.data.item = {};
		}
		//不知为何destroy之后动画不会消失，只能乱来了 //********写完了zheka刚好修复这个bug
		this.anim.describeItem({
			id: 0,
			count: 1,
			data: 0,
		});
		this.anim.load();
		this.anim.destroy();
	}
});




// file: item/food.js

var foodData = [
	{id: 260, name: {en: "Apple", zh: "苹果"}, texture: "apple", food: 4},
	{id: 297, name: {en: "Bread", zh: "面包"}, texture: "bread", food: 5},
	{id: 319, name: {en: "Raw Porkchop", zh: "生猪排"}, texture: "porkchop", food: 3, meat: true},
	{id: 320, name: {en: "Cooked Porkchop", zh: "熟猪排"}, texture: "cooked_porkchop", food: 8, meat: true},
	{id: 349, name: {en: "Raw cod", zh: "生鳕鱼"}, texture: "fish", food: 2, meat: true},
	{id: 350, name: {en: "Cooked cod", zh: "熟鳕鱼"}, texture: "cooked_fish", food: 5, meat: true},
	{id: 357, name: {en: "Cookie", zh: "曲奇"}, texture: "cookie", food: 2},
	{id: 360, name: {en: "Melon Slice", zh: "西瓜片"}, texture: "melon", food: 2},
	{id: 363, name: {en: "Raw Beef", zh: "生牛肉"}, texture: "beef", food: 3, meat: true},
	{id: 364, name: {en: "Cooked Beef", zh: "牛排"}, texture: "cooked_beef", food: 8, meat: true},
	{id: 366, name: {en: "Cooked Chicken", zh: "熟鸡肉"}, texture: "cooked_chicken", food: 6, meat: true},
	{id: 391, name: {en: "Carrot", zh: "胡萝卜"}, texture: "carrot", food: 3},
	{id: 392, name: {en: "Potato", zh: "马铃薯"}, texture: "potato", food: 1},
	{id: 393, name: {en: "Baked Potato", zh: "烤马铃薯"}, texture: "baked_potato", food: 5},
	{id: 400, name: {en: "Pumpkin Pie", zh: "南瓜派"}, texture: "pumpkin_pie", food: 8},
	{id: 411, name: {en: "Raw Rabbit", zh: "生兔肉"}, texture: "rabbit", food: 2, meat: true},
	{id: 412, name: {en: "Cooked Rabbit", zh: "熟兔肉"}, texture: "cooked_rabbit", food: 5, meat: true},
	{id: 423, name: {en: "Raw Mutton", zh: "生羊肉"}, texture: "mutton", food: 2, meat: true},
	{id: 424, name: {en: "Cooked Mutton", zh: "熟羊肉"}, texture: "cooked_mutton", food: 6, meat: true},
	{id: 457, name: {en: "Beetroot", zh: "甜菜根"}, texture: "beetroot", food: 1},
	{id: 460, name: {en: "Raw Salmon", zh: "生鲑鱼"}, texture: "salmon", food: 2, meat: true},
	{id: 461, name: {en: "Tropical Fish", zh: "热带鱼"}, texture: "clownfish", food: 1, meat: true},
	{id: 463, name: {en: "Cooked Salmon", zh: "熟鲑鱼"}, texture: "cooked_salmon", food: 6, meat: true},
	{id: 464, name: {en: "Dried Kelp", zh: "干海带"}, texture: "dried_kelp", food: 1},
	{id: 477, name: {en: "Sweet Berries", zh: "甜浆果"}, texture: "sweet_berries", food: 2}
];

var bedrockFoods = foodData.map(function (food) {
	Translation.addTranslation(food.name.en, {zh: food.name.zh});
	BCore.addFood("bedrock_" + food.texture, food.name.en, {name: "bedrock_" + food.texture}, {id: food.id, food: food.food, meat: food.meat});
	return ItemID["bedrock_" + food.texture];
});

Item.addCreativeGroup("bedrock_food", Translation.translate("Bedrock Food"), bedrockFoods);




// file: item/bedrock_compass.js

IDRegistry.genItemID("bedrock_compass");
Item.createItem("bedrock_compass", "Bedrock Compass", {name: "bedrock_compass"}, {stack: 1});
Item.setGlint("bedrock_compass", true);

Recipes.addShaped({id: ItemID.bedrock_compass, data: 0, count: 1}, [" B ", "BCB", " B "], ["B", 7, 0, "C", 345, 0]);

Item.registerUseFunction("bedrock_compass", function (coords) {
	if (!Player.getDimension()) {
		Game.message(Translation.translate("Start searching, please wait a monent"));
		Threading.initThread("BedrockAreaFinding", function () {
			let target = BCore.findNearestArea(coords);
			if (target)
				Game.message(Translation.translate("The nearest bedrock magic area is") + " x:" + target[0] + " y:? " + "z:" + target[1]);
			else
				Game.message(Translation.translate("Can't find the bedrock magic area."));
		});
	} else
		Game.message(Translation.translate("Only can use in the overworld"));
});




// file: item/bedrock_pickaxe.js

IDRegistry.genItemID("bedrock_pickaxe");
Item.createItem("bedrock_pickaxe", "Bedrock Pickaxe", {name: "bedrock_pickaxe"}, {stack: 1});
Item.setToolRender(ItemID.bedrock_pickaxe, true);
Item.setMaxDamage(ItemID.bedrock_pickaxe, 64);
Item.setEnchantType(ItemID.bedrock_pickaxe, 1024, 25);

Recipes.addShaped({id: ItemID.bedrock_pickaxe, data: 0, count: 1}, ["BBB", " S ", " S "], ["B", 7, 0, "S", 280, 0]);

Item.addRepairItemIds("bedrock_pickaxe", [7]);

Callback.addCallback("UseBedrockPickaxe", function (coords) {
	let extra = Player.getCarriedItem().extra, effecienty = 0;
	if (extra !== null)
		effecienty = extra.getEnchantLevel(15);
	Block.setTempDestroyTime(BlockID.bedrock_anvil, 1 / (2 + effecienty * effecienty));
	if (BCore.canBreakBedrock(coords))
		Block.setTempDestroyTime(7, 1 / (2 + effecienty * effecienty));
});





// file: item/bedrock_sword.js

IDRegistry.genItemID("bedrock_sword");
Item.createItem("bedrock_sword", "Bedrock Sword", {name: "bedrock_sword"}, {stack: 1, isTech: true});
Item.setToolRender(ItemID.bedrock_sword, true);
Item.setEnchantType(ItemID.bedrock_sword, 16383, 63);

Callback.addCallback("UseBedrockSword", function (victim) {
	let date = new Date();
	if ((date.getMonth() == 5 && date.getDate() == 17) || Math.random() > 0.99)
		Entity.damageEntity(victim, Entity.getHealth(victim));
	else if(Math.random() > 0.9999 && date.getHours() < 7) {
		Entity.damageEntity(Player.get(), Player.getHealth(), {attacker: Player.get()});
		Game.message(Translation.translate("Sleep Now! You shouldn't stay late"));
	}
});




// file: integration/loa.js

ModAPI.addAPICallback("LoA", function (api) {  //联动The Lord of the Apples
	api.Apple.registerApple(ItemID.bedrock_apple, 300);
});




