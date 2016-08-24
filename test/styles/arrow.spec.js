/*global expect*/
describe('arrow', function () {
    it('should render an arrow with the given dimensions', function () {
        expect(
            expect.createOutput('text').arrow({ width: 4, height: 5, down: true }).toString(),
            'to equal',
            "┌───\n" +
            "│\n" +
            "│\n" +
            "│\n" +
            "└──>"
        );
    });

    it('should support top and left coordinates', function () {
        expect(
            expect.createOutput('text').arrow({ top: 2, left: 3, width: 4, height: 5, down: true }).toString(),
            'to equal',
            "\n" +
            "\n" +
            "   ┌───\n" +
            "   │\n" +
            "   │\n" +
            "   │\n" +
            "   └──>"
        );
    });

    it('should render an arrow that points upwards when up:true is given', function () {
        expect(
            expect.createOutput('text').arrow({ width: 4, height: 5, up: true }).toString(),
            'to equal',
            "┌──>\n" +
            "│\n" +
            "│\n" +
            "│\n" +
            "└───"
        );
    });

    it('should render an arrow that points both upwards and downwards when down:true and up:true are given', function () {
        expect(
            expect.createOutput('text').arrow({ width: 4, height: 5, up: true, down: true }).toString(),
            'to equal',
            "┌──>\n" +
            "│\n" +
            "│\n" +
            "│\n" +
            "└──>"
        );
    });
});
