var assert = require('assert');
var escape = require('..');

describe('advanced escape(fmt, ...)', function(){
  it('should handle |%10s|', function(){
    escape('|%10s|', 'foo')
      .should.equal('|       foo|');
  });

  it('should handle |%-10s|', function(){
    escape('|%-10s|', 'foo')
      .should.equal('|foo       |');
  });

  it('should handle |%*s|', function(){
    escape('|%*s|', 10, 'foo')
      .should.equal('|       foo|');
  });

  it('should handle |%*s|', function(){
    escape('|%*s|', -10, 'foo')
      .should.equal('|foo       |');
  });

  it('should handle |%-*s|', function(){
    escape('|%-*s|', 10, 'foo')
      .should.equal('|foo       |');
  });

  it('should handle |%-*s|', function(){
    escape('|%-*s|', -10, 'foo')
      .should.equal('|foo       |');
  });

  it('should handle %3$s, %2$s, %1$s', function(){
    escape('Testing %3$s, %2$s, %1$s', 'one', 'two', 'three')
      .should.equal('Testing three, two, one');
  });

  it('should handle |%*2$s|', function(){
    escape('|%*2$s|', 'foo', 10, 'bar')
      .should.equal('|       bar|');
  });

  it('should handle |%1$*2$s|', function(){
    escape('|%1$*2$s|', 'foo', 10, 'bar')
      .should.equal('|       foo|');
  });

  it('should handle advanced position', function(){
    escape('Testing %3$s, %2$s, %s', 'one', 'two', 'three')
      .should.equal('Testing three, two, three');
  });
});
