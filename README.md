# Boiler Tree

Make mods of _Prestige Tree_ using an uber-easy framework.

## Usage

```js
// Usage is as follows.
// In this example, we will create a layer called "Knowledge".
Layer({
	// Naming for the layer
	name: {
		short: "k",
		full: "Knowledge",
		resource: "knowledge",
		resourceCapital: "Knowledge",
	},
	// Where the node is on the tree
	where: {
		row: 1,
		// Wether the node should be shown on the tree or not
		shown() {
			return player.p.unl;
		},
		// The "canvas"-ing.
		branches: ["p"],
	},
	// What you need to prestige, when
	req: {
		// Can also be a string
		amount: 100,
		// Can be `undefined` (defaults to player.points),
		// a string (player[val].points),
		// or a function, as shown below
		// BEST PRACTICE: just don't define
		// it instead of using a function that
		// just returns player.points.
		resource() {
			return player.points;
		},
		// defaults to points
		resourceName: "points",
		// Boolean, if you should ceil the requirement display or not
		ceil: false,
		// "normal"|"static"
		// "normal" - you can prestige at the same stop
		// "static" - the requirement goes up
		type: "static",
		// (Number|String|Decimal)
		// Determines how the requirement scales.
		// don't ask me, i dunno how it works
		exp: 0.5,
		// (only needed if type is "static")
		// the base multiplier for requirement scaling
		base: 5,
	},
	// Because upgrades take up a lot of space, I'll only have one.
	upgrades: {
		rows: 1,
		cols: 1,
		11: {
			desc: "Multiply point gain based on",
		},
	},
	// Milestones!
	milestones: [
		{
			// Req is a Number, String, Decimal, or Function<Boolean>
			req: 25,
			// The number to display __ONLY IF REQ IS A FUNCTION__
			// disp: 5,
			text: "Keep x on knowledge reset.",
		},
	],
});
```
