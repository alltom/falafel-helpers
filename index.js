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
	var sequence = options.falafelMap ? falafelMapSequence : falafelSequence;

	var w = eselector.nodeTag(node);
	if (w) {
		if (['statement', 'declaration', 'program', 'block'].indexOf(w.name) !== -1) {
			node.before = before;
			node.after = after;
			node.wrap = wrap;
		} else if (w.name === "expression") {
			node.wrap = wrap;
		} else if (['declarator', 'property'].indexOf(w.name) !== -1) {
			// skip
		} else {
			throw new Error('unrecognized node ' + w.name + ' (' + node.type + ')');
		}
	}

	return node;

	function before(src) {
		this.wrap(sequence('{', src), '}');
	}
	function after(src, useFinally) {
		if (useFinally) {
			this.wrap('{ try {', sequence('} finally {', src, '} }'));
		} else {
			this.wrap('{', sequence(src, '}'));
		}
	}
	function wrap(beforeSrc, afterSrc) {
		this.update(sequence(beforeSrc, this.source(), afterSrc));
	}
}

// returns a version of f where the node argument has been wrapped with the function above
module.exports.wrap = function (f, options) {
	return function (node) {
		return f(module.exports(node, options));
	};
};

function falafelSequence() {
	return Array.prototype.join.call(arguments, '');
}

function falafelMapSequence() {
	return Array.prototype.slice.call(arguments);
}
