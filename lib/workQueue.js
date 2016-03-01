var Promise = require('unexpected-bluebird');

var workQueue = {
    queue: [],
    drain: function () {
        this.queue.forEach(function (fn) {
            fn();
        });
        this.queue = [];
    }
};

var scheduler = Promise.setScheduler(function (fn) {
    workQueue.queue.push(fn);
    scheduler(function () {
        workQueue.drain();
    });
});


Promise.prototype._notifyUnhandledRejection = function () {
    var that = this;
    scheduler(function () {
        if (that._isRejectionUnhandled()) {
            if (workQueue.onUnhandledRejection) { // for testing
                workQueue.onUnhandledRejection(that.reason());
            } else {
                throw that.reason();
            }
        }
    });
};

module.exports = workQueue;
