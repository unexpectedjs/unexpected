/*global expect*/
describe('to be finite assertion', function () {
    it('asserts a finite number', function () {
        expect(123, 'to be finite');
        expect(0, 'to be finite');
        expect(Infinity, 'not to be finite');
        expect(-Infinity, 'not to be finite');
    });

    it('refuses to work on NaN', function () {
        expect(function () {
            expect(NaN, 'not to be finite');
        }, 'to throw',
            "expected NaN not to be finite\n" +
            "  The assertion does not have a matching signature for:\n" +
            "    <NaN> not to be finite\n" +
            "  did you mean:\n" +
            "    <number> [not] to be finite"
        );
    });

    it('throws when the assertion fails', function () {
        expect(function () {
            expect(Infinity, 'to be finite');
        }, 'to throw exception', 'expected Infinity to be finite');
    });
});
