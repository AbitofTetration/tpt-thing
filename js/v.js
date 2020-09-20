"use strict";

let app;

function loadVue() {
	app = new Vue({
		el: "#app",
		data: {
			player,
			tmp,
			offTime,
			Decimal,
			format,
			formatWhole,
			formatTime,
			layerUnl,
			getLayerEffDesc,
			doReset,
			buyUpg,
			milestoneShown,
			showTab,
			layerShown,
			LAYERS,
			LAYER_RES,
			LAYER_TYPE,
			LAYER_UPGS,
			LAYER_EFFS,
			LAYER_AMT_NAMES,
			LAYER_RES_CEIL,
			ROW_LAYERS,
			layers,
			resolveMilestone,
		},
	});
}
