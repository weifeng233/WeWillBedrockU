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