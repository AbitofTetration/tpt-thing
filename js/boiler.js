// Boiler made with <3 by Yhvr
"use strict";

const D = Decimal;
const nD = n => new D(n);

const boiler = {
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
};

function nodeShown(layer) {
	return layerShown(layer);
}

function layerShown(layer) {
	return boiler.layers[layer].shown();
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

function Layer(data) {
	const name = data.name.short;
	// Deal with data.upgrades
	LAYER_UPGS[name] = data.upgrades;

	// Deal with data.name
	LAYERS.push(name);
	LAYER_RES[name] = data.name.resource;
	boiler.layers[name] = {};
	boiler.startPlayer[name] = {
		unl: false,
		points: nD(0),
		best: nD(0),
		upgrades: [],
	};

	// Deal with data.where
	LAYER_ROW[name] = data.where.row;
	if (ROW_LAYERS[data.where.row]) ROW_LAYERS[data.where.row].push(name);
	else {
		while (!ROW_LAYERS[data.where.row]) ROW_LAYERS.push([]);
		ROW_LAYERS[data.where.row].push(name);
	}
	boiler.layers[name].shown = data.where.shown;
	if (data.where.branches) boiler.layers[name].branches = data.where.branches;

	TAB_REQS[name] = () =>
		(player[name].unl ||
			resolveResource(data.req.resource).gte(tmp.layerReqs[name])) &&
		layerUnl(name);

	// Deal with data.req
	LAYER_REQS[name] = nD(data.req.amount);
	LAYER_AMT_NAMES[name] = data.req.resourceName || "points";
	LAYER_TYPE[name] = data.req.type;
	LAYER_EXP[name] = data.req.exp;
}
