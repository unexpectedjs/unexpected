/*global expect*/
describe('to be rejected assertion', function () {
    var Promise = typeof weknowhow === 'undefined' ?
        require('rsvp').Promise :
        window.RSVP.Promise;

    describe('with no additional argument', function () {
        it('should succeed if the response is rejected for any reason', function () {
            return expect(new Promise(function (resolve, reject) {
                setTimeout(function () {
                    reject();
                }, 0);
            }), 'to be rejected');
        });

        it('should provide the rejection reason as the fulfillment value', function () {
            return expect(expect.promise.reject(new Error('foo')), 'to be rejected').then(function (reason) {
                expect(reason, 'to have message', 'foo');
            });
        });

        it('should succeed if the promise is rejected without a reason', function () {
            return expect(
                expect(new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve('happy times');
                    }, 0);
                }), 'to be rejected'),
                'to be rejected with',
                "expected Promise to be rejected\n" +
                    "  Promise unexpectedly fulfilled with 'happy times'"
            );
        });

        it('should fail if the promise is fulfilled', function () {
            return expect(
                expect(new Promise(function (resolve, reject) {
                    setTimeout(resolve, 0);
                }), 'to be rejected'),
                'to be rejected with',
                'expected Promise to be rejected\n' +
                    '  Promise unexpectedly fulfilled'
            );
        });

        it('should fail if the promise is fulfilled with a value', function () {
            return expect(
                expect(new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve('happy times');
                    }, 0);
                }), 'to be rejected'),
                'to be rejected with',
                "expected Promise to be rejected\n" +
                    "  Promise unexpectedly fulfilled with 'happy times'"
            );
        });
    });

    describe('with an additional argument', function () {
        it('should succeed if the response is rejected with a reason satisfying the argument', function () {
            return expect(new Promise(function (resolve, reject) {
                setTimeout(function () {
                    reject(new Error('OMG!'));
                }, 0);
            }), 'to be rejected with', new Error('OMG!'));
        });

        it('should provide the rejection reason as the fulfillment value', function () {
            return expect(expect.promise.reject(new Error('foo')), 'to be rejected with', 'foo').then(function (reason) {
                expect(reason, 'to have message', 'foo');
            });
        });

        it('should support matching the error message against a regular expression', function () {
            return expect(new Promise(function (resolve, reject) {
                setTimeout(function () {
                    reject(new Error('OMG!'));
                }, 0);
            }), 'to be rejected with', /MG/);
        });

        it('should support matching the error message of an UnexpectedError against a regular expression', function () {
            return expect(new Promise(function (resolve, reject) {
                setTimeout(function () {
                    try {
                        expect(false, 'to be truthy');
                    } catch (err) {
                        reject(err);
                    }
                }, 0);
            }), 'to be rejected with', /to be/);
        });

        it('should fail if the promise is rejected with a reason that does not satisfy the argument', function () {
            return expect(
                expect(new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new Error('OMG!'));
                    }, 1);
                }), 'to be rejected with', new Error('foobar')),
                'to be rejected with',
                "expected Promise to be rejected with Error('foobar')\n" +
                    "  expected Error('OMG!') to satisfy Error('foobar')\n" +
                    "\n" +
                    "  Error({\n" +
                    "    message: 'OMG!' // should equal 'foobar'\n" +
                    "                    //\n" +
                    "                    // -OMG!\n" +
                    "                    // +foobar\n" +
                    "  })"
            );
        });
    });

    describe('when passed a function', function () {
        it('should succeed if the function returns a promise that is rejected', function () {
            return expect(function () {
                return expect.promise.reject(new Error('foo'));
            }, 'to be rejected');
        });

        it('should forward the rejection reason', function () {
            return expect(function () {
                return expect.promise(function () {
                    return expect.promise.reject(new Error('foo'));
                });
            }, 'to be rejected').then(function (err) {
                expect(err, 'to have message', 'foo');
            });
        });

        it('should fail if the function returns a promise that is fulfilled', function () {
            expect(function () {
                return expect(function () {
                    return expect.promise.resolve(123);
                }, 'to be rejected');
            }, 'to throw',
                "expected\n" +
                "function () {\n" +
                "  return expect.promise.resolve(123);\n" +
                "}\n" +
                "to be rejected\n" +
                "  expected Promise (fulfilled) => 123 to be rejected\n" +
                "    Promise (fulfilled) => 123 unexpectedly fulfilled with 123"
            );
        });

        it('should fail if the function returns a promise that is fulfilled with the wrong value', function () {
            expect(function () {
                return expect(function () {
                    return expect.promise.reject(new Error('foo'));
                }, 'to be rejected with', new Error('bar'));
            }, 'to throw',
                "expected\n" +
                "function () {\n" +
                "  return expect.promise.reject(new Error('foo'));\n" +
                "}\n" +
                "to be rejected with Error('bar')\n" +
                "  expected Promise (rejected) => Error('foo') to be rejected with Error('bar')\n" +
                "    expected Error('foo') to satisfy Error('bar')\n" +
                "\n" +
                "    Error({\n" +
                "      message: 'foo' // should equal 'bar'\n" +
                "                     //\n" +
                "                     // -foo\n" +
                "                     // +bar\n" +
                "    })"
            );
        });

        it('should succeed if the function throws synchronously', function () {
            return expect(function () {
                throw new Error('foo');
            }, 'to be rejected');
        });
    });

    it('should use the stack of the rejection reason when failing', function () {
        return expect(function () {
            return expect(function () {
                return expect.promise(function () {
                    (function thisIsImportant() {
                        throw new Error('argh');
                    }());
                });
            }, 'to be rejected with', 'foobar');
        }, 'to error', function (err) {
            expect(err.stack, 'to match', /at thisIsImportant/);
        });
    });

    describe('with another promise library', function () {
        var Promise = typeof weknowhow === 'undefined' ?
            require('rsvp').Promise :
            window.RSVP.Promise;

        it('should use the stack of the rejection reason when failing', function () {
            return expect(function () {
                return expect(function () {
                    return new Promise(function (resolve, reject) {
                        (function thisIsImportant() {
                            throw new Error('argh');
                        }());
                    });
                }, 'to be rejected with', 'foobar');
            }, 'to error', function (err) {
                expect(err.stack, 'to match', /at thisIsImportant/);
            });
        });
    });
});
