/*global expect*/
describe('negative assertion', function () {
    it('assert that a number is negative', function () {
        expect(-1, 'to be negative');
    });

    it('throws when the assertion fails', function () {
        expect(function () {
            expect(0, 'to be negative');
        }, 'to throw exception', "expected 0 to be negative");
    });
});