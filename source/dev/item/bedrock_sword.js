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