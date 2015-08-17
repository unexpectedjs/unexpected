/*global it:true, jasmine, mocha*/
function isMochaModule(module) {
    return module && (
        (module.exports && module.exports.name === 'Mocha') ||
            (/(\/mocha\.js|_mocha)$/).test(module.filename)
    );
}

function isVanillaMocha() {
    var currentModule = typeof module !== 'undefined' && module;
    while (currentModule) {
        if (isMochaModule(currentModule)) {
            return true;
        } else {
            currentModule = currentModule.parent;
        }
    }
    return false;
}

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

var shouldApplyPatch =
    typeof mocha !== 'undefined' ||
    (typeof jasmine !== 'undefined' && typeof jasmine.version === 'string' && jasmine.version.match(/^2\./)) ||
    isVanillaMocha();

module.exports = {
    promiseCreated: function () {
        promiseCreated = true;
    },
    applyPatch: function () {
        if (typeof it === 'undefined' || it.patchApplied) {
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
                            }, function (err) {
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
            it.patchApplied = true;
            return true;
        }
    }
};
