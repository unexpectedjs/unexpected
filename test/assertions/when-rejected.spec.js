/*global expect*/
describe('when rejected adverbial assertion', function () {
    var Promise = typeof weknowhow === 'undefined' ?
        require('rsvp').Promise :
        window.RSVP.Promise;

    it('should delegate to the next assertion with the rejection reason', function () {
        return expect(new Promise(function (resolve, reject) {
            setTimeout(function () {
                reject({ foo: 'bar' });
            }, 0);
        }), 'when rejected', 'to satisfy', { foo: 'bar' });
    });

    it('should fail when the next assertion fails', function () {
        return expect(
            expect(new Promise(function (resolve, reject) {
                setTimeout(function () {
                    reject({ foo: 'bar' });
                }, 0);
            }), 'when rejected', 'to satisfy', { foo: 'baz' }),
            'to be rejected with',
            "expected Promise when rejected to satisfy { foo: 'baz' }\n" +
                "  expected { foo: 'bar' } to satisfy { foo: 'baz' }\n" +
                "\n" +
                "  {\n" +
                "    foo: 'bar' // should equal 'baz'\n" +
                "               //\n" +
                "               // -bar\n" +
                "               // +baz\n" +
                "  }"
        );
    });

    it('should fail if the promise is fulfilled', function () {
        return expect(
            expect(new Promise(function (resolve, reject) {
                setTimeout(resolve, 0);
            }), 'when rejected', 'to equal', new Error('unhappy times')),
            'to be rejected with',
            "expected Promise when rejected to equal Error('unhappy times')\n" +
            "  Promise unexpectedly fulfilled"
        );
    });

    it('should fail if the promise is fulfilled with a value', function () {
        return expect(
            expect(new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve('happy times');
                }, 0);
            }), 'when rejected', 'to equal', new Error('unhappy times')),
            'to be rejected with',
            "expected Promise when rejected to equal Error('unhappy times')\n" +
                "  Promise unexpectedly fulfilled with 'happy times'"
        );
    });

    describe('when passed a function', function () {
        it('should succeed if the function returns a promise that is rejected', function () {
            return expect(function () {
                return expect.promise(function () {
                    throw new Error('foo');
                });
            }, 'when rejected to be an object');
        });

        it('should fail if the function returns a promise that is fulfilled', function () {
            expect(function () {
                return expect(function () {
                    return expect.promise.resolve(123);
                }, 'when rejected to be an object');
            }, 'to throw',
                "expected\n" +
                "function () {\n" +
                "  return expect.promise.resolve(123);\n" +
                "}\n" +
                "when rejected to be an object\n" +
                "  expected Promise (fulfilled) => 123 when rejected to be an object\n" +
                "    Promise (fulfilled) => 123 unexpectedly fulfilled with 123"
            );
        });

        it('should succeed if the function throws synchronously', function () {
            return expect(function () {
                throw new Error('foo');
            }, 'when rejected to be an', Error);
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
            }, 'when rejected to have message', 'yay');
        }, 'to error', function (err) {
            expect(err.stack, 'to match', /at thisIsImportant/);
        });
    });
});
