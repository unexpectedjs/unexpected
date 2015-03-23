var Promise = require('bluebird');
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

module.exports = workQueue;
