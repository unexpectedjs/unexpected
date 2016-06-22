/*global expect*/
describe('when sorted assertion', function () {
    it('should sort an array using the default compare function', function () {
        expect(['c', 'a', 'b'], 'when sorted', 'to equal', ['a', 'b', 'c']);
    });

    it('should provide the result as the fulfillment value if no assertion is provided', function () {
        return expect(['c', 'b', 'a'], 'when sorted').then(function (sortedArray) {
            expect(sortedArray, 'to equal', ['a', 'b', 'c']);
        });
    });

    it('should also work without the \'when\'', function () {
        expect(['c', 'd', 'a'], 'sorted', 'to equal', ['a', 'c', 'd']);
    });
});
