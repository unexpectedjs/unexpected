/*global jasmine, it:true, xdescribe, xit, beforeAll, afterAll, before:true, after:true*/
function jasmineFail(err) {
  if (typeof jasmine === 'object') {
    jasmine.getEnv().fail(err);
  }
}

function jasmineSuccess(err) {
  if (typeof jasmine === 'object') {
    jasmine
      .getEnv()
      .expect(true)
      .toBe(true);
  }
}

var shouldApplyPatch =
  typeof jasmine !== 'undefined' &&
  typeof jasmine.version === 'string' &&
  jasmine.version.match(/^2\./);

if (typeof it === 'function' && shouldApplyPatch) {
  var originalIt = it;
  it = function(title, fn) {
    if (!fn) {
      return originalIt(title);
    }
    var async = fn.length > 0;
    var wrapper = function(done) {
      var result;
      try {
        if (async) {
          fn.call(this, function(err) {
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

        var isPromise =
          result &&
          typeof result === 'object' &&
          typeof result.then === 'function';

        if (isPromise) {
          result.then(
            function() {
              jasmineSuccess();
              done();
            },
            function(err) {
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
    wrapper.toString = function() {
      return fn.toString();
    };
    return originalIt(title, wrapper);
  };
  Object.keys(originalIt).forEach(function(methodName) {
    it[methodName] = originalIt[methodName];
  });
  it.patchApplied = true;
}

if (!it.skip && xit) {
  it.skip = function() {
    xit.apply(it, arguments);
  };
}

if (!describe.skip && xdescribe) {
  describe.skip = function() {
    xdescribe.apply(describe, arguments, 1);
  };
}

before = typeof before === 'function' ? before : beforeAll;
after = typeof after === 'function' ? after : afterAll;
