falafel-helpers
===============

Wraps your falafel callback function, adding handy helpers:

```js
var falafelHelpers = require('falafel-helpers');

var src = falafel(fs.readFileSync('test.js', 'utf8'), helpers.wrap(function (node) {
	if (/Expression$/.test(node.type)) {
		node.wrap('debug(', ')');
	} else if (node.type === 'BlockStatement') {
		node.before('console.log("entering block");');
		node.after('console.log("exiting block");', true); // second argument makes it use a try-finally to always execute the inserted code
	}
});
```

Also works with `falafel-map`:

```js
var falafelHelpers = require('falafel-helpers');

var src = falafel(fs.readFileSync('test.js', 'utf8'), helpers.wrap(function (node) {
	if (/Expression$/.test(node.type)) {
		node.wrap('debug(', ')');
	}
}, { falafelMap: true }));
```
