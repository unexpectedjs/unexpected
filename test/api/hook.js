/*global expect*/
describe('hook', function () {
    it('should hook into the expect function itself', function () {
        var clonedExpect = expect.clone();
        var called = false;
        clonedExpect.hook(function (next) {
            return function (context, args) {
                called = true;
                return next.call(this, context, args);
            };
        });
        expect(called, 'to be false');
        clonedExpect(123, 'to equal', 123);
        expect(called, 'to be true');
    });

    describe('with expect.clone', function () {
        it('should not affect clones made before hooking in', function () {
            var clonedExpect = expect.clone();
            var clonedClonedExpect = clonedExpect.clone();

            var called = false;
            clonedExpect.hook(function (next) {
                return function (context, args) {
                    called = true;
                    return next.call(this, context, args);
                };
            });
            clonedClonedExpect(123, 'to equal', 123);
            expect(called, 'to be false');
        });

        it('should affect clones made after hooking in', function () {
            var clonedExpect = expect.clone();
            var called = false;
            clonedExpect.hook(function (next) {
                return function (context, args) {
                    called = true;
                    return next.call(this, context, args);
                };
            });
            var clonedClonedExpect = clonedExpect.clone();
            clonedClonedExpect(123, 'to equal', 123);
            expect(called, 'to be true');
        });
    });

    describe('with expect.child', function () {
        it('should not affect child instances made before installing the hook', function () {
            var parentExpect = expect.clone();
            var childExpect = parentExpect.child();

            var called = false;
            parentExpect.hook(function (next) {
                return function (context, args) {
                    called = true;
                    return next.call(this, context, args);
                };
            });

            childExpect(123, 'to equal', 123);
            expect(called, 'to be false');
        });

        it('should not affect child instances made after installing the hook', function () {
            var parentExpect = expect.clone();

            var called = false;
            parentExpect.hook(function (next) {
                return function (context, args) {
                    called = true;
                    return next.call(this, context, args);
                };
            });

            var childExpect = parentExpect.clone();

            childExpect(123, 'to equal', 123);
            expect(called, 'to be true');
        });
    });

    it('should allow rewriting the assertion string', function () {
        var clonedExpect = expect.clone();
        clonedExpect.hook(function (next) {
            return function (context, args) {
                args[1] = 'to equal';
                return next.call(this, context, args);
            };
        });
        clonedExpect(123, 'to foobarquux', 123);
    });

    it('should allow suppressing the return value of the "next" expect', function () {
        var clonedExpect = expect.clone();
        clonedExpect.hook(function (next) {
            return function (context, args) {
                try {
                    next.call(this, context, args);
                } catch (e) {
                    return expect.promise.resolve();
                }
            };
        });
        clonedExpect(123, 'to equal', 456);
    });

    it('should allow installing multiple hooks', function () {
        var firstCalled = false;
        var secondCalled = false;
        var clonedExpect = expect.clone();
        clonedExpect.hook(function (next) {
            return function (context, args) {
                firstCalled = true;
                return next.call(this, context, args);
            };
        });
        clonedExpect.hook(function (next) {
            return function (context, args) {
                secondCalled = true;
                return next.call(this, context, args);
            };
        });
        clonedExpect(123, 'to equal', 123);
        expect(firstCalled, 'to be true');
        expect(secondCalled, 'to be true');
    });
});
