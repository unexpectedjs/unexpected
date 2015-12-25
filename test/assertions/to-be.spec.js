/*global expect*/
describe('to be assertion', function () {
    it('assert === equality', function () {
        var obj = {};
        expect(obj, 'to be', obj);
        expect(obj, 'not to be', {});
        expect(1, 'to be', 1);
        expect(1, 'not to be', true);
        expect('1', 'not to be', 1);
        expect(null, 'not to be', undefined);
        expect(null, 'to be null');
        expect(0, 'not to be null');
        expect(undefined, 'not to be null');
        expect(true, 'to be true');
        expect(false, 'not to be true');
        expect(false, 'to be false');
        expect(true, 'not to be false');
        expect(undefined, 'to be undefined');
        expect(false, 'to be defined');
        expect({}, 'to be defined');
        expect('', 'to be defined');
    });

    it('NaN as equal to NaN', function () {
        expect(NaN, 'to be', NaN);
    });

    it('considers negative zero not to be zero', function () {
        expect(-0, 'not to be', 0);
    });

    it('considers negative zero to be itself', function () {
        expect(-0, 'to be', -0);
    });

    it('considers zero to be itself', function () {
        expect(0, 'to be', 0);
    });

    if (typeof Buffer !== 'undefined') {
        it('asserts === equality for Buffers', function () {
            var buffer = new Buffer([0x45, 0x59]);
            expect(buffer, 'to be', buffer);
        });
    }

    if (typeof Uint8Array !== 'undefined') {
        it('asserts === equality for Uint8Array', function () {
            var uint8Array = new Uint8Array([0x45, 0x59]);
            expect(uint8Array, 'to be', uint8Array);
        });
    }

    describe('on strings', function () {
        it('throws when the assertion fails', function () {
            expect(function () {
                expect('foo', 'to be', 'bar');
            }, 'to throw exception',
                   "expected 'foo' to be 'bar'\n" +
                   "\n" +
                   "-foo\n" +
                   "+bar");

            expect(function () {
                expect(true, 'not to be', true);
            }, 'to throw exception', "expected true not to be true");

            expect(function () {
                expect(undefined, 'to be defined');
            }, 'to throw exception', "expected undefined to be defined");
        });

        it('does not provide a diff when comparing against undefined', function () {
            expect(function () {
                expect('blabla', 'to be undefined');
            }, 'to throw', "expected 'blabla' to be undefined");
        });
    });
});
