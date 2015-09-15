/*global unexpected*/
describe('benchmark:', function () {
    var expect = unexpected.clone();

    describe('to be truthy', function () {
        it('on numbers', function () {
            expect(42, 'to be truthy');
        });

        it('on strings', function () {
            expect('foo', 'to be truthy');
        });

        it('on object', function () {
            expect({ label: 'this is an object', list: [ 0, 1, 2]}, 'to be truthy');
        });
    });

    describe('to be', function () {
        it('on numbers', function () {
            expect(42, "to be", 42);
        });

        it('on strings', function () {
            expect(42, "to be", 42);
        });

        it('on same object', function () {
            var obj = { label: 'this is an object', list: [ 0, 1, 2]};
            expect(obj, "to be", obj);
        });
    });

    describe('to equal', function () {
        it('on numbers', function () {
            expect(42, "to equal", 42);
        });

        it('on strings', function () {
            expect("foo", "to equal", "foo");
        });

        it('on objects', function () {
            expect({ label: 'this is an object', list: [ 0, 1, 2]},
                   "to equal",
                   { label: 'this is an object', list: [ 0, 1, 2]});
        });

        it('on same object', function () {
            var obj = { label: 'this is an object', list: [ 0, 1, 2]};
            expect(obj, "to equal", obj);
        });
    });

    describe('to match', function () {
        it('on a small string', function () {
            expect('foobarbaz', 'to match', /ba./g);
        });
    });

    describe('to satisfy', function () {
        it('on objects', function () {
            expect({ label: 'this is an object', list: [ 0, 1, 2]},
                   "to satisfy",
                   { label: /object/, list: { 0: 0 }});
        });
    });

    it('to call the callback async', function () {
        return expect(setImmediate, 'to call the callback');
    });
});
