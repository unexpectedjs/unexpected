/*global expect, Buffer*/
if (typeof Buffer === 'function') {
    describe('Buffer type', function () {
        it('should consider an instance equal to itself', function () {
            var a = new Buffer([1, 2]);
            expect(a, 'to equal', a);
        });
    });
}
