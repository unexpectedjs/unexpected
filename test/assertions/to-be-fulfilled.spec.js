/*global expect*/
describe('to be fulfilled assertion', function () {
    var Promise = typeof weknowhow === 'undefined' ?
        require('rsvp').Promise :
        window.RSVP.Promise;

    describe('with no additional argument', function () {
        it('should succeed if the response is resolved with any value', function () {
            return expect(new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve('yay');
                }, 0);
            }), 'to be fulfilled');
        });

        it('should fail if the promise is rejected', function () {
            return expect(
                expect(new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject('unhappy times');
                    }, 0);
                }), 'to be fulfilled'),
                'to be rejected with',
                "expected Promise to be fulfilled\n" +
                    "  Promise unexpectedly rejected with 'unhappy times'"
            );
        });

        it('should fail with the correct message if the promise is rejected without a reason', function () {
            return expect(
                expect(new Promise(function (resolve, reject) {
                    setTimeout(reject, 0);
                }), 'to be fulfilled'),
                'to be rejected with',
                "expected Promise to be fulfilled\n" +
                    "  Promise unexpectedly rejected"
            );
        });
    });

    describe('with an additional argument', function () {
        it('should succeed if the response is resolved with a reason satisfying the argument', function () {
            return expect(new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(123);
                }, 0);
            }), 'to be fulfilled with', 123);
        });

        it('should forward the fulfillment value', function () {
            return expect(expect.promise.resolve(123), 'to be fulfilled with', 123).then(function (value) {
                expect(value, 'to equal', 123);
            });
        });

        it('should fail if the promise is resolved with a value that does not satisfy the argument', function () {
            return expect(
                expect(new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve({ foo: 'bar', baz: 'quux' });
                    }, 1);
                }), 'to be fulfilled with', { baz: 'qux' }),
                'to be rejected with',
                "expected Promise to be fulfilled with { baz: 'qux' }\n" +
                    "  expected { foo: 'bar', baz: 'quux' } to satisfy { baz: 'qux' }\n" +
                    "\n" +
                    "  {\n" +
                    "    foo: 'bar',\n" +
                    "    baz: 'quux' // should equal 'qux'\n" +
                    "                //\n" +
                    "                // -quux\n" +
                    "                // +qux\n" +
                    "  }"

            );
        });
    });

    describe('when passed a function', function () {
        it('should succeed if the function returns a promise that succeeds', function () {
            return expect(function () {
                return expect.promise(function () {
                    return 123;
                });
            }, 'to be fulfilled');
        });

        it('should forward the fulfillment value', function () {
            return expect(function () {
                return expect.promise(function () {
                    return 123;
                });
            }, 'to be fulfilled').then(function (value) {
                expect(value, 'to equal', 123);
            });
        });

        it('should fail if the function returns a promise that fails', function () {
            expect(function () {
                return expect(function () {
                    return expect.promise.reject(new Error('foo'));
                }, 'to be fulfilled');
            }, 'to throw',
                "expected\n" +
                "function () {\n" +
                "  return expect.promise.reject(new Error('foo'));\n" +
                "}\n" +
                "to be fulfilled\n" +
                "  expected Promise (rejected) => Error('foo') to be fulfilled\n" +
                "    Promise (rejected) => Error('foo') unexpectedly rejected with Error('foo')"
            );
        });

        it('should fail if the function returns a promise that is fulfilled with the wrong value', function () {
            expect(function () {
                return expect(function () {
                    return expect.promise.resolve(123);
                }, 'to be fulfilled with', 456);
            }, 'to throw',
                "expected\n" +
                "function () {\n" +
                "  return expect.promise.resolve(123);\n" +
                "}\n" +
                "to be fulfilled with 456\n" +
                "  expected Promise (fulfilled) => 123 to be fulfilled with 456\n" +
                "    expected 123 to equal 456"
            );
        });

        it('should fail if the function throws synchronously', function () {
            expect(function () {
                return expect(function () {
                    throw new Error('foo');
                }, 'to be fulfilled');
            }, 'to throw',
                "expected function () { throw new Error('foo'); } to be fulfilled\n" +
                "  expected Promise (rejected) => Error('foo') to be fulfilled\n" +
                "    Promise (rejected) => Error('foo') unexpectedly rejected with Error('foo')"
            );
        });
    });

    it('should use the stack of the thrown error when failing', function () {
        return expect(function () {
            return expect(function () {
                return expect.promise(function () {
                    (function thisIsImportant() {
                        throw new Error('argh');
                    }());
                });
            }, 'to be fulfilled');
        }, 'to error', function (err) {
            expect(err.stack, 'to match', /at thisIsImportant/);
        });
    });

    describe('with another promise library', function () {
        var Promise = typeof weknowhow === 'undefined' ?
            require('rsvp').Promise :
            window.RSVP.Promise;

        it('should use the stack of the thrown error when failing', function () {
            return expect(function () {
                return expect(function () {
                    return new Promise(function (resolve, reject) {
                        (function thisIsImportant() {
                            throw new Error('argh');
                        }());
                    });
                }, 'to be fulfilled');
            }, 'to error', function (err) {
                expect(err.stack, 'to match', /at thisIsImportant/);
            });
        });
    });
});
