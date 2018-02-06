/*global expect*/
describe('Promise type', function() {
  it('should inspect a pending promise', function() {
    var promise = new Promise(function(resolve, reject) {
      setTimeout(resolve, 0);
    });
    expect(promise, 'to inspect as', 'Promise');
    return promise;
  });

  it('should inspect a fulfilled promise without a value', function() {
    var promise = new Promise(function(resolve, reject) {
      resolve();
    });

    return promise.then(function() {
      expect(promise, 'to inspect as', 'Promise');
    });
  });

  it('should inspect a fulfilled promise with a value', function() {
    var promise = new Promise(function(resolve, reject) {
      resolve(123);
    });

    return promise.then(function() {
      expect(promise, 'to inspect as', 'Promise');
    });
  });

  it('should inspect a rejected promise without a value', function() {
    var promise = new Promise(function(resolve, reject) {
      reject();
    });

    return promise.then(undefined, function() {
      expect(promise, 'to inspect as', 'Promise');
    });
  });

  it('should inspect a rejected promise with a value', function() {
    var promise = new Promise(function(resolve, reject) {
      setTimeout(function() {
        reject(new Error('argh'));
      }, 0);
    });

    return promise.then(undefined, function() {
      expect(promise, 'to inspect as', 'Promise');
    });
  });

  describe('with a Bluebird promise (that supports synchronous inspection)', function() {
    it('should inspect a pending promise', function() {
      var promise = expect.promise(function(run) {
        setTimeout(run(function() {}), 0);
      });
      expect(promise, 'to inspect as', 'Promise (pending)');
      return promise;
    });

    it('should inspect a fulfilled promise without a value', function() {
      var promise = expect.promise(function() {});

      return promise.then(function() {
        expect(promise, 'to inspect as', 'Promise (fulfilled)');
      });
    });

    it('should inspect a fulfilled promise without a value method', function() {
      var promise = expect.promise(function() {});
      promise.value = null;
      return promise.then(function() {
        expect(promise, 'to inspect as', 'Promise (fulfilled)');
      });
    });

    it('should inspect a fulfilled promise with a value', function() {
      var promise = expect.promise(function(resolve, reject) {
        resolve(123);
      });

      return promise.then(function() {
        expect(promise, 'to inspect as', 'Promise (fulfilled) => 123');
      });
    });

    it('should inspect a rejected promise without a value', function() {
      var promise = expect.promise(function(resolve, reject) {
        reject();
      });

      return promise.caught(function() {
        expect(promise, 'to inspect as', 'Promise (rejected)');
      });
    });

    it('should inspect a rejected promise with a value', function() {
      var promise = expect.promise(function(resolve, reject) {
        setTimeout(function() {
          reject(new Error('argh'));
        }, 0);
      });

      return promise.caught(function() {
        expect(promise, 'to inspect as', "Promise (rejected) => Error('argh')");
      });
    });
  });
});
