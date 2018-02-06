/*global expect*/
describe('utils', function() {
  if (typeof process === 'object') {
    var utils = require('../lib/utils');
    describe('#objectIs', function() {
      describe('without Object.is available', function() {
        var objectIs = Object.is;
        beforeEach(function() {
          Object.is = undefined;
        });

        afterEach(function() {
          Object.is = objectIs;
        });

        var utilsWithoutObjectIsAvailable;
        beforeEach(function() {
          // Avoid require's cache:
          delete require.cache[require.resolve('../lib/utils.js')];
          utilsWithoutObjectIsAvailable = require('../lib/utils');
        });

        it('should say that the number 123 is itself', function() {
          expect(
            utilsWithoutObjectIsAvailable.objectIs(123, 123),
            'to be true'
          );
        });

        it('should say that the NaN is itself', function() {
          expect(
            utilsWithoutObjectIsAvailable.objectIs(NaN, NaN),
            'to be true'
          );
        });

        it('should say that -0 is not 0', function() {
          expect(utilsWithoutObjectIsAvailable.objectIs(-0, 0), 'to be false');
        });

        it('should say that 0 is not -0', function() {
          expect(utilsWithoutObjectIsAvailable.objectIs(0, -0), 'to be false');
        });

        it('should say that 0 is 0', function() {
          expect(utilsWithoutObjectIsAvailable.objectIs(0, 0), 'to be true');
        });

        it('should say that -0 is -0', function() {
          expect(utilsWithoutObjectIsAvailable.objectIs(-0, -0), 'to be true');
        });
      });
    });

    describe('#getFunctionName', function() {
      it('should return the name of a named function', function() {
        expect(utils.getFunctionName(function foo() {}), 'to equal', 'foo');
      });

      it('should return the empty string for an anonymous function', function() {
        expect(utils.getFunctionName(function() {}), 'to equal', '');
      });

      describe('with Function.prototype.toString mocked out', function() {
        var orig;
        beforeEach(function() {
          orig = Function.prototype.toString;
          Function.prototype.toString = function() {
            return 'function whatever() {}';
          };
        });

        afterEach(function() {
          Function.prototype.toString = orig;
        });

        it('should return what Function.prototype.toString says for an object without a name property', function() {
          expect(utils.getFunctionName({}), 'to equal', 'whatever');
        });
      });
    });
  }
});
