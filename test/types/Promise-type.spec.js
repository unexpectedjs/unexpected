/*global expect*/
describe('Promise type', () => {
  it('should inspect a pending promise', () => {
    var promise = new Promise((resolve, reject) => {
      setTimeout(resolve, 0);
    });
    expect(promise, 'to inspect as', 'Promise');
    return promise;
  });

  it('should inspect a fulfilled promise without a value', () => {
    var promise = new Promise((resolve, reject) => {
      resolve();
    });

    return promise.then(() => {
      expect(promise, 'to inspect as', 'Promise');
    });
  });

  it('should inspect a fulfilled promise with a value', () => {
    var promise = new Promise((resolve, reject) => {
      resolve(123);
    });

    return promise.then(() => {
      expect(promise, 'to inspect as', 'Promise');
    });
  });

  it('should inspect a rejected promise without a value', () => {
    var promise = new Promise((resolve, reject) => {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject();
    });

    return promise.then(undefined, () => {
      expect(promise, 'to inspect as', 'Promise');
    });
  });

  it('should inspect a rejected promise with a value', () => {
    var promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('argh'));
      }, 0);
    });

    return promise.then(undefined, () => {
      expect(promise, 'to inspect as', 'Promise');
    });
  });

  describe('with a Bluebird promise (that supports synchronous inspection)', () => {
    it('should inspect a pending promise', () => {
      var promise = expect.promise(run => {
        setTimeout(run(() => {}), 0);
      });
      expect(promise, 'to inspect as', 'Promise (pending)');
      return promise;
    });

    it('should inspect a fulfilled promise without a value', () => {
      var promise = expect.promise(() => {});

      return promise.then(() => {
        expect(promise, 'to inspect as', 'Promise (fulfilled)');
      });
    });

    it('should inspect a fulfilled promise without a value method', () => {
      var promise = expect.promise(() => {});
      promise.value = null;
      return promise.then(() => {
        expect(promise, 'to inspect as', 'Promise (fulfilled)');
      });
    });

    it('should inspect a fulfilled promise with a value', () => {
      var promise = expect.promise((resolve, reject) => {
        resolve(123);
      });

      return promise.then(() => {
        expect(promise, 'to inspect as', 'Promise (fulfilled) => 123');
      });
    });

    it('should inspect a rejected promise without a value', () => {
      var promise = expect.promise((resolve, reject) => {
        reject();
      });

      return promise.caught(() => {
        expect(promise, 'to inspect as', 'Promise (rejected)');
      });
    });

    it('should inspect a rejected promise with a value', () => {
      var promise = expect.promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('argh'));
        }, 0);
      });

      return promise.caught(() => {
        expect(promise, 'to inspect as', "Promise (rejected) => Error('argh')");
      });
    });
  });
});
