/*global expect*/
describe('less than or equal assertion', function () {
    it('asserts <=', function () {
        expect(0, 'to be less than or equal to', 4);
        expect(0, 'to be less than or equal to', 0);
        expect('a', 'to be less than or equal to', 'a');
        expect('a', 'to be less than or equal to', 'b');
    });

    it('throws when the assertion fails', function () {
        expect(function () {
            expect(0, 'to be less than or equal to', -1);
        }, 'to throw exception', "expected 0 to be less than or equal to -1");
    });
});