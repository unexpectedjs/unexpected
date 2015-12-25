/*global expect*/
describe('array type', function () {
    it('should find an array instance identical to itself', function () {
        var arr = [1, 2, 3];
        expect(arr, 'to equal', arr);
    });
});
