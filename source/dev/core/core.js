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