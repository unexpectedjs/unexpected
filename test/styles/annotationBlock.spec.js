/*global expect*/
describe('annotationBlock', function () {
    it('should render an empty block', function () {
        expect(
            expect.createOutput('text').annotationBlock(function () {}).toString(),
            'to equal',
            '// '
        );
    });
});
