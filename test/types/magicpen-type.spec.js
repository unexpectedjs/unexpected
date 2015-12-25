/*global expect*/
describe('magicpen type', function () {
    describe('#inspect', function () {
        it('should find two pens with different formats to not to be identical', function () {
            var MagicPen = expect.output.constructor;
            expect(new MagicPen('text').text('foo'), 'not to equal', new MagicPen('ansi').text('foo'));
        });

        it('should find two format-less pens with the same contents to be identical', function () {
            var MagicPen = expect.output.constructor;
            expect(new MagicPen().text('foo'), 'to equal', new MagicPen().text('foo'));
        });

        describe('with a pen in text format', function () {
            var pen = expect.createOutput('text').green('abc').nl().text('def').block(function () {
                this.text('foo').nl().text('bar');
            });

            it('should inspect correctly', function () {
                expect(pen, 'to inspect as',
                       "magicpen('text')        // abc\n" +
                       "  .green('abc').nl()    // deffoo\n" +
                       "  .text('def')          //    bar\n" +
                       "  .block(function () {\n" +
                       "    this\n" +
                       "      .text('foo').nl()\n" +
                       "      .text('bar');\n" +
                       "  })"
                      );
            });
        });

        describe('with a pen in ansi format', function () {
            var pen = expect.createOutput('ansi').green('abc').text('def').block(function () {
                this.text('foo');
            });

            it('should inspect correctly', function () {
                expect(pen, 'to inspect as',
                       "magicpen('ansi')\n" +
                       "  .green('abc')\n" +
                       "  .text('def')\n" +
                       "  .block(function () {\n" +
                       "    this.text('foo');\n" +
                       "  })"
                      );
            });
        });

        describe('with a pen in ansi format', function () {
            var pen = expect.createOutput('html').green('abc').text('def').block(function () {
                this.text('foo');
            });

            it('should inspect correctly', function () {
                expect(pen, 'to inspect as',
                       "magicpen('html')\n" +
                       "  .green('abc')\n" +
                       "  .text('def')\n" +
                       "  .block(function () {\n" +
                       "    this.text('foo');\n" +
                       "  })"
                      );
            });
        });
    });
});
