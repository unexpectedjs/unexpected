/*global expect*/
describe('when called with assertion', function () {
    function add(a, b) {
        return a + b;
    }

    it('should assert that the function invocation produces the correct output', function () {
        expect(add, 'when called with', [3, 4], 'to equal', 7);
    });

    it('should combine with other assertions (showcase)', function () {
        expect(function () {
            expect(add, 'when called with', [3, 4], 'to equal', 9);
        }, 'to throw', 'expected function add(a, b) { return a + b; } when called with 3, 4 to equal 9\n' + '  expected 7 to equal 9');
    });

    it('should should provide the result as the fulfillment value if no assertion is provided', function () {
        return expect(add, 'when called with', [3, 4]).then(function (sum) {
            expect(sum, 'to equal', 7);
        });
    });

    describe('when assertion is executed in context of another object', function () {
        it('should call the function in the context of that object', function () {
            function Greeter(prefix) {
                this.prefix = prefix;
            }

            Greeter.prototype.greet = function (name) {
                return this.prefix + name;
            };

            expect(new Greeter('Hello, '), 'to satisfy', {
                greet: expect.it('when called with', ['John Doe'], 'to equal', 'Hello, John Doe')
            });
        });
    });
});