/*global expect*/
describe('empty assertion', function () {
    it('asserts the array-like objects have a non-zero length', function () {
        expect([], 'to be empty');
        expect('', 'to be empty');
        expect([1, 2, 3], 'not to be empty');
        expect('foobar', 'not to be empty');
        expect([1, 2, 3], 'to be non-empty');
    });

    it('throws when the assertion fails', function () {
        expect(function () {
            expect([1, 2, 3], 'to be empty');
        }, 'to throw exception', "expected [ 1, 2, 3 ] to be empty");

        expect(function () {
            expect('', 'to be non-empty');
        }, 'to throw exception', "expected '' to be non-empty");

        expect(function () {
            expect(null, 'to be empty');
        }, 'to throw exception',
               "expected null to be empty\n" +
               "  No matching assertion, did you mean:\n" +
               "  <string|array-like> [not] to be empty");
    });
});
