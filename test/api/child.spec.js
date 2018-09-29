/*global expect*/
describe('#child', function() {
  var parentExpect;
  var childExpect;
  beforeEach(function() {
    parentExpect = expect.clone();
    childExpect = parentExpect.child();
  });

  it('should not leak a "private" assertion into the parent', function() {
    childExpect.addAssertion('<string> to foo', function(expect, subject) {
      expect(subject, 'to equal', 'foo');
    });
    expect(
      function() {
        parentExpect('foo', 'to foo');
      },
      'to throw',
      /^Unknown assertion 'to foo'/
    );
  });

  it('should not leak a "private" style into the parent', function() {
    childExpect.addStyle('foo', function() {});
    expect(parentExpect.createOutput().foo, 'to be undefined');
  });

  it('should not leak a "private" type into the parent', function() {
    childExpect.addType({
      name: 'abc',
      identify(obj) {
        return obj === 'abc';
      }
    });
    expect(parentExpect.findTypeOf('abc'), 'to satisfy', { name: 'string' });
  });

  it('should have access to assertions defined in the parent after the child was created', function() {
    parentExpect.addAssertion('<string> to foo', function(expect, subject) {
      expect(subject, 'to equal', 'foo');
    });
    childExpect('foo', 'to foo');
  });

  it('should prefer an assertion defined in the child, even if it was added before an identically named one in the parent', function() {
    childExpect.addAssertion('<string> to foo', function(expect, subject) {
      expect(subject, 'to equal', 'foo');
    });
    parentExpect.addAssertion('<string> to foo', function(expect, subject) {
      expect.fail('Wrong one!');
    });
    childExpect('foo', 'to foo');
  });

  it('should have access to identically named assertions with different type signatures in child and parent', function() {
    childExpect.addAssertion('<string> to foo', function(expect, subject) {
      expect.errorMode = 'nested';
      expect(subject, 'to equal', 'foo');
      expect(subject.length, 'to foo');
    });
    parentExpect.addAssertion('<number> to foo', function(expect, subject) {
      expect(subject, 'to equal', 3);
    });
    childExpect('foo', 'to foo');
  });

  it('should have access to styles defined in the parent after the child was created', function() {
    parentExpect.addStyle('yadda', function() {
      this.text('yaddafoo');
    });
    expect(
      childExpect
        .createOutput('text')
        .yadda()
        .toString(),
      'to equal',
      'yaddafoo'
    );
  });

  it('should prefer a style defined in the child, even if it was added before an identically named one in the parent', function() {
    childExpect.addStyle('yadda', function() {
      this.text('yaddagood');
    });
    parentExpect.addStyle('yadda', function() {
      this.text('yaddabad');
    });
    expect(
      childExpect
        .createOutput('text')
        .yadda()
        .toString(),
      'to equal',
      'yaddagood'
    );
  });

  it('should have access to types defined in the parent after the child was created', function() {
    parentExpect.addType({
      name: 'yadda',
      identify(obj) {
        return /^yadda/.test(obj);
      }
    });
    childExpect.addAssertion('<yadda> to foo', function(expect, subject) {
      expect(subject, 'to contain', 'foo');
    });
    childExpect('yaddafoo', 'to foo');
  });

  it('should have access to types defined in the parent after the child was created, also in the wrapped expect', function() {
    parentExpect.addType({
      name: 'yadda',
      identify(obj) {
        return /^yadda/.test(obj);
      }
    });
    childExpect.addAssertion('<yadda> to bar', function(expect, subject) {
      expect(subject, 'to contain', 'bar');
    });
    childExpect.addAssertion('<yadda> to foobar', function(expect, subject) {
      expect(subject, 'to bar');
      expect(subject, 'to contain', 'foo');
    });
    childExpect('yaddafoobar', 'to foobar');
  });

  it('should prefer a style defined in the child, even if it was added before an identically named one in the parent', function() {
    childExpect.addStyle('yadda', function() {
      this.text('yaddagood');
    });
    parentExpect.addStyle('yadda', function() {
      this.text('yaddabad');
    });
    expect(
      childExpect
        .createOutput('text')
        .yadda()
        .toString(),
      'to equal',
      'yaddagood'
    );
  });

  it('should allow installing an identically named plugin', function() {
    parentExpect.use({
      name: 'foo',
      version: '1.2.3',
      installInto() {}
    });
    childExpect.use({
      name: 'foo',
      version: '4.5.6',
      installInto() {}
    });
  });

  it('should allow a plugin dependency to be satisfied by a plugin installed in the parent', function() {
    parentExpect.use({
      name: 'foo',
      installInto() {}
    });
    childExpect.use({
      name: 'bar',
      dependencies: ['foo'],
      installInto() {}
    });
  });

  describe('with identically named types added to the parent and the child', function() {
    beforeEach(function() {
      parentExpect.addType({
        name: 'foo',
        identify(obj) {
          return /^foo/.test(obj);
        },
        parent: true // marker so the type can be detected in the tests
      });
      childExpect.addType({
        name: 'foo',
        identify(obj) {
          return obj === 'foo';
        },
        child: true // marker so the type can be detected in the tests
      });
    });

    describe('#findTypeOf', function() {
      describe('in the child', function() {
        it('should find the type defined in the child', function() {
          expect(childExpect.findTypeOf('foo'), 'to satisfy', { child: true });
        });

        it('should find the type defined in the parent when the object is not identified by the type added to the child', function() {
          expect(childExpect.findTypeOf('foobar'), 'to satisfy', {
            parent: true
          });
        });
      });

      describe('in the parent', function() {
        it('should find the type defined in the parent', function() {
          expect(parentExpect.findTypeOf('foo'), 'to satisfy', {
            parent: true
          });
        });
      });
    });

    describe('#getType', function() {
      describe('in the child', function() {
        it('should find the type defined in the child', function() {
          expect(childExpect.getType('foo'), 'to satisfy', { child: true });
        });
      });

      describe('in the parent', function() {
        it('should find the type defined in the parent', function() {
          expect(parentExpect.getType('foo'), 'to satisfy', { parent: true });
        });
      });
    });
  });

  describe('with identically named styles added to the parent, then the child', function() {
    beforeEach(function() {
      parentExpect.addStyle('foo', function() {
        this.text('parentfoo');
      });
      childExpect.addStyle('foo', function() {
        this.text('childfoo');
      });
    });

    it('should use the style defined in the parent when an output is created by the parent', function() {
      expect(
        parentExpect
          .createOutput('text')
          .foo()
          .toString(),
        'to equal',
        'parentfoo'
      );
    });

    it('should find the type defined in the parent when parentExpect.findTypeOf is used', function() {
      expect(
        childExpect
          .createOutput('text')
          .foo()
          .toString(),
        'to equal',
        'childfoo'
      );
    });
  });

  describe('with identically named styles added to the child, then the parent', function() {
    beforeEach(function() {
      childExpect.addStyle('foo', function() {
        this.text('childfoo');
      });
      parentExpect.addStyle('foo', function() {
        this.text('parentfoo');
      });
    });

    it('should use the style defined in the parent when an output is created by the parent', function() {
      expect(
        parentExpect
          .createOutput('text')
          .foo()
          .toString(),
        'to equal',
        'parentfoo'
      );
    });

    it('should find the type defined in the parent when parentExpect.findTypeOf is used', function() {
      expect(
        childExpect
          .createOutput('text')
          .foo()
          .toString(),
        'to equal',
        'childfoo'
      );
    });
  });

  it('should allow adding an assertion referencing the assertion and any types to the child expect', function() {
    childExpect.addAssertion('<any> foo <assertion>', function(
      expect,
      subject
    ) {
      return expect.shift(`${String(subject)}foo`);
    });
    expect(childExpect.assertions.foo, 'to satisfy', {
      1: {
        subject: { type: { name: 'any' } },
        args: [{ type: { name: 'assertion' } }, { type: { name: 'any' } }]
      }
    });
    childExpect('abc', 'foo', 'to equal', 'abcfoo');
  });

  it('#inspect should be able to delegate to another private type', function() {
    childExpect.addType({
      name: 'yadda',
      identify(obj) {
        return /^yadda/.test(obj);
      },
      inspect(value, depth, output) {
        output.fancyQuotes(value);
      }
    });
    childExpect.addType({
      name: 'yaddayadda',
      base: 'yadda',
      identify(obj) {
        return /^yaddayadda/.test(obj);
      },
      inspect(value, depth, output, inspect) {
        this.baseType.inspect(value, depth, output);
        output.fancyQuotes(value);
      }
    });

    childExpect.addStyle('fancyQuotes', function(text) {
      this.text('>>')
        .text(text)
        .text('<<');
    });

    expect(
      childExpect
        .createOutput('text')
        .appendInspected('yaddayaddafoo')
        .toString(),
      'to equal',
      '>>yaddayaddafoo<<>>yaddayaddafoo<<'
    );
  });

  it('#inspect should use the exported types when inspecting failed assertions', function() {
    childExpect.addStyle('fancyQuotes', function(text) {
      this.text('>>')
        .text(text)
        .text('<<');
    });

    childExpect.addType({
      name: 'yadda-no-qoutes',
      identify: obj => /^yaddayadda/.test(obj),
      inspect: (value, depth, output) => {
        output.text(value);
      }
    });

    childExpect.exportType({
      name: 'yadda',
      identify: obj => /^yaddayadda/.test(obj),
      inspect: (value, depth, output) => {
        output.fancyQuotes(value);
      }
    });

    childExpect.exportAssertion(
      '<yadda> to be short gibberish',
      (expect, gibberish) => expect(gibberish.length < 10, 'to be true')
    );

    expect(
      () => {
        parentExpect('yaddayaddafoo', 'to be short gibberish');
      },
      'to throw',
      'expected >>yaddayaddafoo<< to be short gibberish'
    );
  });
});
