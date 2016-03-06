/*global expect*/
describe('stringDiff', function () {
    var actual = 'abc\ndef\nghi\njkl\nmno';
    var expected = 'ghi\njkl\nmno\npqr\nstu\nvwx';

    describe('in text mode', function () {
        it('outputs leading + and - in text mode', function () {
            var pen = expect.createOutput('text').stringDiff(actual, expected);
            expect(
                pen.toString(),
                'to equal',
                '-abc\n' +
                '-def\n' +
                ' ghi\n' +
                ' jkl\n' +
                '-mno\n' +
                '+mno\n' +
                '+pqr\n' +
                '+stu\n' +
                '+vwx'
            );

            expect(
                pen,
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
    });

    describe('in ansi mode', function () {
        it('does not output leading + and -', function () {
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
});
