var expect = require('unexpected');

describe('benchmark', function () {
    it('expect(42, "to be", 42)', function () {
        expect(42, "to be", 42);
    });

    it('expect("foo", "to equal", "foo")', function () {
        expect("foo", "to equal", "foo");
    });
});
