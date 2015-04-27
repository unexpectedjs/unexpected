/*global it:true, jasmine, mocha*/

function jasmineFail(err) {
    if (typeof jasmine === 'object') {
        jasmine.getEnv().fail(err);
    }
}

function jasmineSuccess(err) {
    if (typeof jasmine === 'object') {
        jasmine.getEnv().expect(true).toBe(true);
    }
}

var promiseCreated = false;
var patchApplied = false;

var shouldApplyPatch = typeof mocha !== 'undefined' ||
    (typeof jasmine !== 'undefined' && typeof jasmine.version === 'string' && jasmine.version.match(/^2\./));

module.exports = {
    promiseCreated: function () {
        promiseCreated = true;
    },
    applyPatch: function () {
        if (patchApplied) {
            return;
        }

        if (shouldApplyPatch) {
            var originalIt = it;
            it = function (title, fn) {
                if (!fn) {
                    return originalIt(title);
                }
                var async = fn.length > 0;
                var wrapper = function (done) {
                    promiseCreated = false;
                    var result;
                    try {
                        if (async) {
                            fn.call(this, function (err) {
                                if (err) {
                                    jasmineFail(err);
                                    done(err);
                                } else {
                                    jasmineSuccess();
                                    done();
                                }
                            });
                            return;
                        } else {
                            result = fn.call(this);
                        }
                        var isPromise = result && typeof result === 'object' && typeof result.then === 'function';
                        if (isPromise) {
                            result.then(function () {
                                jasmineSuccess();
                                done();
                            }).caught(function (err) {
                                jasmineFail(err);
                                done(err);
                            });
                        } else if (promiseCreated) {
                            throw new Error('When using asynchronous assertions you must return a promise from the it block');
                        } else {
                            jasmineSuccess();
                            done();
                        }
                    } catch (err) {
                        jasmineFail(err);
                        return done(err);
                    }
                };
                wrapper.toString = function () {
                    return fn.toString();
                };
                return originalIt(title, wrapper);
            };

            Object.keys(originalIt).forEach(function (methodName) {
                it[methodName] = originalIt[methodName];
            });
            patchApplied = true;
        }
    }
};
