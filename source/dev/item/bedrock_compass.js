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