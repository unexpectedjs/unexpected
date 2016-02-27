/*global expect*/
describe('stringDiff', function () {
    var actual = 'abc\ndef\nghi\njkl\nmno';
    var expected = 'ghi\njkl\nmno\npqr\nstu\nvwx';

    it('outputs leading + and - in text mode', function () {
        expect(
            expect.createOutput('text').stringDiff(actual, expected),
            'to equal',
            expect.createOutput('text')
                .block(function () {
                    this
                      .diffRemovedLine('-').nl()
                      .diffRemovedLine('-');
                })
                .block(function () {
                    this
                        .diffRemovedLine('abc').nl()
                        .diffRemovedLine('def');
                }).nl()
                .text(' ghi').nl()
                .text(' jkl').nl()
                .block(function () {
                    this.diffRemovedLine('-');
                })
                .block(function () {
                    this.diffRemovedLine('mno');
                }).nl()
                .block(function () {
                    this
                        .diffAddedLine('+').nl()
                        .diffAddedLine('+').nl()
                        .diffAddedLine('+').nl()
                        .diffAddedLine('+');
                })
                .block(function () {
                    this
                      .diffAddedLine('mno').nl()
                      .diffAddedHighlight('pqr').nl()
                      .diffAddedHighlight('stu').nl()
                      .diffAddedHighlight('vwx');
                })
        );
    });

    it('does not output leading + and - in ansi mode', function () {
        expect(
            expect.createOutput('ansi').stringDiff(actual, expected),
            'to equal',
            expect.createOutput('ansi')
                .diffRemovedLine('abc').nl()
                .diffRemovedLine('def').nl()
                .text('ghi').nl()
                .text('jkl').nl()
                .diffRemovedLine('mno').nl()
                .diffAddedLine('mno').nl()
                .diffAddedHighlight('pqr').nl()
                .diffAddedHighlight('stu').nl()
                .diffAddedHighlight('vwx')
        );
    });
});
