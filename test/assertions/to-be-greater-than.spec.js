/*global expect*/
describe('greater than assertion', function () {
    it('assert >', function () {
        expect(3, 'to be greater than', 2);
        expect(1, 'to be above', 0);
    });

    it('throws when the assertion fails', function () {
        expect(function () {
            expect(0, 'to be greater than', 0);
        }, 'to throw exception', "expected 0 to be greater than 0");
    });

    it('refuses to compare NaN to a number', function () {
        expect(function () {
            expect(NaN, 'not to be greater than', 1);
        }, 'to throw',
               "expected NaN not to be greater than 1\n" +
               "  No matching assertion, did you mean:\n" +
               "  <number> [not] to be (greater than|above) <number>\n" +
               "  <string> [not] to be (greater than|above) <string>");
    });
});
