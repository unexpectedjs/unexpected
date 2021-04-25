/* global expect, expectWithUnexpectedMagicPen */
describe('function type', () => {
  it('should inspect an empty anonymous function correctly', () => {
    expect(function () {}, 'to inspect as', 'function () {}');
  });

  it('should inspect an empty named function correctly', () => {
    expect(function foo() {}, 'to inspect as', 'function foo() {}');
  });

  it('should inspect a function with a custom toString correctly', () => {
    const fn = function foo() {};
    fn.toString = 'breakage';
    expect(fn, 'to inspect as', 'function foo() {}');
  });

  const isIE =
    typeof navigator !== 'undefined' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent.indexOf('Trident') !== -1;

  if (!isIE) {
    // For now let's just disable these tests in those environments

    it('should inspect an anonymous bound function correctly', () => {
      expect(
        // eslint-disable-next-line no-extra-bind
        function () {}.bind({}),
        'to inspect as',
        'function bound () { /* native code */ }'
      );
    });

    it('should inspect a named bound function correctly', () => {
      expect(
        // eslint-disable-next-line no-extra-bind
        function foo() {}.bind({}),
        'to inspect as',
        'function bound foo() { /* native code */ }'
      );
    });
  }

  it('should inspect an function with just a newline correctly', () => {
    expect(function () {}, 'to inspect as', 'function () {}');
  });

  it('should inspect a one-line function correctly', () => {
    /* eslint-disable no-unused-vars, no-var */
    expect(
      // prettier-ignore
      function() { var a = 123;console.log(a); },
      'to inspect as',
      'function () { var a = 123;console.log(a); }'
    );
    /* eslint-enable no-unused-vars, no-var */
  });

  it('should inspect a short one-line function with leading and trailing newline correctly', () => {
    /* eslint-disable no-unused-vars, no-var */
    expect(
      // prettier-ignore
      function() {
        var a = 123;console.log(a); },
      'to inspect as',
      'function () { var a = 123;console.log(a); }'
    );
    /* eslint-enable no-unused-vars, no-var */
  });

  it('should inspect a long one-line function with leading and trailing newline correctly', () => {
    /* eslint-disable no-unused-vars, no-var */
    expect(
      // prettier-ignore
      function() {
        var a = 123 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2;console.log(a);
      },
      'to inspect as',
      'function () {\n' +
        '  var a = 123 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2;console.log(a);\n' +
        '}'
    );
    /* eslint-enable no-unused-vars, no-var */
  });

  /* eslint-disable no-unused-vars, no-var */
  function twoLinesWithComment() {
    var a = 123;
    console.log(a); // foo
  }
  /* eslint-enable no-unused-vars, no-var */

  it('should inspect a short two-line function with leading and trailing newline correctly and a C++-style comment correctly', () => {
    /* eslint-disable no-unused-vars */
    expect(
      // prettier-ignore
      twoLinesWithComment,
      'to inspect as',
      'function twoLinesWithComment() {\n' +
        '  var a = 123;\n  console.log(a); // foo\n' +
        '}'
    );
    /* eslint-enable no-unused-vars */
  });

  it('should reindent a function with an indentation size of 4', () => {
    expect(
      // prettier-ignore
      function(a) {
          if (a === 1) {
              console.log(a);
          }
      },
      'to inspect as',
      'function (a) {\n' +
        '  if (a === 1) {\n' +
        '    console.log(a);\n' +
        '  }\n' +
        '}'
    );
  });

  it('should reindent a function with an indentation size of 3', () => {
    expect(
      // prettier-ignore
      function(a) {
         if (a === 1) {
            console.log(a);
         }
      },
      'to inspect as',
      'function (a) {\n' +
        '  if (a === 1) {\n' +
        '    console.log(a);\n' +
        '  }\n' +
        '}'
    );
  });

  it('should reindent a function with an indentation size of 1', () => {
    expect(
      // prettier-ignore
      function(a) {
       if (a === 1) {
        console.log(a);
       }
      },
      'to inspect as',
      'function (a) {\n' +
        '  if (a === 1) {\n' +
        '    console.log(a);\n' +
        '  }\n' +
        '}'
    );
  });

  expect.addAssertion(
    '<string> if supported by the runtime <assertion>',
    (expect, subject) => {
      let value;
      try {
        // eslint-disable-next-line no-new-func
        value = new Function(`return ${subject};`)();
      } catch (err) {
        // Not supported, don't do anything
        return;
      }
      return expect.shift(value);
    }
  );

  it('should render a single param arrow function', () => {
    expect(
      'a => a + 1',
      'if supported by the runtime to inspect as',
      'a => a + 1'
    );
  });

  it('should render an implicit return multiline arrow function', () => {
    expect(
      'a => \n    a + 1',
      'if supported by the runtime to inspect as',
      'a => \n    a + 1'
    );
  });

  it('should render an implicit return arrow function a single line break after the arrow', () => {
    expect(
      'a =>\n  a',
      'if supported by the runtime to inspect as',
      `a =>\n  a`
    );
  });

  it('should reindent an implicit return arrow function with a single line break after the arrow', () => {
    expect(
      'a =>\n    a',
      'if supported by the runtime to inspect as',
      `a =>\n  a`
    );
  });

  it('should render an implicit return multiline arrow function with an evil alternation', () => {
    expect(
      'a => \n    a || {}',
      'if supported by the runtime to inspect as',
      'a => \n    a || {}'
    );
  });

  it('should reindent an implicit return multiline arrow function with 1 space indent', () => {
    expect(
      '() =>\n foo(\n  1\n )',
      'if supported by the runtime to inspect as',
      '() =>\n  foo(\n    1\n  )'
    );
  });

  it('should reindent an implicit return multiline arrow function with 2 space indent', () => {
    expect(
      '() =>\n        foo(\n          1\n        )',
      'if supported by the runtime to inspect as',
      '() =>\n  foo(\n    1\n  )'
    );
  });

  it('should reindent an implicit return multiline arrow function with 4 space indent', () => {
    expect(
      '() =>\n      foo(\n         1\n      )',
      'if supported by the runtime to inspect as',
      '() =>\n  foo(\n    1\n  )'
    );
  });

  it('should reindent an implicit return multiline arrow function with long leading indent', () => {
    expect(
      '() =>\n        foo(\n            1\n        )',
      'if supported by the runtime to inspect as',
      '() =>\n  foo(\n    1\n  )'
    );
  });

  it('should render a multi param arrow function', () => {
    expect(
      '(a, b) => a + b;',
      'if supported by the runtime to inspect as',
      '(a, b) => a + b'
    );
  });

  it('should render "async" before an AsyncFunction instance', () => {
    expect(
      'async function foo(a) { return a + 1; }',
      'if supported by the runtime to inspect as',
      'async function foo(a) { return a + 1; }'
    );
  });

  it('should inspect an anonymous generator', () => {
    expect(
      'function*(){}',
      'if supported by the runtime to inspect as',
      'function *(){}'
    );
  });

  it('should inspect an anonymous generator with spaces around the *', () => {
    expect(
      'function * (){}',
      'if supported by the runtime to inspect as',
      'function *(){}'
    );
  });

  it('should inspect a named generator', () => {
    expect(
      'function*foo(){}',
      'if supported by the runtime to inspect as',
      'function *foo(){}'
    );
  });

  it('should inspect a named generator with spaces around the *', () => {
    expect(
      'function * foo(){}',
      'if supported by the runtime to inspect as',
      'function *foo(){}'
    );
  });

  it('should inspect an anonymous class', () => {
    expect('class {}', 'if supported by the runtime to inspect as', 'class {}');
  });

  it('should inspect a class', () => {
    expect(
      'class Foo {}',
      'if supported by the runtime to inspect as',
      'class Foo {}'
    );
  });

  it('should inspect and reindent a non-empty class', () => {
    expect(
      'class Foo {\n' +
        ' constructor(bar) {\n' +
        '  this.bar = bar;\n' +
        ' }\n' +
        '}',
      'if supported by the runtime to inspect as',
      'class Foo {\n' +
        '  constructor(bar) {\n' +
        '    this.bar = bar;\n' +
        '  }\n' +
        '}'
    );
  });

  describe('diff()', function () {
    function foo() {}
    function bar() {}

    foo.baz = 123;

    describe('against another function', function () {
      it('should not produce a diff', function () {
        const functionType = expect.getType('function');
        expect(
          functionType.diff(foo, bar, expect.createOutput()),
          'to be undefined'
        );
      });
    });

    describe('against an object', function () {
      it('should delegate to the object diff', function () {
        const functionType = expect.getType('function');
        const diff = functionType.diff(
          foo,
          { baz: 456 },
          expect.createOutput()
        );
        expectWithUnexpectedMagicPen(
          diff,
          'to equal',
          expect
            .createOutput()
            .text('Mismatching constructors Function should be Object')
        );
      });
    });
  });
});
