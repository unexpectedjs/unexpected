/*global unexpected*/
var expect = unexpected.clone();

describe('any type', function () {
    var anyType = expect.getType('any');
    describe('when invoked with 3 arguments', function () {
        it('should inspect a value', function () {
            var output = expect.createOutput('text');
            anyType.inspect(123, 1, output);
            expect(output.toString(), 'to equal', '123');
        });
    });

    describe('when invoked with no arguments', function () {
        it('should return the type name for require("util").inspect', function () {
            expect(anyType.inspect(), 'to equal', 'type: any');
        });
    });
});
