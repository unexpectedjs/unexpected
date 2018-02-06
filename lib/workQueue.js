var Promise = require('unexpected-bluebird');

var workQueue = {
  queue: [],
  drain: function() {
    this.queue.forEach(fn => {
      fn();
    });
    this.queue = [];
  }
};

var scheduler = Promise.setScheduler(fn => {
  workQueue.queue.push(fn);
  scheduler(() => {
    workQueue.drain();
  });
});

Promise.prototype._notifyUnhandledRejection = function() {
  var that = this;
  scheduler(() => {
    if (that._isRejectionUnhandled()) {
      if (workQueue.onUnhandledRejection) {
        // for testing
        workQueue.onUnhandledRejection(that.reason());
      } else {
        throw that.reason();
      }
    }
  });
};

module.exports = workQueue;
