/*global expect, Symbol*/
if (typeof Symbol === 'function') {
    describe('Symbol type', function () {
        it('inspects correctly', function () {
            expect(Symbol('foo'), 'to inspect as', "Symbol('foo')");
        });

        describe('when compared for equality', function () {
            it('considers a symbol equal to itself', function () {
                var symbol = Symbol('a');
                expect(symbol, 'to equal', symbol);
            });

            it('considers two symbols with the same name different', function () {
                expect(Symbol('a'), 'not to equal', Symbol('a'));
            });

            it('does not render a diff', function () {
                expect(function () {
                    expect(Symbol('a'), 'to equal', Symbol('b'));
                }, 'to throw', "expected Symbol('a') to equal Symbol('b')");
            });
        });

        describe('with to satisfy', function () {
            it('satisfies itself', function () {
                var symbol = Symbol('a');
                expect(symbol, 'to satisfy', symbol);
            });

            it('does not satisfy another symbol, even with the same name', function () {
                expect(Symbol('a'), 'not to satisfy', Symbol('a'));
            });

            it('does not render a diff', function () {
                expect(function () {
                    expect({ foo: Symbol('a') }, 'to satisfy', { foo: Symbol('a') });
                }, 'to throw',
                    "expected { foo: Symbol('a') } to satisfy { foo: Symbol('a') }\n" +
                    "\n" +
                    "{\n" +
                    "  foo: Symbol('a') // should equal Symbol('a')\n" +
                    "}"
                );
            });
        });
    });
}
