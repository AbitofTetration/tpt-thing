# Boiler Tree

Make mods of _Prestige Tree_ using an uber-easy framework.

## Usage

### `boiler.register(options)`

You **MUST** register your mod using `boiler.register`.

```js
boiler.register({
	// Point generation
	points() {
		return 1;
	},
	name: {
		name: "My Mod",
		id: "mymod",
	},
});
```

### `boiler.Layer(options)`

```js
// Usage is as follows.
// In this example, we will create a layer called "Knowledge".
boiler.Layer({
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
			desc: "Multiply point gain based on something.",
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
			// Show this milestone if MS display is "AUTOMATION"
			auto: true,
		},
	],
	// Custom variables
	custom: {
		myVar: {
			// the default amount
			amt: nD(0),
			// if the game should convert it to a decimal
			decimal: true,
		},
	},
	// Code that runs during gameLoop
	tick(diff) {
		console.log(diff.toNumber());
	},
	eff: {
		// both optional.
		display(eff) {
			return `which is doing something at ${eff} efficiency.`;
		},
		effect() {
			return player.k.myVar;
		},
	},
	// If you should keep a variable on reset!
	keep: {
		// What works: points, best, upgrades, any custom vars
		x(layer) {
			// Won't actually happen because it's above p, just an example!
			if (layer === "p") return player.k.best.gte(5);
			return false;
		},
	},
	// Optional, custom HTML
	html() { return `You have ${x} y.` }
});
```
