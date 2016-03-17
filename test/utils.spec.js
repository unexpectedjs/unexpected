/*global unexpected*/
var expect = unexpected.clone();

if (typeof process === 'object') {
    var proxyquire = require('proxyquire');

    describe('without Object.is available', function () {
        var objectIs = Object.is;
        before(function () {
            Object.is = undefined;
        });

        after(function () {
            Object.is = objectIs;
        });

        var utils;
        beforeEach(function () {
            // Avoid require's cache:
            utils = proxyquire('../lib/utils', {});
        });

        it('should say that the number 123 is itself', function () {
            expect(utils.objectIs(123, 123), 'to be true');
        });

        it('should say that the NaN is itself', function () {
            expect(utils.objectIs(NaN, NaN), 'to be true');
        });

        it('should say that -0 is not 0', function () {
            expect(utils.objectIs(-0, 0), 'to be false');
        });

        it('should say that 0 is not -0', function () {
            expect(utils.objectIs(0, -0), 'to be false');
        });

        it('should say that 0 is 0', function () {
            expect(utils.objectIs(0, 0), 'to be true');
        });

        it('should say that -0 is -0', function () {
            expect(utils.objectIs(-0, -0), 'to be true');
        });
    });
}
