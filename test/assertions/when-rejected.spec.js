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
});
