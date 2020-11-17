/* global expect */
describe('hook', () => {
  it('should hook into the expect function itself', () => {
    var clonedExpect = expect.clone();
    var called = false;
    clonedExpect.hook(function (next) {
      return function (context, args) {
        called = true;
        return next(context, args);
      };
    });
    expect(called, 'to be false');
    clonedExpect(123, 'to equal', 123);
    expect(called, 'to be true');
  });

  describe('with expect.clone', () => {
    it('should not affect clones made before hooking in', () => {
      var clonedExpect = expect.clone();
      var clonedClonedExpect = clonedExpect.clone();

      var called = false;
      clonedExpect.hook(function (next) {
        return function (context, args) {
          called = true;
          return next(context, args);
        };
      });
      clonedClonedExpect(123, 'to equal', 123);
      expect(called, 'to be false');
    });

    it('should affect clones made after hooking in', () => {
      var clonedExpect = expect.clone();
      var called = false;
      clonedExpect.hook(function (next) {
        return function (context, args) {
          called = true;
          return next(context, args);
        };
      });
      var clonedClonedExpect = clonedExpect.clone();
      clonedClonedExpect(123, 'to equal', 123);
      expect(called, 'to be true');
    });
  });

  describe('with expect.child', () => {
    it('should not affect child instances made before installing the hook', () => {
      var parentExpect = expect.clone();
      var childExpect = parentExpect.child();

      var called = false;
      parentExpect.hook(function (next) {
        return function (context, args) {
          called = true;
          return next(context, args);
        };
      });

      childExpect(123, 'to equal', 123);
      expect(called, 'to be false');
    });

    it('should not affect child instances made after installing the hook', () => {
      var parentExpect = expect.clone();

      var called = false;
      parentExpect.hook(function (next) {
        return function (context, args) {
          called = true;
          return next(context, args);
        };
      });

      var childExpect = parentExpect.clone();

      childExpect(123, 'to equal', 123);
      expect(called, 'to be true');
    });
  });

  it('should allow rewriting the assertion string', () => {
    var clonedExpect = expect.clone();
    clonedExpect.hook(function (next) {
      return function (context, args) {
        args[1] = 'to equal';
        return next(context, args);
      };
    });
    clonedExpect(123, 'to foobarquux', 123);
  });

  it('should allow suppressing the return value of the "next" expect', () => {
    var clonedExpect = expect.clone();
    clonedExpect.hook(function (next) {
      return function (context, args) {
        try {
          next(context, args);
        } catch (e) {
          return expect.promise.resolve();
        }
      };
    });
    clonedExpect(123, 'to equal', 456);
  });

  it('should allow installing multiple hooks', () => {
    var firstCalled = false;
    var secondCalled = false;
    var clonedExpect = expect.clone();
    clonedExpect.hook(function (next) {
      return function (context, args) {
        firstCalled = true;
        return next(context, args);
      };
    });
    clonedExpect.hook(function (next) {
      return function (context, args) {
        secondCalled = true;
        return next(context, args);
      };
    });
    clonedExpect(123, 'to equal', 123);
    expect(firstCalled, 'to be true');
    expect(secondCalled, 'to be true');
  });

  it('should not break when a clone is created after a hook is added', function () {
    expect.hook(function (next) {
      return function (context, ...rest) {
        return next(context, ...rest);
      };
    });

    const clonedExpect = expect.clone();

    clonedExpect.addType({
      base: 'array',
      name: 'bogusArray',
      identify(obj) {
        return Array.isArray(obj);
      },
      prefix(output) {
        return output;
      },
      suffix(output) {
        return output;
      },
      indent: false,
    });

    expect(
      () => {
        clonedExpect(['aaa', 'bbb'], 'to satisfy', ['foo']);
      },
      'to throw',
      "expected 'aaa', 'bbb' to satisfy 'foo'\n" +
        '\n' +
        "'aaa', // should equal 'foo'\n" +
        '       //\n' +
        '       // -aaa\n' +
        '       // +foo\n' +
        "'bbb' // should be removed"
    );
  });
});
