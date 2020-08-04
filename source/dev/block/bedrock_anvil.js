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