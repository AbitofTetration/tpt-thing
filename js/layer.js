// layer.js made with <3 by Yhvr
"use strict";

const D = Decimal;
const nD = n => new D(n);
let modInfo;

const layers = {
	layers: {},
	startPlayer: {
		tab: "tree",
		time: Date.now(),
		autosave: true,
		msDisplay: "always",
		offlineProd: true,
		versionType: "real",
		version: 1.0,
		timePlayed: 0,
		keepGoing: false,
		hasNaN: false,
		points: nD(10),
		p: {
			unl: false,
			points: nD(0),
			best: nD(0),
			upgrades: [],
		},
	},
	loops: [],
};

layers.css = document.createElement("style");
document.head.appendChild(layers.css);

function nodeShown(layer) {
	return layerShown(layer);
}

function layerShown(layer) {
	return layers.layers[layer].shown();
}

Vue.component("tree-node", {
	props: ["layer"],
	template: `
	<button v-if="nodeShown(layer)"
		:id="layer"
		@click="() => showTab(layer)"
		:tooltip="
			layerUnl(layer) ? formatWhole(player[layer].points) + ' ' + LAYER_RES[layer]
			: 'Reach ' + formatWhole(tmp.layerReqs[layer]) + ' ' + LAYER_AMT_NAMES[layer] +
			' to unlock (You have ' + formatWhole(tmp.layerAmt[layer]) + ' ' + LAYER_AMT_NAMES[layer] + ')'
		"
		:class="{
			treeNode: true,
			[layer]: true,
			hidden: !layerShown(layer),
			locked: !layerUnl(layer),
			can: layerUnl(layer)
		}">{{ layer.toUpperCase() }}</button>
	`,
});

function resolveResource(resource) {
	if (typeof resource === "string") return player[resource].points;
	if (typeof resource === "function") return resource();
	return player.points;
}

function resolveMilestone(milestone, amt) {
	if (typeof milestone === "function") return milestone();
	return amt.gte(milestone);
}

layers.Layer = function (data) {
	const name = data.name.short;
	// Funny stuff
	if (!data.custom) data.custom = {};
	data.custom.best = { amt: nD(0), decimal: true };
	data.custom.points = { amt: nD(0), decimal: true };
	data.custom.upgrades = { amt: [], decimal: false };

	// Deal with data.upgrades
	LAYER_UPGS[name] = data.upgrades;

	// Deal with data.name
	LAYERS.push(name);
	LAYER_RES[name] = data.name.resource;
	layers.layers[name] = {};
	layers.layers[name].name = data.name.resourceCapital || "";
	layers.startPlayer[name] = {
		unl: false,
		points: nD(0),
		best: nD(0),
		upgrades: [],
	};
	if (data.name.color) layers.css.innerHTML +=
	`.${name} {
		background-color: ${data.name.color};
		color: black;
	}

	.${name}_txt {
		color: ${data.name.color};
		text-shadow: 0 0 10px ${data.name.color};
	}`;

	// Deal with data.where
	LAYER_ROW[name] = data.where.row;
	if (ROW_LAYERS[data.where.row]) ROW_LAYERS[data.where.row].push(name);
	else {
		while (!ROW_LAYERS[data.where.row]) ROW_LAYERS.push([]);
		ROW_LAYERS[data.where.row].push(name);
	}
	layers.layers[name].shown = data.where.shown;
	if (data.where.branches) layers.layers[name].branches = data.where.branches;

	TAB_REQS[name] = () =>
		(player[name].unl ||
			resolveResource(data.req.resource).gte(tmp.layerReqs[name])) &&
		layerUnl(name);

	// Deal with data.req
	LAYER_REQS[name] = nD(data.req.amount);
	LAYER_AMT_NAMES[name] = data.req.resourceName || "points";
	LAYER_TYPE[name] = data.req.type;
	LAYER_EXP[name] = data.req.exp;
	layers.layers[name].gainMult = data.req.mult || (() => nD(1));
	layers.layers[name].max = data.req.max || (() => false);
	layers.layers[name].mult = data.req.mult || (() => nD(1));

	// Deal with data.milestones
	if (data.milestones) layers.layers[name].milestones = data.milestones;

	// Deal with data.custom
	layers.layers[name].decimals = [];
	layers.layers[name].custom = data.custom;
	for (const key in data.custom) {
		layers.startPlayer[name][key] = data.custom[key].amt;
		if (data.custom[key].decimal) layers.layers[name].decimals.push(key);
	}

	// Deal with data.tick
	if (data.tick) layers.loops.push(data.tick);

	// Deal with data.eff
	if (data.eff) {
		if (data.eff.display) layers.layers[name].effDesc = data.eff.display;
		if (data.eff.effect) LAYER_EFFS[name] = data.eff.effect;
	}

	// Deal with data.keep
	layers.layers[name].keep = data.keep || {};

	// Deal with data.html
	layers.layers[name].html = data.html || false;
};

layers.register = function (data) {
	layers.getPointGen = data.points;
	modInfo = data.name;
};
