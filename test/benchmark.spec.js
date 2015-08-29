describe('benchmark', function () {
    var expect = unexpected.clone();
    function asyncTestFunction(cb) {
        setTimeout(function () {
            cb();
        }, 0);
    }

    it('to be on numbers', function () {
        expect(42, "to be", 42);
    });

    it('to equal on strings', function () {
        expect("foo", "to equal", "foo");
    });

    it('to call the callback async', function () {
        return expect(asyncTestFunction, 'to call the callback');
    });
});
