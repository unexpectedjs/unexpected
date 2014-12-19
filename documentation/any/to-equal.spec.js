describe('type any', function () {
    describe('to equal', function () {
        it('example 1', function () {
            expect({ a: 'b' }, 'to equal', { a: 'b' });
            expect(1, 'not to equal', '1');
            expect({ one: 1 }, 'not to equal', { one: '1' });
            expect(null, 'not to equal', '1');
            var now = new Date();
            expect(now, 'to equal', now);
            expect(now, 'to equal', new Date(now.getTime()));
            expect({ now: now }, 'to equal', { now: now });
        });

        it('example 2', function () {
            expect(function () {
                expect({ a: { b: 'c'} }, 'to equal', { a: { b: 'd'} });
            }, 'to throw',
                   "expected { a: { b: 'c' } } to equal { a: { b: 'd' } }\n" +
                   "\n" +
                   "{\n" +
                   "  a: {\n" +
                   "    b: 'c' // should be 'd'\n" +
                   "           // -\n" +
                   "           // +\n" +
                   "  }\n" +
                   "}");
            });
        });
    });
});
