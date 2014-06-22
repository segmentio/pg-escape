
/**
 * Module dependencies.
 */

var assert = require('assert');
var fs = require('fs');
var XRegExp = require('xregexp').XRegExp;

/**
 * Reserved word map.
 */

var txt = fs.readFileSync(__dirname + '/reserved.txt', 'utf8');
var reserved = txt.split('\n').reduce(function(map, word){
  map[word.toLowerCase()] = true;
  return map;
}, {});

/**
 * setup the regex stuff/lib
 */

var RegExpMain = (function(){
  var reLib = {};
  reLib.posInt   = /[1-9][0-9]*/;
  reLib.star     = /\*/;
  reLib.nth      = XRegExp.build('{{star}}(?<widthNth>{{posInt}})[$]', reLib);
  reLib.flag     = XRegExp('(?<flag>[-])');
  reLib.position = XRegExp.build('(?<position>{{posInt}})[$]', reLib);
  reLib.width    = XRegExp.build('(?<widthInt>{{posInt}})|(?<widthStar>{{star}})|{{nth}}', reLib);
  reLib.type     = XRegExp('(?<type>[sIL])');

  var reMain = XRegExp.build('%((?<percent>%)|{{position}}?{{flag}}?{{width}}?{{type}})', reLib, 'g');

  return reMain;
})();

/**
 * Helper class for argument handling
 *
 * @param {Array} args
 * @api private
 */
function Args(args) {
  var curIndex = 1;

  this.get = function(idx) {
    curIndex = idx ? parseInt(idx, 10) : curIndex;
    assert(curIndex > 0, 'Minimum usable index is 1'); 
    return args[curIndex++];
  };
};

/**
 * get the current argument depending on all the format magic
 *
 * @param {Args} args
 * @param {Object} matches
 * @return {String}
 * @api private
 */

function getArg(args, matches) {
  var width = matches.widthInt;
  var spacesOnLeft = matches.flag !== '-';
  var pos = matches.position || null;
  var arg = args.get(pos);

  if (matches.widthStar === '*') {
    width = arg;
    arg = args.get(pos);
  }

  if (matches.widthNth) {
    var argIdx = parseInt(matches.widthNth, 10);
    width = args.get(argIdx);
    arg = args.get(pos);
  }

  width = parseInt(width, 10);

  if (width < 0) {
    width *= -1;
    if (spacesOnLeft) {
      spacesOnLeft = !spacesOnLeft;
    }
  }

  var numSpaces = width - arg.length;
  if (numSpaces > 0) {
    var spaces = (new Array(numSpaces+1)).join(' ');
    arg = spacesOnLeft ? spaces.concat(arg) : arg.concat(spaces);
  }

  return arg;
}

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
  var args = new Args(arguments);

  return XRegExp.replace(fmt, RegExpMain, function(matches, type){
    if (matches.percent !== undefined) return '%';

    var arg = getArg(args, matches);

    switch (matches.type) {
      case 's': return exports.string(arg);
      case 'I': return exports.ident(arg);
      case 'L': return exports.literal(arg);
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
