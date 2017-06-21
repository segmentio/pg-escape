
/**
 * Module dependencies.
 */

var assert = require('assert');
var fs = require('fs');

/**
 * Reserved word map.
 */

var txt = fs.readFileSync(__dirname + '/reserved.txt', 'utf8');
var reserved = txt.split('\n').reduce(function(map, word){
  map[word.toLowerCase()] = true;
  return map;
}, {});

/**
 * Expose `format()`.
 */

exports = module.exports = format;

/**
 * Format a string.
 *
 * @param {String} fmt
 * @param {Mixed} ...
 * @return {String}
 * @api public
 */

function format(fmt) {
  var i = 1;
  var args = arguments;
  return fmt.replace(/%([%sILQ])/g, function(_, type){
    if ('%' == type) return '%';

    var arg = args[i++];
    switch (type) {
      case 's': return exports.string(arg);
      case 'I': return exports.ident(arg);
      case 'L': return exports.literal(arg);
      case 'Q': return exports.dollarQuotedString(arg);
    }
  });
}

/**
 * Format as string.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

exports.string = function(val){
  return null == val ? '' : String(val);
};

/**
 *  Dollar-Quoted String Constants
 */

var randomTags = [
  // Upper case alpha sans vowels
  'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
  'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z',
  // Lower case alpha sans vowels
  'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm',
  'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z',
  // Numeric two through nine
  '2', '3', '4', '5', '6', '7', '8', '9',
];

/**
 * produces a random number from a given range
 *
 * @param {Number} start start of random numbers range
 * @param {Number} end end of random numbers range (inclusive)
 * @return {Number}
 * @api private
 */

function random(start, end) {
  var range = end - start;
  return Math.floor((Math.random() * range) + start);
}

/**
 * Format as dollar quoted string.
 * see: http://www.postgresql.org/docs/8.3/interactive/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
 *
 * Initially tries to use a tagless $$ as the quote wrapper. If it appears in the string to be quoted, then
 * successively longer random tags are chosen until one is found that is not contained within the string.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

exports.dollarQuotedString = function(val) {
  if (val === undefined || val === null || val === '') return '';
  // Ensure val is coerced to a string
  val = '' + val;
  // Start with an empty tag: $$
  var tag = '';
  while (true) {
    var dollarQuote = '$'+ tag + '$';
    // Check if val contains our selected dollar quote tag
    if (val.indexOf(dollarQuote) < 0) {
      // Not contained so dollarQuote is safe to use
      return dollarQuote + val + dollarQuote;
    }
    // Tag was contained within val so add random character to it
    tag += randomTags[ random(0, randomTags.length) ];
  }
}

/**
 * Format as identifier.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

exports.ident = function(val){
  assert(null != val, 'identifier required');
  return validIdent(val) ? val : quoteIdent(val);
};

/**
 * Format as literal.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

exports.literal = function(val){
  if (null == val) return 'NULL';
  if (Array.isArray(val)) {
    var vals = val.map(exports.literal)
    return "(" + vals.join(", ") + ")"
  }
  var backslash = ~val.indexOf('\\');
  var prefix = backslash ? 'E' : '';
  val = val.replace(/'/g, "''");
  val = val.replace(/\\/g, '\\\\');
  return prefix + "'" + val + "'";
};

/**
 * Check if `id` is a valid unquoted identifier.
 *
 * @param {String} id
 * @return {Boolean}
 * @api private
 */

function validIdent(id) {
  if (reserved[id]) return false;
  return /^[a-z_][a-z0-9_$]*$/i.test(id);
}

/**
 * Quote identifier.
 *
 * @param {String} id
 * @return {String}
 * @api private
 */

function quoteIdent(id) {
  id = id.replace(/"/g, '""');
  return '"' + id + '"';
}
