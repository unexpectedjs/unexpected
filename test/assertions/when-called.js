/*global unexpected*/
describe('when called assertion', function () {
    var expect = unexpected.clone();

    it('should call the function without arguments and shift the result', function () {
        function hey() {
            return 123;
        }
        expect(hey, 'when called', 'to equal', 123);
    });

    it('should fail when the assertion being delegated to fails', function () {
        function hey() {
            return 123;
        }
        expect(function () {
            expect(hey, 'when called', 'to equal', 124);
        }, 'to throw',
            "expected function hey() { return 123; } when called to equal 124\n" +
            "  expected 123 to equal 124"
        );
    });

    it('should produce the return value as the promise fulfillment value when no assertion is given', function () {
        function hey() {
            return 123;
        }
        return expect(hey, 'called').then(function (value) {
            expect(value, 'to equal', 123);
        });
    });
});
