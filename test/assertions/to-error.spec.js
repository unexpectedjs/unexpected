/*global expect*/
describe('to error assertion', function () {
    describe('with a function that throws', function () {
        describe('with the "not" flag', function () {
            it('should indicate that the function threw', function () {
                expect(function () {
                    expect(function () {
                        throw new Error('yikes');
                    }, 'not to error');
                }, 'to throw',
                       "expected function () { throw new Error('yikes'); } not to error\n" +
                       "  threw: Error('yikes')"
                      );
            });
        });
    });

    describe('with a function that returns a promise that is rejected', function () {
        describe('with the "not" flag', function () {
            it('should indicate that the function returned a rejected promise', function () {
                return expect(
                    expect(function () {
                        return expect.promise(function (resolve, reject) {
                            setTimeout(function () {
                                reject(new Error('wat'));
                            }, 1);
                        });
                    }, 'not to error'),
                    'to be rejected with',
                    "expected\n" +
                        "function () {\n" +
                        "  return expect.promise(function (resolve, reject) {\n" +
                        "    setTimeout(function () {\n" +
                        "      reject(new Error('wat'));\n" +
                        "    }, 1);\n" +
                        "  });\n" +
                        "}\n" +
                        "not to error\n" +
                        "  returned promise rejected with: Error('wat')"
                );
            });
        });
    });

    it('should fail if the function returns a fulfilled promise', function () {
        expect(function () {
            expect(function () {
                return expect.promise.resolve(123);
            }, 'to error');
        }, 'to throw',
            "expected\n" +
            "function () {\n" +
            "  return expect.promise.resolve(123);\n" +
            "}\n" +
            "to error"
        );
    });

    it('should fail if the function does not throw and does not return a promise', function () {
        expect(function () {
            expect(function () {}, 'to error');
        }, 'to throw',
            "expected function () {} to error"
        );
    });

    it('should allow matching the message of an UnexpectedError against a regexp', function () {
        expect(function () {
            expect(123, 'to equal', 456);
        }, 'to error', /expected 123 to equal 456/);
    });

    describe('without the not flag', function () {
        it('should use the stack of the rejection reason when failing', function () {
            return expect(function () {
                return expect(function () {
                    return expect.promise(function () {
                        (function thisIsImportant() {
                            throw new Error('argh');
                        }());
                    });
                }, 'to error with', 'foobar');
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
                    }, 'to error with', 'foobar');
                }, 'to error', function (err) {
                    expect(err.stack, 'to match', /at thisIsImportant/);
                });
            });
        });
    });

    describe('with the not flag', function () {
        it('should use the stack of the rejection reason when failing', function () {
            return expect(function () {
                return expect(function () {
                    return expect.promise(function () {
                        (function thisIsImportant() {
                            throw new Error('argh');
                        }());
                    });
                }, 'not to error');
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
                    }, 'not to error');
                }, 'to error', function (err) {
                    expect(err.stack, 'to match', /at thisIsImportant/);
                });
            });
        });
    });
});
