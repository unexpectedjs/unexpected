/*global xdescribe, xit, beforeAll, afterAll, before:true, after:true*/

if (!it.skip && xit) {
    it.skip = function () {
        xit.apply(it, arguments);
    };
}

if (!describe.skip && xdescribe) {
    describe.skip = function () {
        xdescribe.apply(describe, arguments, 1);
    };
}

before = typeof before === 'function' ? before : beforeAll;
after = typeof after === 'function' ? after : afterAll;
