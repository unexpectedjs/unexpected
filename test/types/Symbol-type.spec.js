/*global expect, Symbol*/
if (typeof Symbol === 'function') {
    describe('Symbol type', function () {
        var symbolA = Symbol('a');
        var anotherSymbolA = Symbol('a');
        var symbolB = Symbol('b');

        it('inspects correctly', function () {
            expect(symbolA, 'to inspect as', "Symbol('a')");
        });

        describe('when compared for equality', function () {
            it('considers a symbol equal to itself', function () {
                expect(symbolA, 'to equal', symbolA);
            });

            it('considers two symbols with the same name different', function () {
                expect(symbolA, 'not to equal', anotherSymbolA);
            });

            it('does not render a diff', function () {
                expect(function () {
                    expect(symbolA, 'to equal', symbolB);
                }, 'to throw', "expected Symbol('a') to equal Symbol('b')");
            });
        });

        describe('with to satisfy', function () {
            it('satisfies itself', function () {
                expect(symbolA, 'to satisfy', symbolA);
            });

            it('does not satisfy another symbol, even with the same name', function () {
                expect(symbolA, 'not to satisfy', anotherSymbolA);
            });

            it('does not render a diff', function () {
                expect(function () {
                    expect({ foo: symbolA }, 'to satisfy', { foo: anotherSymbolA });
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
