/*global expect*/
describe('merge', function () {
    it('should overlay a pen on top of another', function () {
        var pen = expect.createOutput('text');
        pen.text('abc').nl().text('def');
        var anotherPen = pen.clone().text(' h').nl().text('i');
        expect(pen.clone().merge([pen, anotherPen]).toString(),
            'to equal',
            "ahc\n" +
            "ief"
        );
    });

    it('should result in a wider pen when merging a wide pen on top of a slim one', function () {
        var pen = expect.createOutput('text');
        pen.text('a').nl().text('b');
        var anotherPen = pen.clone().text('c').nl().text('  d');
        expect(pen.clone().merge([pen, anotherPen]).toString(),
            'to equal',
            "c\n" +
            "b d"
        );
    });
});
