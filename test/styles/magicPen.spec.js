/*global expect*/
describe('magicPen', function () {
    it('renders a raw entry', function () {
        expect(expect.createOutput('text').raw('foo'), 'to inspect as', "magicpen('text').raw('foo') // foo");
    });

    it('renders an empty block', function () {
        expect(
            expect.createOutput('text').block(function () {}),
            'to inspect as',
            "magicpen('text').block(function () {}) // "
        );
    });

    it('renders text with an empty array of styles', function () {
        expect(expect.createOutput('text').text('foo', []), 'to inspect as', "magicpen('text').text('foo', []) // foo");
    });

    it('renders text with a single style not defined as a top-level style', function () {
        expect(expect.createOutput('text').text('foo', ['blabla']), 'to inspect as', "magicpen('text').text('foo', [ 'blabla' ]) // foo");
    });

    it('renders text with several styles', function () {
        expect(expect.createOutput('text').text('foo', ['quux', 'baz']), 'to inspect as', "magicpen('text').text('foo', [ 'quux', 'baz' ]) // foo");
    });
});
