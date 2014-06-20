
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
  reLib.nth      = XRegExp.build('{{star}}{{posInt}}\$', reLib);
  reLib.flags    = XRegExp('(?<flags>[-])');
  reLib.position = XRegExp.build('(?<position>{{posInt}})\$', reLib);
  //reLib.width    = XRegExp.build('(?<width>(?<widthInt>{{posInt}})|(?<widthStar>{{star}})|(?<widthNth>{{nth}}))', reLib);
  reLib.width    = XRegExp.build('(?<widthInt>{{posInt}})|(?<widthStar>{{star}})|(?<widthNth>{{nth}})', reLib);
  reLib.type     = XRegExp('(?<type>[sIL])');

  return XRegExp.build('%((?<percent>%)|{{position}}?{{flags}}?{{width}}?{{type}})', reLib, 'g');
})();

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

  return XRegExp.replace(fmt, RegExpMain, function(matches, type){
    console.log(matches);
    if (matches.percent !== undefined) return '%';

    var arg = args[i++];
    switch (type) {
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
