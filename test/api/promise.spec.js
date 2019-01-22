/* global expect */
describe('expect.promise', () => {
  it('should forward non-unexpected errors', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion('<any> to foo', function(expect, subject) {
        return expect.withError(
          function() {
            return expect.promise(function() {
              return expect.promise.any([
                expect.promise(function() {
                  expect(subject, 'to be', 24);
                }),
                expect.promise(function() {
                  throw new Error('wat');
                })
              ]);
            });
          },
          function(e) {
            // success
          }
        );
      });
    expect(
      function() {
        clonedExpect(42, 'to foo');
      },
      'to throw',
      'wat'
    );
  });

  it('should return the fulfilled promise even if it is oathbreakable', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion('<any> to foo', function(expect, subject) {
        return expect.promise(function() {
          expect(subject, 'to equal', 'foo');
          return 'bar';
        });
      });
    expect(clonedExpect('foo', 'to foo'), 'to be fulfilled with', 'bar');
  });

  it('should preserve the resolved value when an assertion contains a non-oathbreakable promise', function(done) {
    var clonedExpect = expect
      .clone()
      .addAssertion('<any> to foo', function(expect, subject) {
        return expect.promise(function(resolve, reject) {
          expect(subject, 'to equal', 'foo');
          setTimeout(function() {
            resolve('bar');
          }, 1);
        });
      });
    clonedExpect('foo', 'to foo').then(function(value) {
      expect(value, 'to equal', 'bar');
      done();
    });
  });

  it('should return a promise fulfilled with the return value when an assertion returns a non-promise value', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion('<any> to foo', function(expect, subject) {
        expect(subject, 'to equal', 'foo');
        return 'bar';
      });
    clonedExpect('foo', 'to foo').then(function(value) {
      expect(value, 'to equal', 'bar');
    });
  });

  describe('#and', () => {
    describe('with a synchronous assertion', () => {
      it('should succeed', () => {
        return expect('foo', 'to equal', 'foo').and('to be a string');
      });

      it('should succeed when another clause is added', () => {
        return expect('foo', 'to equal', 'foo')
          .and('to be a string')
          .and('to match', /^f/);
      });

      it('should work without returning the promise', () => {
        expect('foo', 'to equal', 'foo').and('to be a string');
      });

      it('should fail with a diff', () => {
        return expect(
          function() {
            return expect('foo', 'to equal', 'foo').and('to be a number');
          },
          'to error',
          "expected 'foo' to be a number"
        );
      });

      it('should fail with a diff even when the promise is not returned', () => {
        return expect(
          function() {
            expect('foo', 'to equal', 'foo').and('to be a number');
          },
          'to error',
          "expected 'foo' to be a number"
        );
      });

      describe('with an expect.it as the second clause', () => {
        it('should succeed', () => {
          return expect('foo', 'to equal', 'foo').and(
            expect.it('to be a string')
          );
        });

        it('should fail with a diff', () => {
          return expect(
            function() {
              return expect('foo', 'to equal', 'foo').and(
                expect.it('to be a number')
              );
            },
            'to error',
            "expected 'foo' to be a number"
          );
        });
      });
    });

    describe('with an asynchronous assertion anded with a synchronous one', () => {
      it('should succeed', () => {
        return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(
          'to be a string'
        );
      });

      it('should succeed when another clause is added', () => {
        return expect('foo', 'when delayed', 5, 'to equal', 'foo')
          .and('when delayed', 5, 'to be a string')
          .and('when delayed', 2, 'to be a string');
      });

      it('should fail with a diff when the asynchronous assertion fails', () => {
        return expect(
          function() {
            return expect('foo', 'when delayed', 5, 'to equal', 'bar').and(
              'to be a string'
            );
          },
          'to error',
          "expected 'foo' when delayed 5 to equal 'bar'\n" +
            '\n' +
            '-foo\n' +
            '+bar'
        );
      });

      it('should fail with a diff when the synchronous assertion fails', () => {
        return expect(
          function() {
            return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(
              'to be a number'
            );
          },
          'to error',
          "expected 'foo' to be a number"
        );
      });

      it('should fail with a diff when both assertions fail', () => {
        return expect(
          function() {
            return expect('foo', 'when delayed', 5, 'to equal', 'bar').and(
              'to be a number'
            );
          },
          'to error',
          "expected 'foo' when delayed 5 to equal 'bar'\n" +
            '\n' +
            '-foo\n' +
            '+bar'
        );
      });

      describe('with an expect.it as the second clause', () => {
        it('should succeed', () => {
          return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(
            expect.it('to be a string')
          );
        });

        it('should succeed when more clauses are added', () => {
          return expect('foo', 'when delayed', 5, 'to equal', 'foo')
            .and(expect.it('to be a string'))
            .and('to be a string')
            .and('to be a string');
        });

        it('should fail with a diff', () => {
          return expect(
            function() {
              return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(
                expect.it('to be a number')
              );
            },
            'to error',
            "expected 'foo' to be a number"
          );
        });
      });
    });

    describe('with a nested asynchronous assertion', () => {
      it('should mount the and method on a promise returned from a nested assertion', () => {
        var clonedExpect = expect
          .clone()
          .addAssertion('<any> to foo', function(expect, subject) {
            return expect(subject, 'to bar').and('to equal', 'foo');
          })
          .addAssertion('<any> to bar', function(expect, subject) {
            return expect.promise(function(run) {
              setTimeout(
                run(function() {
                  expect(subject, 'to be truthy');
                }),
                1
              );
            });
          });
        return clonedExpect('foo', 'to foo');
      });
    });
  });

  it('should throw an exception if the argument was not a function', () => {
    var expectedError = new TypeError(
      'expect.promise(...) requires a function argument to be supplied.\n' +
        'See http://unexpected.js.org/api/promise/ for more details.'
    );
    expect(
      function() {
        expect.promise();
      },
      'to throw',
      expectedError
    );

    [undefined, null, '', [], {}].forEach(function(arg) {
      expect(
        function() {
          expect.promise(arg);
        },
        'to throw',
        expectedError
      );
    });
  });

  let inspectMethodName = 'inspect';
  // In node.js 10+ the custom inspect method name has to be given as a symbol
  // or we'll get ugly deprecation warnings logged to the console.
  try {
    const util = require('util');
    if (util.inspect.custom) {
      inspectMethodName = util.inspect.custom;
    }
  } catch (err) {}
  describe('#inspect', () => {
    var originalDefaultFormat = expect.output.constructor.defaultFormat;
    beforeEach(() => {
      expect.output.constructor.defaultFormat = 'text';
    });
    afterEach(() => {
      expect.output.constructor.defaultFormat = originalDefaultFormat;
    });

    it('should inspect a fulfilled promise without a value', () => {
      expect(
        expect
          .promise(function() {
            expect(2, 'to equal', 2);
          })
          [inspectMethodName](),
        'to equal',
        'Promise (fulfilled)'
      );
    });

    it('should inspect a fulfilled promise with a value', () => {
      expect(
        expect
          .promise(function() {
            return 123;
          })
          [inspectMethodName](),
        'to equal',
        'Promise (fulfilled) => 123'
      );
    });

    it('should inspect a pending promise', () => {
      var asyncPromise = expect(
        'foo',
        'when delayed a little bit',
        'to equal',
        'foo'
      );
      expect(
        asyncPromise[inspectMethodName](),
        'to equal',
        'Promise (pending)'
      );
      return asyncPromise;
    });

    it('should inspect a rejected promise without a reason', () => {
      var promise = expect.promise(function(resolve, reject) {
        reject();
      });

      return promise.caught(function() {
        expect(promise[inspectMethodName](), 'to equal', 'Promise (rejected)');
      });
    });

    it('should inspect a rejected promise with a reason', () => {
      var promise = expect.promise(function(resolve, reject) {
        setTimeout(function() {
          reject(new Error('argh'));
        }, 0);
      });

      return promise.caught(function() {
        expect(
          promise[inspectMethodName](),
          'to equal',
          "Promise (rejected) => Error('argh')"
        );
      });
    });
  });

  describe('#settle', () => {
    it('should support non-Promise leaves', () => {
      return expect.promise
        .settle({
          a: 123
        })
        .then(function(promises) {
          expect(promises, 'to equal', []);
        });
    });
  });

  describe('called with a function that takes a single ("run") parameter', () => {
    it('should allow providing an empty function', () => {
      return expect.promise(function(run) {
        setImmediate(run());
      });
    });

    it('should not fulfill the promise until the outer function has returned', () => {
      return expect(
        expect.promise(function(run) {
          run()();
          throw new Error('foo');
        }),
        'to be rejected with',
        'foo'
      );
    });

    it('should provide a run function that preserves the return value of the supplied function', () => {
      return expect.promise(function(run) {
        var runner = run(function() {
          return 123;
        });
        expect(runner(), 'to equal', 123);
      });
    });
  });
});
