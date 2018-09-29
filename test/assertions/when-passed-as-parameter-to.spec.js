/*global expect*/
describe('when passed as parameters to assertion', () => {
  function add(a, b) {
    return a + b;
  }

  it('should assert that the function invocation produces the correct output', () => {
    expect([3, 4], 'when passed as parameters to', add, 'to equal', 7);
  });

  it('should should provide the result as the fulfillment value if no assertion is provided', () => {
    return expect([3, 4], 'passed as parameters to', add).then(function(sum) {
      expect(sum, 'to equal', 7);
    });
  });

  it('works with an array-like object', () => {
    var args;
    (function() {
      args = arguments;
    })(3, 4);
    expect(args, 'when passed as parameters to', add, 'to equal', 7);
  });

  it('should produce a nested error message when the assertion fails', () => {
    expect(
      function() {
        expect([3, 4], 'when passed as parameters to', add, 'to equal', 8);
      },
      'to throw',
      'expected [ 3, 4 ]\n' +
        'when passed as parameters to function add(a, b) { return a + b; } to equal 8\n' +
        '  expected 7 to equal 8'
    );
  });

  it('should combine with other assertions (showcase)', () => {
    expect(
      [[1, 2], [3, 4]],
      'to have items satisfying',
      'when passed as parameters to',
      add,
      'to be a number'
    );
  });

  describe('when invoked as "when passed as parameter to"', () => {
    it('should pass the subject as a single parameter', () => {
      expect(
        1,
        'when passed as parameter to',
        add.bind(null, 1),
        'to equal',
        2
      );
    });

    it('should should provide the result as the fulfillment value if no assertion is provided', () => {
      return expect(2, 'passed as parameter to', add.bind(null, 1)).then(
        function(sum) {
          expect(sum, 'to equal', 3);
        }
      );
    });

    it('should fail with the correct error message and diff', () => {
      function increment(n) {
        return n + 1;
      }
      expect(
        function() {
          expect(1, 'when passed as parameter to', increment, 'to equal', 3);
        },
        'to throw',
        'expected 1\n' +
          'when passed as parameter to function increment(n) { return n + 1; } to equal 3\n' +
          '  expected 2 to equal 3'
      );
    });
  });

  describe('with the constructor flag', () => {
    function Foo(a, b) {
      this.a = a;
      this.b = b;
      this.numParams = arguments.length;
    }

    it('should create a new instance', () => {
      expect(
        [1, 2],
        'when passed as parameters to constructor',
        Foo,
        'to satisfy',
        function(obj) {
          expect(obj, 'to be a', Foo);
          expect(obj.a, 'to equal', 1);
          expect(obj.b, 'to equal', 2);
          expect(obj.numParams, 'to equal', 2);
        }
      );
    });
  });

  describe('with the async flag', () => {
    // prettier-ignore
    function delayedIncrement(num, cb) {
      setTimeout(function () {
        if (typeof num === 'number') {
          cb(null, num + 1);
        } else {
          cb(new Error('not a number'));
        }
      }, 1);
    }

    it('should succeed', () => {
      return expect(
        [123],
        'when passed as parameters to async',
        delayedIncrement,
        'to equal',
        124
      );
    });

    it('should fail if the result of the async function does not meet the criteria', () => {
      return expect(
        expect(
          [123],
          'when passed as parameters to async',
          delayedIncrement,
          'to equal',
          125
        ),
        'to be rejected with',
        'expected [ 123 ] when passed as parameters to async\n' +
          'function delayedIncrement(num, cb) {\n' +
          '  setTimeout(function () {\n' +
          "    if (typeof num === 'number') {\n" +
          '      cb(null, num + 1);\n' +
          '    } else {\n' +
          "      cb(new Error('not a number'));\n" +
          '    }\n' +
          '  }, 1);\n' +
          '} to equal 125\n' +
          '  expected 124 to equal 125'
      );
    });

    it('should fail if the async function calls the callback with an error', () => {
      return expect(
        expect(
          [false],
          'when passed as parameters to async',
          delayedIncrement,
          'to equal',
          125
        ),
        'to be rejected with',
        'expected [ false ] when passed as parameters to async\n' +
          'function delayedIncrement(num, cb) {\n' +
          '  setTimeout(function () {\n' +
          "    if (typeof num === 'number') {\n" +
          '      cb(null, num + 1);\n' +
          '    } else {\n' +
          "      cb(new Error('not a number'));\n" +
          '    }\n' +
          '  }, 1);\n' +
          '} to equal 125\n' +
          "  expected Error('not a number') to be falsy"
      );
    });
  });
});
