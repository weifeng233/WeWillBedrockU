//World Generation[世界生成]

Callback.addCallback("GenerateChunkUnderground", function (chunkX, chunkZ, ramdom, dismension) {
	if (BCore.isMagicArea(chunkX, chunkZ) && !dismension) {
		let coords = GenerationUtils.randomCoords(chunkX, chunkZ, 5, 5);
		World.setBlock(coords.x, coords.y, coords.z, 7);
	}
});