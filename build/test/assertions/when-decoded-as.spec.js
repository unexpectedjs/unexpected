/*global expect*/
if (typeof Buffer !== 'undefined') {
    describe('when decoded as assertion', function () {
        it('should decode a Buffer instance to utf-8', function () {
            expect(new Buffer('æøå', 'utf-8'), 'when decoded as', 'utf-8', 'to equal', 'æøå');
        });

        it('should should provide the result as the fulfillment value if no assertion is provided', function () {
            return expect(new Buffer('æøå', 'utf-8'), 'decoded as', 'utf-8').then(function (result) {
                expect(result, 'to equal', 'æøå');
            });
        });
    });
}