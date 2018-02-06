const Promise = require('unexpected-bluebird');

const workQueue = {
  queue: [],
  drain() {
    this.queue.forEach(fn => {
      fn();
    });
    this.queue = [];
  }
};

const scheduler = Promise.setScheduler(fn => {
  workQueue.queue.push(fn);
  scheduler(() => {
    workQueue.drain();
  });
});

Promise.prototype._notifyUnhandledRejection = function() {
  const that = this;
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
