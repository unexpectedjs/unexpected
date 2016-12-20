/*global expect*/
describe('to be rejected assertion', function () {
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

        it('should succeed if the function throws synchronously', function () {
            return expect(function () {
                throw new Error('foo');
            }, 'to be rejected');
        });
    });
});
