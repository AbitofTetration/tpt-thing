"use strict";

function updateTemp() {
	if (!tmp.layerEffs) tmp.layerEffs = {};
	for (const name in LAYER_EFFS) tmp.layerEffs[name] = LAYER_EFFS[name]();

	if (!tmp.layerReqs) tmp.layerReqs = {};
	for (const name in LAYER_REQS) tmp.layerReqs[name] = getLayerReq(name);

	if (!tmp.gainMults) tmp.gainMults = {};
	if (!tmp.resetGain) tmp.resetGain = {};
	if (!tmp.nextAt) tmp.nextAt = {};
	if (!tmp.layerAmt) tmp.layerAmt = {};
	for (const i in LAYERS) {
		tmp.layerAmt[LAYERS[i]] = getLayerAmt(LAYERS[i]);
		tmp.gainMults[LAYERS[i]] = getLayerGainMult(LAYERS[i]);
		tmp.resetGain[LAYERS[i]] = getResetGain(LAYERS[i]);
		tmp.nextAt[LAYERS[i]] = getNextAt(LAYERS[i]);
	}

	tmp.pointGen = getPointGen();
}
