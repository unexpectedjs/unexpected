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
    });

    describe('with an additional argument', function () {
        it('should succeed if the response is resolved with a reason satisfying the argument', function () {
            return expect(new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(123);
                }, 0);
            }), 'to be fulfilled with', 123);
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
});
