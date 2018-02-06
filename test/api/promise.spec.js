/*global expect*/
describe('expect.promise', function() {
  it('should forward non-unexpected errors', function() {
    var clonedExpect = expect
      .clone()
      .addAssertion('to foo', function(expect, subject, value) {
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

  it('should return the fulfilled promise even if it is oathbreakable', function() {
    var clonedExpect = expect
      .clone()
      .addAssertion('to foo', function(expect, subject, value) {
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
      .addAssertion('to foo', function(expect, subject, value) {
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

  it('should return a promise fulfilled with the return value when an assertion returns a non-promise value', function() {
    var clonedExpect = expect
      .clone()
      .addAssertion('to foo', function(expect, subject, value) {
        expect(subject, 'to equal', 'foo');
        return 'bar';
      });
    clonedExpect('foo', 'to foo').then(function(value) {
      expect(value, 'to equal', 'bar');
    });
  });

  describe('#and', function() {
    describe('with a synchronous assertion', function() {
      it('should succeed', function() {
        return expect('foo', 'to equal', 'foo').and('to be a string');
      });

      it('should succeed when another clause is added', function() {
        return expect('foo', 'to equal', 'foo')
          .and('to be a string')
          .and('to match', /^f/);
      });

      it('should work without returning the promise', function() {
        expect('foo', 'to equal', 'foo').and('to be a string');
      });

      it('should fail with a diff', function() {
        return expect(
          function() {
            return expect('foo', 'to equal', 'foo').and('to be a number');
          },
          'to error',
          "expected 'foo' to be a number"
        );
      });

      it('should fail with a diff even when the promise is not returned', function() {
        return expect(
          function() {
            expect('foo', 'to equal', 'foo').and('to be a number');
          },
          'to error',
          "expected 'foo' to be a number"
        );
      });

      describe('with an expect.it as the second clause', function() {
        it('should succeed', function() {
          return expect('foo', 'to equal', 'foo').and(
            expect.it('to be a string')
          );
        });

        it('should fail with a diff', function() {
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

    describe('with an asynchronous assertion anded with a synchronous one', function() {
      it('should succeed', function() {
        return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(
          'to be a string'
        );
      });

      it('should succeed when another clause is added', function() {
        return expect('foo', 'when delayed', 5, 'to equal', 'foo')
          .and('when delayed', 5, 'to be a string')
          .and('when delayed', 2, 'to be a string');
      });

      it('should fail with a diff when the asynchronous assertion fails', function() {
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

      it('should fail with a diff when the synchronous assertion fails', function() {
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

      it('should fail with a diff when both assertions fail', function() {
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

      describe('with an expect.it as the second clause', function() {
        it('should succeed', function() {
          return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(
            expect.it('to be a string')
          );
        });

        it('should succeed when more clauses are added', function() {
          return expect('foo', 'when delayed', 5, 'to equal', 'foo')
            .and(expect.it('to be a string'))
            .and('to be a string')
            .and('to be a string');
        });

        it('should fail with a diff', function() {
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

    describe('with a nested asynchronous assertion', function() {
      it('should mount the and method on a promise returned from a nested assertion', function() {
        var clonedExpect = expect
          .clone()
          .addAssertion('to foo', function(expect, subject) {
            return expect(subject, 'to bar').and('to equal', 'foo');
          })
          .addAssertion('to bar', function(expect, subject) {
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

  it('should throw an exception if the argument was not a function', function() {
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

  describe('#inspect', function() {
    var originalDefaultFormat = expect.output.constructor.defaultFormat;
    beforeEach(function() {
      expect.output.constructor.defaultFormat = 'text';
    });
    afterEach(function() {
      expect.output.constructor.defaultFormat = originalDefaultFormat;
    });

    it('should inspect a fulfilled promise without a value', function() {
      expect(
        expect
          .promise(function() {
            expect(2, 'to equal', 2);
          })
          .inspect(),
        'to equal',
        'Promise (fulfilled)'
      );
    });

    it('should inspect a fulfilled promise with a value', function() {
      expect(
        expect
          .promise(function() {
            return 123;
          })
          .inspect(),
        'to equal',
        'Promise (fulfilled) => 123'
      );
    });

    it('should inspect a pending promise', function() {
      var asyncPromise = expect(
        'foo',
        'when delayed a little bit',
        'to equal',
        'foo'
      );
      expect(asyncPromise.inspect(), 'to equal', 'Promise (pending)');
      return asyncPromise;
    });

    it('should inspect a rejected promise without a reason', function() {
      var promise = expect.promise(function(resolve, reject) {
        reject();
      });

      return promise.caught(function() {
        expect(promise.inspect(), 'to equal', 'Promise (rejected)');
      });
    });

    it('should inspect a rejected promise with a reason', function() {
      var promise = expect.promise(function(resolve, reject) {
        setTimeout(function() {
          reject(new Error('argh'));
        }, 0);
      });

      return promise.caught(function() {
        expect(
          promise.inspect(),
          'to equal',
          "Promise (rejected) => Error('argh')"
        );
      });
    });
  });

  describe('#settle', function() {
    it('should support non-Promise leaves', function() {
      return expect.promise
        .settle({
          a: 123
        })
        .then(function(promises) {
          expect(promises, 'to equal', []);
        });
    });
  });

  describe('called with a function that takes a single ("run") parameter', function() {
    it('should allow providing an empty function', function() {
      return expect.promise(function(run) {
        setImmediate(run());
      });
    });

    it('should not fulfill the promise until the outer function has returned', function() {
      return expect(
        expect.promise(function(run) {
          run()();
          throw new Error('foo');
        }),
        'to be rejected with',
        'foo'
      );
    });

    it('should provide a run function that preserves the return value of the supplied function', function() {
      return expect.promise(function(run) {
        var runner = run(function() {
          return 123;
        });
        expect(runner(), 'to equal', 123);
      });
    });
  });
});
