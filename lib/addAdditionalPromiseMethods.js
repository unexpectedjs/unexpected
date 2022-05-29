const Context = require('./Context');

function addAdditionalPromiseMethods(
  promise,
  expect,
  subject,
  args,
  wrappedExpect
) {
  promise.and = function (...args) {
    function executeAnd() {
      if (expect.findTypeOf(args[0]).is('expect.it')) {
        return addAdditionalPromiseMethods(args[0](subject), expect, subject);
      } else {
        return expect(subject, ...args);
      }
    }

    if (this.isFulfilled()) {
      return executeAnd();
    } else {
      return addAdditionalPromiseMethods(
        this.then(executeAnd),
        expect,
        subject
      );
    }
  };

  const camelCaseMethods = expect._camelCaser(expect.context || new Context());
  Object.keys(camelCaseMethods).forEach((methodName) => {
    promise[methodName] = function (...args) {
      function execute(shiftedSubject) {
        if (expect.findTypeOf(args[0]).is('expect.it')) {
          return addAdditionalPromiseMethods(
            args[0](shiftedSubject),
            expect,
            subject
          );
        } else {
          if (wrappedExpect) {
            return wrappedExpect.shifty(
              shiftedSubject,
              wrappedExpect.args || [],
              [
                methodName.replace(/[A-Z]/g, ($0) => ` ${$0.toLowerCase()}`),
                ...args,
              ],
              true // legacy mode (FIXME)
            );
          } else {
            // find ud af at fange konteksten
            return expect._executeExpect(
              new Context(),
              shiftedSubject,
              methodName.replace(/[A-Z]/g, ($0) => ` ${$0.toLowerCase()}`),
              args,
              {} // forwardedFlags
            );
          }
        }
      }

      if (this.isFulfilled()) {
        return execute(this.value());
      } else {
        return addAdditionalPromiseMethods(this.then(execute), expect, subject);
      }
    };

    promise[`and${methodName.replace(/^[a-z]/, ($0) => $0.toUpperCase())}`] =
      function (...args) {
        function execute() {
          if (expect.findTypeOf(args[0]).is('expect.it')) {
            return addAdditionalPromiseMethods(
              args[0](subject),
              expect,
              subject
            );
          } else {
            return camelCaseMethods[methodName](subject)(...args);
          }
        }

        if (this.isFulfilled()) {
          return execute(this.value());
        } else {
          return addAdditionalPromiseMethods(
            this.then(execute),
            expect,
            subject
          );
        }
      };
  });

  return promise;
}

module.exports = addAdditionalPromiseMethods;
