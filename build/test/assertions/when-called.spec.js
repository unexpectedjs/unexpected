/*global expect*/
describe('when called assertion', function () {
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
        }, 'to throw', "expected function hey() { return 123; } when called to equal 124\n" + "  expected 123 to equal 124");
    });

    it('should produce the return value as the promise fulfillment value when no assertion is given', function () {
        function hey() {
            return 123;
        }
        return expect(hey, 'called').then(function (value) {
            expect(value, 'to equal', 123);
        });
    });

    describe('with the next assertion provided as an expect.it', function () {
        function hey() {
            return 123;
        }

        it('should succeed', function () {
            expect(hey, 'when called', expect.it('to equal', 123));
        });

        it('should fail with a diff', function () {
            expect(function () {
                expect(hey, 'when called', expect.it('to equal', 456));
            }, 'to throw', "expected function hey() { return 123; } when called expect.it('to equal', 456)\n" + "  expected 123 to equal 456");
        });
    });

    describe('when assertion is executed in context of another object', function () {
        it('should call the function in the context of that object', function () {
            function Person(name) {
                this.name = name;
            }

            Person.prototype.toString = function () {
                return this.name;
            };

            expect(new Person('John Doe'), 'to satisfy', {
                toString: expect.it('when called to equal', 'John Doe')
            });
        });
    });
});