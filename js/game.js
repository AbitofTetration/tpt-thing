"use strict";

let player;
const tmp = {};
const config = {};
const offTime = {
	remain: 0,
	speed: 1,
};
let needCanvasUpdate = true;
let NaNalert = false;

function getStartPlayer() {
	return boiler.startPlayer;
}

const LAYERS = [];

const LAYER_REQS = {};

const LAYER_RES = {};

const LAYER_RES_CEIL = [];

// "normal" | "static"
const LAYER_TYPE = {};

const LAYER_EXP = {};

// Base multiplier, only for static?
const LAYER_BASE = {};

const LAYER_ROW = {};

// [["x"], ["a", "b"]]
const ROW_LAYERS = [];

const LAYER_EFFS = {
	// Example:
	// a() {
	// return player.a.points.log10().pow(2);
	// }
};

const LAYER_UPGS = {};

const TAB_REQS = {
	tree() {
		return true;
	},
	options() {
		return true;
	},
	info() {
		return true;
	},
	changelog() {
		return true;
	},
	credits() {
		return true;
	},
	// Example:
	// k() {
	//  return (
	//    (player.k.unl || player.p.points.gte(tmp.layerReqs.k)) &&
	//    layerUnl("k")
	//  )
	// }
};

// Next in: "x ___"
const LAYER_AMT_NAMES = {};

function getLayerAmt(layer) {
	switch (layer) {
		// What the requirement for the layer is baed on!
		default:
			return player.points;
	}
}

function getLayerEffDesc(layer) {
	if (!Object.keys(LAYER_EFFS).includes(layer)) return "???";
	const eff = tmp.layerEffs[layer];
	if (boiler.layers[layer].effDesc) return boiler.layers[layer].effDesc(eff);
}

function save() {
	localStorage.setItem("prestige-tree", btoa(JSON.stringify(player)));
}

function load() {
	const get = localStorage.getItem("prestige-tree");
	if (get === null || get === undefined) player = getStartPlayer();
	else player = JSON.parse(atob(get));
	player.tab = "tree";
	offTime.remain = (Date.now() - player.time) / 10000;
	if (!player.offlineProd) offTime.remain = 0;
	player.time = Date.now();
	checkForVars();
	convertToDecimal();
	updateTemp();
	updateTemp();
	loadVue();
}

function exportSave() {
	const str = btoa(JSON.stringify(player));

	const el = document.createElement("textarea");
	el.value = str;
	document.body.appendChild(el);
	el.select();
	el.setSelectionRange(0, 99999);
	document.execCommand("copy");
	document.body.removeChild(el);
}

function importSave(imported = undefined) {
	if (imported === undefined) imported = prompt("Paste your save here");
	try {
		player = JSON.parse(atob(imported));
		save();
		window.location.reload();
	} catch (e) {
		// Eat urine, fool
	}
}

function checkForVars() {
	const start = getStartPlayer();
	// Example:
	// if (player.a === undefined) player.a = 5;
	for (const key in start) {
		if (player[key] === undefined) player[key] = start[key];
	}
	for (const layer in boiler.layers) {
		for (const key in start[layer]) {
			if (["unl", "points", "best", "upgrades"].includes(key)) continue;
			if (player[layer][key] === undefined)
				player[layer][key] = start[layer][key];
		}
	}
}

function convertToDecimal() {
	player.points = nD(player.points);
	for (const layer in boiler.layers) {
		player[layer].points = nD(player[layer].points);
		player[layer].best = nD(player[layer].best);
		for (const item in boiler.layers[layer].decimals) {
			const dec = boiler.layers[layer].decimals[item];
			player[layer][dec] = nD(player[layer][dec]);
		}
	}
	// Example:
	// player.k.points = new Decimal(player.k.points);
	// player.k.best = new Decimal(player.k.best);
}

function toggleOpt(name) {
	player[name] = !player[name];
}

function exponentialFormat(num) {
	const e = num.log10().floor();
	const m = num.div(Decimal.pow(10, e));
	return `${m.toStringWithDecimalPlaces(3)}e${e.toStringWithDecimalPlaces(
		0
	)}`;
}

function commaFormat(num, precision) {
	if (num === null || num === undefined) return "NaN";
	return num
		.toStringWithDecimalPlaces(precision)
		.replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
}

function format(decimal, precision = 3) {
	decimal = new Decimal(decimal);
	if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) {
		player.hasNaN = true;
		return "NaN";
	}
	if (decimal.eq(1 / 0)) return "Infinity";
	if (decimal.gte("eee1000")) return exponentialFormat(decimal, precision);
	if (decimal.gte("ee1000")) return `ee${format(decimal.log10().log10())}`;
	if (decimal.gte("1e1000"))
		return `${decimal
			.div(Decimal.pow(10, decimal.log10().floor()))
			.toStringWithDecimalPlaces(3)}e${format(decimal.log10().floor())}`;
	if (decimal.gte(1e9)) return exponentialFormat(decimal, precision);
	if (decimal.gte(1e3)) return commaFormat(decimal, 0);
	return commaFormat(decimal, precision);
}

function formatWhole(decimal) {
	return format(decimal, 0);
}

function formatTime(s) {
	if (s < 60) return `${format(s)}s`;
	if (s < 3600)
		return `${formatWhole(Math.floor(s / 60))}m ${format(s % 60)}s`;
	return `${formatWhole(Math.floor(s / 3600))}h ${formatWhole(
		Math.floor(s / 60) % 60
	)}m ${format(s % 60)}s`;
}

function showTab(name) {
	if (!TAB_REQS[name]()) return;
	player.tab = name;
	if (name === "tree") needCanvasUpdate = true;
}

function canBuyMax(layer) {
	switch (layer) {
		// Example:
		// case "k":
		//  return player.f.best.gte(1);
		default:
			return false;
	}
}

function getLayerReq(layer) {
	let req = LAYER_REQS[layer];
	switch (
		layer
		// Example:
		// case "k":
		//  if (player.f.unl) req = req.mul(100);
		//  break;
	) {
	}
	return req;
}

function getLayerGainMult(layer) {
	// What multiplies the gain of this layer's currency?
	return boiler.layers[layer].gainMult();
}

function getGainExp(layer) {
	let exp = new Decimal(1);
	switch (
		layer
		// Example:
		// case "k":
		//  if (player.f.upgrades.includes(14)) exp = exp.add(1);
	) {
	}
	return exp;
}

function getResetGain(layer) {
	if (LAYER_TYPE[layer] === "static") {
		if (!canBuyMax(layer) || tmp.layerAmt[layer].lt(tmp.layerReqs[layer]))
			return new Decimal(1);
		let gain = tmp.layerAmt[layer]
			.div(tmp.layerReqs[layer])
			.div(tmp.gainMults[layer])
			.max(1)
			.log(LAYER_BASE[layer])
			.pow(Decimal.pow(LAYER_EXP[layer], -1));
		if (gain.gte(12)) gain = gain.times(12).sqrt();
		if (gain.gte(1225)) gain = gain.times(Decimal.pow(1225, 9)).pow(0.1);
		return gain.floor().sub(player[layer].points).plus(1).max(1);
	}
	if (tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return new Decimal(0);
	let gain = tmp.layerAmt[layer]
		.div(tmp.layerReqs[layer])
		.pow(LAYER_EXP[layer])
		.times(tmp.gainMults[layer])
		.pow(getGainExp(layer));
	if (gain.gte("e1e7")) gain = gain.sqrt().times("e5e6");
	return gain.floor().max(0);
}

function getNextAt(layer) {
	if (LAYER_TYPE[layer] === "static") {
		let amt = player[layer].points;
		if (amt.gte(1225)) amt = amt.pow(10).div(Decimal.pow(1225, 9));
		if (amt.gte(12)) amt = amt.pow(2).div(12);
		const extraCost = Decimal.pow(
			LAYER_BASE[layer],
			amt.pow(LAYER_EXP[layer])
		).times(tmp.gainMults[layer]);
		let cost = extraCost
			.times(tmp.layerReqs[layer])
			.max(tmp.layerReqs[layer]);
		if (LAYER_RES_CEIL.includes(layer)) cost = cost.ceil();
		return cost;
	}
	let next = tmp.resetGain[layer].plus(1);
	if (next.gte("e1e7")) next = next.div("e5e6").pow(2);
	next = next
		.root(getGainExp(layer))
		.div(tmp.gainMults[layer])
		.root(LAYER_EXP[layer])
		.times(tmp.layerReqs[layer])
		.max(tmp.layerReqs[layer]);
	if (LAYER_RES_CEIL.includes(layer)) next = next.ceil();
	return next;
}

// If you can view the node on the tree
function layerUnl(layer) {
	switch (layer) {
		case "p":
			return true;
		default:
			return true;
	}
}

function rowReset(row, whatLayer) {
	// Deep Copy
	const prev = JSON.parse(JSON.stringify(player));
	const start = getStartPlayer();
	player.points = nD(row === 0 ? 0 : 10);
	for (let i = 0; i < row; i++) {
		for (let j = 0; j < ROW_LAYERS[i].length; j++) {
			const layer = ROW_LAYERS[i][j];
			player[layer].points = nD(0);
			player[layer].best = nD(0);
			player[layer].upgrades = [];
		}
	}
}

function doReset(layer, force = false) {
	if (!force) {
		if (tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return;
		const gain = tmp.resetGain[layer];
		if (LAYER_TYPE[layer] === "static") {
			if (tmp.layerAmt[layer].lt(tmp.nextAt[layer])) return;
			player[layer].points = player[layer].points.plus(
				canBuyMax(layer) ? gain : 1
			);
			if (player[layer].total)
				player[layer].total = player[layer].total.plus(
					canBuyMax(layer) ? gain : 1
				);
		} else {
			player[layer].points = player[layer].points.plus(gain);
			if (player[layer].total)
				player[layer].total = player[layer].total.plus(gain);
		}
		player[layer].best = player[layer].best.max(player[layer].points);

		if (!player[layer].unl) {
			player[layer].unl = true;
			needCanvasUpdate = true;

			const layers = ROW_LAYERS[LAYER_ROW[layer]];
			for (const i in layers)
				if (!player[layers[i]].unl && player[layers[i]] !== undefined)
					player[layers[i]].order += ORDER_UP[
						LAYER_ROW[layer]
					].includes(layer)
						? 1
						: 0;
		}

		// Quick fix
		tmp.layerAmt[layer] = new Decimal(0);
	}

	const row = LAYER_ROW[layer];
	if (row === 0) rowReset(0, layer);
	else for (let x = row; x >= 1; x--) rowReset(x, layer);

	updateTemp();
	updateTemp();
}

function buyUpg(layer, id) {
	if (!player[layer].unl) return;
	if (!LAYER_UPGS[layer][id].unl()) return;
	if (player[layer].upgrades.includes(id)) return;
	if (player[layer].points.lt(LAYER_UPGS[layer][id].cost)) return;
	player[layer].points = player[layer].points.sub(LAYER_UPGS[layer][id].cost);
	player[layer].upgrades.push(id);
}

function getPointGen() {
	return boiler.getPointGen();
}

function resetRow(row) {
	if (
		prompt(
			"Are you sure you want to reset this row? It is highly recommended that" +
				' you wait until the end of your current run before doing this! Type "I WANT TO RESET THIS" to confirm'
		) !== "I WANT TO RESET THIS"
	)
		return;
	const preLayers = ROW_LAYERS[row - 1];
	const layers = ROW_LAYERS[row];
	const postLayers = ROW_LAYERS[row + 1];
	rowReset(row + 1, postLayers[0]);
	doReset(preLayers[0], true);
	for (const layer in layers) {
		player[layers[layer]].unl = false;
		if (player[layers[layer]].order) player[layers[layer]].order = 0;
	}
	updateTemp();
	resizeCanvas();
}

function toggleAuto(layer, end = "") {
	if (player[layer][`auto${end}`] === undefined) return;
	player[layer][`auto${end}`] = !player[layer][`auto${end}`];
}

function adjustMSDisp() {
	const displays = ["always", "automation", "incomplete", "never"];
	player.msDisplay = displays[(displays.indexOf(player.msDisplay) + 1) % 4];
}

function milestoneShown(complete, auto = false) {
	switch (player.msDisplay) {
		case "always":
			return true;
		case "automation":
			return auto || !complete;
		case "incomplete":
			return !complete;
		case "never":
			return false;
	}
	return false;
}

function keepGoing() {
	player.keepGoing = true;
	player.tab = "tree";
	needCanvasUpdate = true;
}

function gameLoop(diff) {
	diff = new Decimal(diff);
	if (isNaN(diff.toNumber())) diff = new Decimal(0);
	player.timePlayed += diff.toNumber();
	if (player.p.upgrades.includes(11))
		player.points = player.points.plus(tmp.pointGen.times(diff)).max(0);

	if (player.hasNaN && !NaNalert) {
		alert(
			`We have detected a corruption in your save. Please visit https://discord.gg/${
				config.discord || "wwQfgPa"
			} for help.`
		);
		clearInterval(interval);
		player.autosave = false;
		NaNalert = true;
	}

	boiler.loops.forEach(loop => loop(diff));
}

function hardReset() {
	if (
		!confirm(
			"Are you sure you want to do this? You will lose all your progress!"
		)
	)
		return;
	player = getStartPlayer();
	save();
	window.location.reload();
}

const saveInterval = setInterval(() => {
	if (player === undefined) return;
	if (player.autosave) save();
}, 5000);

const interval = setInterval(() => {
	if (player === undefined || tmp === undefined) return;
	let diff = (Date.now() - player.time) / 1000;
	if (!player.offlineProd) offTime.remain = 0;
	if (offTime.remain > 0) {
		offTime.speed = offTime.remain / 5 + 1;
		diff += offTime.speed / 50;
		offTime.remain = Math.max(offTime.remain - offTime.speed / 50, 0);
	}
	player.time = Date.now();
	if (needCanvasUpdate) resizeCanvas();
	updateTemp();
	gameLoop(new Decimal(diff));
}, 50);

document.onkeydown = e => {
	if (player === undefined) return;
	const shiftDown = e.shiftKey;
	const ctrlDown = e.ctrlKey;
	const key = e.key;
	if (!LAYERS.includes(key) || ctrlDown || shiftDown) {
		switch (
			key
			// For if you have duplicate layers!
		) {
		}
	} else if (player[key].unl) doReset(key);
};
