/*global afterEach*/
var pendingPromises = [];
var afterEachRegistered = false;
module.exports = function notifyPendingPromise(promise) {
    pendingPromises.push(promise);
    if (typeof afterEach === 'function' && !afterEachRegistered) {
        afterEachRegistered = true;
        afterEach(function () {
            if (pendingPromises.some(function (promise) {return promise.isPending();})) {
                var displayName = this.currentTest.title;
                throw new Error(displayName + ': You have created a promise that was not returned in the it block');
            }
        });
    }
};
