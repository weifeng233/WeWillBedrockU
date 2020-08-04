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