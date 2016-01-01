/*global after*/
module.exports = function notifyPendingPromise(promise) {
    if (typeof after === 'function') {
        after(function () {
            if (promise.isPending()) {
                throw new Error('You have created a promise that was not returned in the it block');
            }
        });
    }
};
