var runningPromises = {
    promises: [],
    clear: function () {
        this.promises = [];
    },
    hasPendingPromises: function () {
        return this.promises.some(function (promise) {
            return promise.isPending();
        });
    },
    push: function (promise) {
        this.promises.push(promise);
    }
};
module.exports = runningPromises;
