/*global expect*/
describe('fail assertion', function () {
    it('throws an error', function () {
        expect(function () {
            expect.fail();
        }, 'to throw exception', "Explicit failure");
    });

    it('sets the error message', function () {
        var wasCaught = false;
        try {
            expect.fail('fail with error message');
        } catch (e) {
            wasCaught = true;
            expect(e.message, 'to contain', 'fail with error message');
        }
        expect(wasCaught, 'to be true');
    });

    it('throws an error with a given message', function () {
        expect(function () {
            expect.fail('fail with error message');
        }, 'to throw exception', "fail with error message");
    });

    it('supports placeholders', function () {
        expect(function () {
            expect.fail('{0} was expected to be {1}', 0, 'zero');
        }, 'to throw exception', "0 was expected to be 'zero'");

        expect(function () {
            var output = expect.output.clone().text('zero');
            expect.fail('{0} was expected to be {1}', 0, output);
        }, 'to throw exception', "0 was expected to be zero");

        expect(function () {
            expect.fail('{0} was expected to be {1}', 0);
        }, 'to throw exception', "0 was expected to be {1}");
    });

});
