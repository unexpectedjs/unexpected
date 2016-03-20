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

        it('renders escaped newlines when a line has been removed', function () {
            expect(
                expect.createOutput('ansi').stringDiff('\n', ''),
                'to equal',
                expect.createOutput('ansi')
                    .diffRemovedSpecialChar('\\n').nl()
            );
        });

        it('renders escaped newlines when a line has been added', function () {
            expect(
                expect.createOutput('ansi').stringDiff('', '\n'),
                'to equal',
                expect.createOutput('ansi')
                    .diffAddedSpecialChar('\\n').nl()
            );
        });

        it('should escape an added newline immediately following a replaced chunk', function () {
            expect(
                expect.createOutput('ansi').stringDiff('aa );', '\n);'),
                'to equal',
                expect.createOutput('ansi')
                    .diffRemovedHighlight('aa ').diffRemovedLine(');').nl()
                    .diffAddedSpecialChar('\\n').nl()
                    .diffAddedLine(');')
            );
        });
    });

    describe('stringDiffFragment', function () {
        // This case is not directly exercised by the stringDiff style as special chars
        // are not marked up in unchanged chunks:
        it('should render a special char in an unchanged string', function () {
            expect(
                expect.createOutput('text').stringDiffFragment(' ', '\ufffd', 'text', true),
                'to equal',
                expect.createOutput('text').raw(' ').text('\ufffd')
            );
        });
    });
});
