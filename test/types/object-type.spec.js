/*global expect*/
describe('object type', function () {
    describe('#diff', function () {
        it('should show identical multiline values correctly in diffs', function () {
            var clonedExpect = expect.clone().addType({
                name: 'numberNine',
                identify: function (obj) {
                    return obj === 9;
                },
                inspect: function (value, depth, output) {
                    output.block(function () {
                        this.text('NUMBER').nl().text(' NINE ');
                    });
                }
            });
            expect(function () {
                clonedExpect({a: 123, b: 9}, 'to equal', {a: 456, b: 9});
            }, 'to throw',
                   'expected\n' +
                   '{\n' +
                   '  a: 123,\n' +
                   '  b:\n' +
                   '    NUMBER\n' +
                   '     NINE \n' +
                   '}\n' +
                   'to equal\n' +
                   '{\n' +
                   '  a: 456,\n' +
                   '  b:\n' +
                   '    NUMBER\n' +
                   '     NINE \n' +
                   '}\n' +
                   '\n' +
                   '{\n' +
                   '  a: 123, // should equal 456\n' +
                   '  b:\n' +
                   '    NUMBER\n' +
                   '     NINE \n' +
                   '}'
                  );
        });
    });
});
