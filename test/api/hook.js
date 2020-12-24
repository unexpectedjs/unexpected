/* global expect */
describe('hook', () => {
  it('should hook into the expect function itself', () => {
    const clonedExpect = expect.clone();
    let called = false;
    clonedExpect.hook(function (next) {
      return function (context, args) {
        called = true;
        return next(context, args);
      };
    });
    expect(called).toBeFalse();
    clonedExpect(123).toEqual(123);
    expect(called).toBeTrue();
  });

  describe('with expect.clone', () => {
    it('should not affect clones made before hooking in', () => {
      const clonedExpect = expect.clone();
      const clonedClonedExpect = clonedExpect.clone();

      let called = false;
      clonedExpect.hook(function (next) {
        return function (context, args) {
          called = true;
          return next(context, args);
        };
      });
      clonedClonedExpect(123).toEqual(123);
      expect(called).toBeFalse();
    });

    it('should affect clones made after hooking in', () => {
      const clonedExpect = expect.clone();
      let called = false;
      clonedExpect.hook(function (next) {
        return function (context, args) {
          called = true;
          return next(context, args);
        };
      });
      const clonedClonedExpect = clonedExpect.clone();
      clonedClonedExpect(123).toEqual(123);
      expect(called).toBeTrue();
    });
  });

  describe('with expect.child', () => {
    it('should affect child instances made before installing the hook', () => {
      const parentExpect = expect.clone();
      const childExpect = parentExpect.child();

      let called = false;
      parentExpect.hook(function (next) {
        return function (context, args) {
          called = true;
          return next(context, args);
        };
      });

      childExpect(123).toEqual(123);
      expect(called).toBeTrue();
    });

    it('should not affect child instances made after installing the hook', () => {
      const parentExpect = expect.clone();

      let called = false;
      parentExpect.hook(function (next) {
        return function (context, args) {
          called = true;
          return next(context, args);
        };
      });

      const childExpect = parentExpect.clone();

      childExpect(123).toEqual(123);
      expect(called).toBeTrue();
    });
  });

  it('should allow rewriting the assertion string', () => {
    const clonedExpect = expect.clone();
    clonedExpect.hook(function (next) {
      return function (context, args) {
        args[1] = 'to equal';
        return next(context, args);
      };
    });
    clonedExpect(123, 'to foobarquux', 123);
  });

  it('should allow suppressing the return value of the "next" expect', () => {
    const clonedExpect = expect.clone();
    clonedExpect.hook(function (next) {
      return function (context, args) {
        try {
          next(context, args);
        } catch (e) {
          return expect.promise.resolve();
        }
      };
    });
    clonedExpect(123).toEqual(456);
  });

  it('should allow installing multiple hooks', () => {
    let firstCalled = false;
    let secondCalled = false;
    const clonedExpect = expect.clone();
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
    clonedExpect(123).toEqual(123);
    expect(firstCalled).toBeTrue();
    expect(secondCalled).toBeTrue();
  });

  // Regression test for https://gitter.im/unexpectedjs/unexpected?at=5fb42b73747be107c1c76095
  it('should not break `this` in clones created after installing the hook', function () {
    const parentExpect = expect.clone();
    parentExpect.hook(function (next) {
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

    expect(() => {
      clonedExpect(['aaa', 'bbb']).toSatisfy(['foo']);
    }).toThrow(
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
