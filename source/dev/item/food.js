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