"use strict";

boiler.register({
	points() {
		let gain = nD(1);
		if (player.p.upgrades.includes(12))
			gain = gain.times(LAYER_UPGS.p[12].currently());
		if (player.p.upgrades.includes(13))
			gain = gain.times(LAYER_UPGS.p[13].currently());
		if (player.p.upgrades.includes(22))
			gain = gain.times(LAYER_UPGS.p[22].currently());
		return gain;
	},
	name: {
		name: "Example",
		id: "example_boiler",
	},
});

boiler.Layer({
	name: {
		short: "p",
		full: "Prestige",
		resource: "prestige points",
	},
	where: {
		row: 0,
		shown() {
			return true;
		},
	},
	req: {
		amount: 10,
		type: "normal",
		exp: 0.5,
		mult() {
			let mult = nD(1);
			if (player.p.upgrades.includes(21)) mult = mult.times(2);
			if (player.p.upgrades.includes(23))
				mult = mult.times(LAYER_UPGS.p[23].currently());
			if (player.p.upgrades.includes(31))
				mult = mult.times(LAYER_UPGS.p[31].currently());
			return mult;
		},
	},
	upgrades: {
		rows: 2,
		cols: 3,
		11: {
			desc: "Gain 1 Point every second.",
			cost: new Decimal(1),
			unl() {
				return player.p.unl;
			},
		},
		12: {
			desc:
				"Point generation is faster based on your unspent Prestige Points.",
			cost: new Decimal(1),
			unl() {
				return player.p.upgrades.includes(11);
			},
			currently() {
				let ret = player.p.points.plus(1).pow(0.5);
				if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000");
				return ret;
			},
			effDisp(x) {
				return `${format(x)}x`;
			},
		},
		13: {
			desc: "Point generation is faster based on your Point amount.",
			cost: new Decimal(5),
			unl() {
				return player.p.upgrades.includes(12);
			},
			currently() {
				return player.points.plus(1).log10().pow(0.75).plus(1);
			},
			effDisp(x) {
				return `${format(x)}x`;
			},
		},
		21: {
			desc: "Prestige Point gain is doubled.",
			cost: new Decimal(20),
			unl() {
				return player.p.upgrades.includes(11);
			},
		},
		22: {
			desc:
				"Point generation is faster based on your Prestige Upgrades bought.",
			cost: new Decimal(75),
			unl() {
				return player.p.upgrades.includes(12);
			},
			currently() {
				return Decimal.pow(1.4, player.p.upgrades.length);
			},
			effDisp(x) {
				return `${format(x)}x`;
			},
		},
		23: {
			desc: "Prestige Point gain is boosted by your Point amount.",
			cost: new Decimal(5e3),
			unl() {
				return player.p.upgrades.includes(13);
			},
			currently() {
				return player.points.plus(1).log10().cbrt().plus(1);
			},
			effDisp(x) {
				return `${format(x)}x`;
			},
		},
	},
});

boiler.Layer({
	name: {
		short: "k",
		full: "Knowledge",
		resource: "knowledge",
		resourceCapital: "Knowledge",
		color: "red",
	},
	where: {
		row: 1,
		shown() {
			return player.p.unl;
		},
		branches: ["p"],
	},
	req: {
		amount: 100,
		type: "static",
		base: 5,
		exp: 1.1,
	},
	milestones: [
		{
			req: 1,
			text: "Keep prestige upgrades on knowledge reset.",
		},
		{
			req: 2,
			text: "Gain 100% of prestige point gain per second.",
			// Show this if MS Display is at "AUTOMATION"
			auto: true,
		},
	],
	upgrades: {
		rows: 1,
		cols: 2,
		11: {
			desc: "Gain 1 Intellect every second.",
			cost: nD(1),
			unl() {
				return player.k.unl;
			},
		},
		12: {
			desc: "Square the Intellect effect.",
			cost: nD(5),
			unl() {
				return player.k.upgrades.includes(11);
			},
			currently() {
				return nD(2);
			},
			effDisp(x) {
				return `^${format(x)}`;
			},
		},
	},
	custom: {
		intellect: {
			amt: nD(0),
			decimal: true,
		},
	},
	tick(time) {
		if (player.k.unl)
			player.k.intellect = player.k.intellect.add(
				player.k.points.mul(time)
			);
	},
	eff: {
		display() {
			return `making ${format(player.k.points)} intellect per second`;
		},
		effect() {
			return player.k.intellect.add(2).log2().pow(2);
		},
	},
	html() {
		return `You have ${format(
			player.k.intellect
		)} intellect, which is multiplying Prestige Point gain by ${format(
			LAYER_EFFS.k()
		)}`;
	},
});
