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