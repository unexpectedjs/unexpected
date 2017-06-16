/*global expect*/
describe('installTheme', function () {
    var clonedExpect;
    beforeEach(function () {
        clonedExpect = expect.clone();
    });

    it('is chainable (returns the expect function, not the magicpen instance)', function () {
        clonedExpect
            .installTheme('html', { comment: 'gray' })
            ('bar', 'to equal', 'bar');
    });
});
