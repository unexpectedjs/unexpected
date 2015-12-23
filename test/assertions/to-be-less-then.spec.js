/*global expect*/
describe('less than assertion', function () {
    it('asserts <', function () {
        expect(0, 'to be less than', 4);
        expect(0, 'to be below', 1);
    });

    it('throws when the assertion fails', function () {
        expect(function () {
            expect(0, 'to be less than', 0);
        }, 'to throw exception', "expected 0 to be less than 0");
    });
});
