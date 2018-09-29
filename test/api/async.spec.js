/*global expect*/
describe('async', () => {
  var workQueue =
    typeof weknowhow === 'undefined' ? require('../../lib/workQueue') : null;
  var clonedExpect = expect
    .clone()
    .addAssertion('to be sorted after delay', (expect, subject, delay) => {
      expect.errorMode = 'nested';

      return expect.promise(run => {
        setTimeout(
          run(() => {
            expect(subject, 'to be an array');
            expect(subject, 'to equal', [].concat(subject).sort());
          }),
          delay
        );
      });
    })
    .addAssertion('to be ordered after delay', (expect, subject) => {
      expect.errorMode = 'nested';
      return expect(subject, 'to be sorted after delay', 20);
    })
    .addAssertion('im sync', (expect, subject) => {
      return expect.promise(run => {
        run(() => {
          expect(subject, 'to be', 24);
        })();
      });
    });

  it('fails if it is called without a callback', () => {
    expect(
      () => {
        expect.async();
      },
      'to throw',
      /expect.async requires a callback without arguments./
    );

    expect(
      () => {
        expect.async('adsf');
      },
      'to throw',
      /expect.async requires a callback without arguments./
    );
  });

  it('fails if the returned function is not called with a done callback', () => {
    expect(
      () => {
        expect.async(() => {})();
      },
      'to throw',
      /expect.async should be called in the context of an it-block/
    );

    expect(
      () => {
        expect.async(() => {})('foo');
      },
      'to throw',
      /expect.async should be called in the context of an it-block/
    );
  });

  it('fails if is called within a asynchronous context', () => {
    expect(
      () => {
        function done() {}
        expect.async(() => {
          expect.async(() => {})(done);
        })(done);
      },
      'to throw',
      /expect.async can't be within a expect.async context./
    );
  });

  it('fails if the callback does not return a promise or throws', () => {
    expect(
      () => {
        function done() {}
        expect.async(() => {})(done);
      },
      'to throw',
      /expect.async requires the block to return a promise or throw an exception./
    );

    expect(
      () => {
        function done() {}
        expect.async(() => {
          return {};
        })(done);
      },
      'to throw',
      /expect.async requires the block to return a promise or throw an exception./
    );
  });

  it(
    'supports composition',
    expect.async(() => {
      return expect(
        clonedExpect([1, 3, 2], 'to be ordered after delay'),
        'to be rejected with',
        'expected [ 1, 3, 2 ] to be ordered after delay\n' +
          '  expected [ 1, 3, 2 ] to be sorted after delay 20\n' +
          '    expected [ 1, 3, 2 ] to equal [ 1, 2, 3 ]\n' +
          '\n' +
          '    [\n' +
          '        1,\n' +
          '    ┌─▷\n' +
          '    │   3,\n' +
          '    └── 2 // should be moved\n' +
          '    ]'
      );
    })
  );

  it(
    'has a nice syntax',
    expect.async(() => {
      return expect(
        clonedExpect([1, 3, 2], 'to be sorted after delay', 20),
        'to be rejected with',
        'expected [ 1, 3, 2 ] to be sorted after delay 20\n' +
          '  expected [ 1, 3, 2 ] to equal [ 1, 2, 3 ]\n' +
          '\n' +
          '  [\n' +
          '      1,\n' +
          '  ┌─▷\n' +
          '  │   3,\n' +
          '  └── 2 // should be moved\n' +
          '  ]'
      );
    })
  );

  it('tests that assertions that returns promises are converted to exceptions if they are sync', () => {
    expect(
      () => {
        clonedExpect(42, 'im sync');
      },
      'to throw',
      'expected 42 im sync'
    );
  });

  if (workQueue) {
    it('throw an unhandled rejection if a promise is not caught by the test', done => {
      workQueue.onUnhandledRejection = function(err) {
        expect(
          err.getErrorMessage({ format: 'text' }).toString(),
          'to equal',
          'expected [ 1, 3, 2 ] to be ordered after delay\n' +
            '  expected [ 1, 3, 2 ] to be sorted after delay 20\n' +
            '    expected [ 1, 3, 2 ] to equal [ 1, 2, 3 ]\n' +
            '\n' +
            '    [\n' +
            '        1,\n' +
            '    ┌─▷\n' +
            '    │   3,\n' +
            '    └── 2 // should be moved\n' +
            '    ]'
        );

        workQueue.onUnhandledRejection = null;
        done();
      };

      clonedExpect([1, 3, 2], 'to be ordered after delay');
    });
  }
});
