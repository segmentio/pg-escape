
var assert = require('assert');
var escape = require('..');

describe('escape(fmt, ...)', function(){
  describe('%s', function(){
    it('should format as a simple string', function(){
      escape('some %s here', 'thing')
        .should.equal('some thing here');

      escape('some %s thing %s', 'long', 'here')
        .should.equal('some long thing here');
    })
  })

  describe('%%', function(){
    it('should format as %', function(){
      escape('some %%', 'thing')
        .should.equal('some %');
    })

    it('should not eat args', function(){
      escape('just %% a %s', 'test')
        .should.equal('just % a test');
    })
  })

  describe('%I', function(){
    it('should format as an identifier', function(){
      escape('some %I', 'foo/bar/baz')
        .should.equal('some "foo/bar/baz"');
    })
  })

  describe('%L', function(){
    it('should format as a literal', function(){
      escape('%L', "Tobi's")
        .should.equal("'Tobi''s'");
    })
  })
})

describe('escape.string(val)', function(){
  it('should coerce to a string', function(){
    var date = new Date(Date.UTC(2012, 11, 14, 13, 6, 43, 152));
    escape.string().should.equal('');
    escape.string(0).should.equal('0');
    escape.string(15).should.equal('15');
    escape.string(45.13).should.equal('45.13');
    escape.string(true).should.equal('t');
    escape.string(false).should.equal('f');
    escape.string(date).should.equal('2012-12-14T13:06:43.152Z');
    escape.string('something').should.equal('something');
  })
})

describe('escape.ident(val)', function(){
  it('should quote when necessary', function(){
    escape.ident('foo').should.equal('foo');
    escape.ident('_foo').should.equal('_foo');
    escape.ident('_foo_bar$baz').should.equal('_foo_bar$baz');
    escape.ident('test.some.stuff').should.equal('"test.some.stuff"');
    escape.ident('test."some".stuff').should.equal('"test.""some"".stuff"');
  })

  it('should quote reserved words', function(){
    escape.ident('desc').should.equal('"desc"');
    escape.ident('join').should.equal('"join"');
    escape.ident('cross').should.equal('"cross"');
  })

  it('should quote booleans', function(){
    escape.ident(true).should.equal('"t"');
    escape.ident(false).should.equal('"f"');
  })

  it('should quote numbers', function(){
    escape.ident(45).should.equal('"45"');
    escape.ident(45.13).should.equal('"45.13"');
  })

  it('should convert Date to ISO and quote it', function(){
    var date = new Date(Date.UTC(2012, 11, 14, 13, 6, 43, 152));
    escape.ident(date).should.equal('"2012-12-14T13:06:43.152Z"');
  })

  it('should throw when null', function(done){
    try {
      escape.ident();
    } catch (err) {
      assert(err.message == 'identifier required');
      done();
    }
  })
})

describe('escape.literal(val)', function(){
  it('should return NULL for null', function(){
    escape.literal(null).should.equal('NULL');
    escape.literal(undefined).should.equal('NULL');
  })

  it('should quote', function(){
    escape.literal('hello world').should.equal("'hello world'");
  })

  it('should escape quotes', function(){
    escape.literal("O'Reilly").should.equal("'O''Reilly'");
  })

  it('should escape backslashes', function(){
    escape.literal('\\whoop\\').should.equal("E'\\\\whoop\\\\'");
  })

  it('should quote booleans', function(){
    escape.literal(true).should.equal("'t'");
    escape.literal(false).should.equal("'f'");
  })

  it('should quote numbers', function(){
    escape.literal(45).should.equal("'45'");
    escape.literal(45.13).should.equal("'45.13'");
  })

  it('should convert Date to ISO and quote it', function(){
    var date = new Date(Date.UTC(2012, 11, 14, 13, 6, 43, 152));
    escape.literal(date).should.equal("'2012-12-14T13:06:43.152Z'");
  })
})

