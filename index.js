var eselector = require('esprima-selector');

// decorates the given esprima node with tag-specific helpers.
// statements and the like get:
//   node.before(src) - inserts src before the node
//   node.after(src) - inserts src after the node
//   node.wrap(beforeSrc, afterSrc) - wraps the node
//
// expressions just get:
//   node.wrap(beforeSrc, afterSrc) - wraps the node (be sure to match parentheses)
//
// blocks get:
//   node.before(src) - inserts src before everything in the block
//   node.after(src, useFinally) - inserts src after everything in the block; if useFinally is true, the block is wrapped with try-block with src in the finally clause
module.exports = function (node, options) {
	options = (options || {});
	var primitives = options.falafelMap ? falafelMapPrimitives : falafelPrimitives;

	var w = eselector.nodeTag(node);
	if (w) {
		if (w.name === "statement" || w.name === "declaration" || w.name === "program") {
			node.before = primitives.before;
			node.after = primitives.after;
			node.wrap = primitives.wrap;
		} else if (w.name === "expression") {
			node.wrap = primitives.wrap;
		} else if (w.name === "block") {
			node.before = function (src) { node.wrap(primitives.sequence('{', src), '}') };
			node.after = function (src, useFinally) {
				if (useFinally) {
					node.wrap('{ try {', primitives.sequence('} finally {', src, '} }'));
				} else {
					node.wrap('{', primitives.sequence(src, '}'));
				}
			};
			node.wrap = primitives.wrap;
		} else if (['declarator', 'property'].indexOf(w.name) !== -1) {
			// skip
		} else {
			throw new Error('unrecognized tag ' + w.name);
		}
	}

	return node;
}

// returns a version of f where the node argument has been wrapped with the function above
module.exports.wrap = function (f, options) {
	return function (node) {
		return f(module.exports(node, options));
	};
};

var falafelPrimitives = {
	before: function (src) { this.update(src + this.source()) },
	after: function (src) { this.update(this.source() + src) },
	wrap: function (beforeSrc, afterSrc) { this.update(beforeSrc + this.source() + afterSrc) },
	sequence: function () { return Array.prototype.join.call(arguments, '') },
};

var falafelMapPrimitives = {
	before: function (src) { this.update(src, this.sourceNodes()) },
	after: function (src) { this.update(this.sourceNodes(), src) },
	wrap: function (beforeSrc, afterSrc) { this.update(beforeSrc, this.sourceNodes(), afterSrc) },
	sequence: function () { return Array.prototype.slice.call(arguments) },
};
