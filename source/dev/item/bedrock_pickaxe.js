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

