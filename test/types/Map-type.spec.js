/*global expect, Map*/

(typeof Map !== 'function' ? describe.skip : describe)('Map type', function () {
    it('treats empty Map objects as equal', function () {
        expect(function () {
            expect(new Map(), 'to equal', new Map());
        }, 'not to throw');
    });

    it('treats matching Map objects as equal', function () {
        expect(function () {
            expect(new Map([['foo', 'bar']]), 'to equal', new Map([['foo', 'bar']]));
        }, 'not to throw');
    });

    it('should mark missing keys', function () {
        expect(function () {
            expect(new Map([['quux', 'bar']]), 'to equal', new Map([['quux', 'bar'], ['zuuq', 'baz']]));
        }, 'to throw exception',
                "expected Map([ ['quux', 'bar'] ])\n" +
                "to equal Map([ ['quux', 'bar'], ['zuuq', 'baz'] ])\n" +
                "\n" +
                "Map([\n" +
                "  ['quux', 'bar']\n" +
                "  // missing ['zuuq', 'baz']\n" +
                "])");
    });

    it('should mark unecessary keys', function () {
        expect(function () {
            expect(new Map([['quux', 'bar'], ['zuuq', 'baz']]), 'to equal', new Map([['quux', 'bar']]));
        }, 'to throw exception',
                "expected Map([ ['quux', 'bar'], ['zuuq', 'baz'] ])\n" +
                "to equal Map([ ['quux', 'bar'] ])\n" +
                "\n" +
                "Map([\n" +
                "  ['quux', 'bar'],\n" +
                "  ['zuuq', 'baz'] // should be removed\n" +
                "])");
    });

    it('should output a diff when key values mismatch', function () {
        expect(function () {
            expect(new Map([['foo', 'bar']]), 'to equal', new Map([['foo', 'baz']]));
        }, 'to throw exception',
                "expected Map([ ['foo', 'bar'] ]) to equal Map([ ['foo', 'baz'] ])\n" +
                "\n" +
                "Map([\n" +
                "  ['foo', 'bar'] // should equal 'baz'\n" +
                "                 //\n" +
                "                 // -bar\n" +
                "                 // +baz\n" +
                "])");
    });

    it('should output a diff when using complex keys', function () {
        expect(function () {
            expect(new Map([[['a', 'b'], 'bar']]), 'to equal', new Map([[['a', 'c'], 'bar']]));
        }, 'to throw exception',
                "expected Map([ [[ 'a', 'b' ], 'bar'] ]) to equal Map([ [[ 'a', 'c' ], 'bar'] ])\n" +
                "\n" +
                "Map([\n" +
                "  [[ 'a', 'b' ], 'bar'] // should be removed\n" +
                "  // missing [[ 'a', 'c' ], 'bar']\n" +
                "])");
    });
});
