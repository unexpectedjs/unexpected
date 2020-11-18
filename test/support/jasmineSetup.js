/* global jasmine, beforeAll, afterAll */
function jasmineFail(err) {
  if (typeof jasmine === 'object') {
    jasmine.getEnv().fail(err);
  }
}

function jasmineSuccess() {
  if (typeof jasmine === 'object') {
    jasmine.getEnv().expect(true).toBe(true);
  }
}

const shouldApplyPatch =
  typeof jasmine !== 'undefined' &&
  typeof jasmine.version === 'string' &&
  jasmine.version.match(/^[23]\./);

if (typeof it === 'function' && shouldApplyPatch) {
  const originalIt = it;
  // eslint-disable-next-line no-global-assign
  it = function (title, fn) {
    if (!fn) {
      return originalIt(title);
    }
    const async = fn.length > 0;
    const wrapper = function (done) {
      let result;
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

        const isPromise =
          result &&
          typeof result === 'object' &&
          typeof result.then === 'function';

        if (isPromise) {
          result.then(
            function () {
              jasmineSuccess();
              done();
            },
            function (err) {
              jasmineFail(err);
              done(err);
            }
          );
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
}

if (!it.skip && xit) {
  it.skip = function (...args) {
    xit.apply(it, args);
  };
}

if (!describe.skip && xdescribe) {
  describe.skip = function (...args) {
    xdescribe.apply(describe, args, 1);
  };
}

// eslint-disable-next-line no-global-assign
before = typeof before === 'function' ? before : beforeAll;
// eslint-disable-next-line no-global-assign
after = typeof after === 'function' ? after : afterAll;
