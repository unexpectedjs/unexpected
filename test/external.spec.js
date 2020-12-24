/* global unexpected */

const expect = unexpected.clone();

if (typeof process === 'object') {
  describe('invoked in a test via an external test runner', () => {
    const findNodeModules = require('find-node-modules');
    const pathModule = require('path');
    const childProcess = require('child_process');
    const basePath = pathModule.join(findNodeModules()[0], '..');
    const externaltestsDir = pathModule.join(__dirname, '..', 'externaltests');
    const extend = require('../lib/utils').extend;
    describe('executed through mocha', () => {
      expect.addAssertion(
        '<array|string> executed through mocha <object?>',
        function (expect, subject, env) {
          if (!Array.isArray(subject)) {
            subject = [subject];
          }
          return expect.promise(function (run) {
            childProcess.execFile(
              pathModule.resolve(basePath, 'node_modules', '.bin', 'mocha'),
              [
                '--config',
                pathModule.resolve(basePath, '.mocharc.json'),
                ...subject.map(function (fileName) {
                  return pathModule.resolve(
                    externaltestsDir,
                    `${fileName}.spec.js`
                  );
                }),
              ],
              {
                cwd: basePath,
                env: extend({}, process.env, env || {}),
              },
              run(function (err, stdout, stderr) {
                return [err, stdout, stderr];
              })
            );
          });
        }
      );

      it('should report that a promise was created, but not returned by the it block', () => {
        return expect(
          'forgotToReturnPendingPromiseFromSuccessfulItBlock',
          'executed through mocha'
        ).spread(function (err, stdout, stderr) {
          expect(stdout).toContain(
            'Error: should call the callback: You have created a promise that was not returned from the it block'
          );
          expect(err).toSatisfy({ code: 1 });
        });
      });

      it('should not report that a promise was created if the test already failed synchronously', () => {
        return expect(
          'forgotToReturnPendingPromiseFromFailingItBlock',
          'executed through mocha'
        ).spread(function (err, stdout, stderr) {
          expect(stdout).notToContain(
            'should call the callback: You have created a promise that was not returned from the it block'
          );
          expect(err).toSatisfy({ code: 1 });
        });
      });

      it('should trim unexpected plugins from the stack trace when the UNEXPECTED_FULL_TRACE environment variable is not set', () => {
        return expect('fullTrace', 'executed through mocha', {
          UNEXPECTED_FULL_TRACE: '',
        }).spread(function (err, stdout, stderr) {
          expect(stdout).notToContain('node_modules/unexpected-bogus/');
          expect(err).toSatisfy({ code: 1 });
        });
      });

      it('should not trim unexpected plugins from the stack trace when the UNEXPECTED_FULL_TRACE environment variable is set', () => {
        return expect('fullTrace', 'executed through mocha', {
          UNEXPECTED_FULL_TRACE: 'yes',
        }).spread(function (err, stdout, stderr) {
          expect(stdout).toContain('node_modules/unexpected-bogus/');
          expect(err).toSatisfy({ code: 1 });
        });
      });

      it('should accept an UNEXPECTED_DEPTH environment variable', () => {
        return expect('deepObject', 'executed through mocha', {
          UNEXPECTED_DEPTH: 6,
        }).spread(function (err, stdout, stderr) {
          expect(err).toBeFalsy();
        });
      });

      it('should render a long stack trace for an async test', () => {
        return expect('failingAsync', 'executed through mocha').spread(
          function (err, stdout, stderr) {
            expect(err).toBeTruthy();
            expect(stdout).toContain('From previous event:');
          }
        );
      });

      it('should fail when a promise failing in the next tick is created but not returned', () => {
        return expect(
          'forgotToReturnPromiseRejectedInTheNextTick',
          'executed through mocha'
        ).spread(function (err, stdout, stderr) {
          expect(stdout).toContain(
            'Error: should fail: You have created a promise that was not returned from the it block'
          );
          expect(err).toSatisfy({
            code: expect.toBeGreaterThan(0),
          });
        });
      });

      it('should not fail when an unresolved promise was used in a expect.promise.any construct', () => {
        return expect(
          'avoidPromiseAnyFootgunFalsePositive',
          'executed through mocha'
        ).then(([err]) => {
          expect(err).toBeFalsy();
        });
      });

      it('should not fail when an unresolved promise was used in a expect.promise.race construct', () => {
        return expect(
          'avoidPromiseRaceFootgunFalsePositive',
          'executed through mocha'
        ).then(([err]) => {
          expect(err).toBeFalsy();
        });
      });

      describe('with a test suite spanning multiple files', () => {
        it('should report that a promise was created, but not returned by the it block in the first test', () => {
          return expect(
            ['forgotToReturnPendingPromiseFromSuccessfulItBlock', 'successful'],
            'executed through mocha'
          ).spread(function (err, stdout, stderr) {
            expect(stdout).toContain(
              'Error: should call the callback: You have created a promise that was not returned from the it block'
            );
            expect(err).toSatisfy({ code: 1 });
          });
        });

        it('should report that a promise was created, but not returned by the it block in the second test', () => {
          return expect(
            ['successful', 'forgotToReturnPendingPromiseFromSuccessfulItBlock'],
            'executed through mocha'
          ).spread(function (err, stdout, stderr) {
            expect(stdout).toContain(
              'Error: should call the callback: You have created a promise that was not returned from the it block'
            );
            expect(err).toSatisfy({ code: 1 });
          });
        });
      });

      describe('with an assertion that succeeds, but creates a promise that remains pending', () => {
        it('should pass', () => {
          return expect(
            'assertionSucceedsWhilePromiseIsPending',
            'executed through mocha'
          ).spread(function (err, stdout, stderr) {
            expect(stdout).notToContain(
              'Error: should call the callback: You have created a promise that was not returned from the it block'
            );
            expect(err).toBeFalsy();
          });
        });
      });

      it('should render the stack trace of the thrown error without any artifacts when "not to error" encounters an error', () => {
        return expect('notToErrorCaughtError', 'executed through mocha').spread(
          function (err, stdout, stderr) {
            expect(err).toSatisfy({ code: 1 });
            expect(stdout)
              .toContain(
                'not to error\n' +
                  "  returned promise rejected with: Error('argh')\n"
              )
              .and('to contain', '      at thisIsImportant');
          }
        );
      });
    });

    describe('executed through jasmine', () => {
      expect.addAssertion(
        '<string> executed through jasmine',
        function (expect, subject) {
          return expect.promise(function (run) {
            childProcess.execFile(
              pathModule.resolve(basePath, 'node_modules', '.bin', 'jasmine'),
              {
                cwd: pathModule.join(externaltestsDir, '..'),
                env: extend({}, process.env, {
                  JASMINE_CONFIG_PATH: `${externaltestsDir}/${subject}.jasmine.json`,
                }),
              },
              run(function (err, stdout, stderr) {
                return [err, stdout, stderr];
              })
            );
          });
        }
      );

      it('should report that a promise was created, but not returned by the it block when the test ', () => {
        return expect(
          'forgotToReturnPendingPromiseFromSuccessfulItBlock',
          'executed through jasmine'
        ).spread(function (err, stdout, stderr) {
          expect(stdout).toContain(
            'should call the callback: You have created a promise that was not returned from the it block'
          );
          expect(err).toSatisfy({ code: 1 });
        });
      });

      it('should not report that a promise was created if the test already failed synchronously', () => {
        return expect(
          'forgotToReturnPendingPromiseFromFailingItBlock',
          'executed through jasmine'
        ).spread(function (err, stdout, stderr) {
          expect(stdout).notToContain(
            'should call the callback: You have created a promise that was not returned from the it block'
          );
          expect(err).toSatisfy({ code: 1 });
        });
      });

      it('should render the stack trace of the thrown error without any artifacts when "not to error" encounters an error', () => {
        return expect(
          'notToErrorCaughtError',
          'executed through jasmine'
        ).spread(function (err, stdout, stderr) {
          expect(err).toSatisfy({ code: 1 });
          expect(stdout)
            .toContain(
              '    not to error\n' +
                "      returned promise rejected with: Error('argh')\n"
            )
            .and('to contain', '        at thisIsImportant');
        });
      });
    });

    describe('executed through jest', () => {
      expect.addAssertion(
        '<array|string> executed through jest <object?>',
        function (expect, subject, env) {
          if (!Array.isArray(subject)) {
            subject = [subject];
          }
          return expect.promise(function (run) {
            childProcess.execFile(
              pathModule.resolve(basePath, 'node_modules', '.bin', 'jest'),
              [
                '--config',
                pathModule.resolve(externaltestsDir, 'jestconfig.json'),
              ].concat(
                subject.map(function (fileName) {
                  return pathModule.resolve(
                    externaltestsDir,
                    `${fileName}.spec.js`
                  );
                })
              ),
              {
                cwd: basePath,
                env: extend({}, process.env, env || {}),
              },
              run(function (err, stdout, stderr) {
                return [err, stdout, stderr];
              })
            );
          });
        }
      );

      it('should report that a promise was created, but not returned by the it block', () => {
        return expect(
          'forgotToReturnPendingPromiseFromSuccessfulItBlock',
          'executed through jest'
        ).spread(function (err, stdout, stderr) {
          expect(stderr).toContain(
            'should call the callback: You have created a promise that was not returned from the it block'
          );
          expect(err).toSatisfy({ code: 1 });
        });
      });

      it('should not report that a promise was created if the test already failed synchronously', () => {
        return expect(
          'forgotToReturnPendingPromiseFromFailingItBlock',
          'executed through jest'
        ).spread(function (err, stdout, stderr) {
          expect(stderr).notToContain(
            'should call the callback: You have created a promise that was not returned from the it block'
          );
          expect(err).toSatisfy({ code: 1 });
        });
      });

      it('should trim unexpected plugins from the stack trace when the UNEXPECTED_FULL_TRACE environment variable is not set', () => {
        return expect('fullTrace', 'executed through jest', {
          UNEXPECTED_FULL_TRACE: '',
        }).spread(function (err, stdout, stderr) {
          expect(stderr).notToContain('node_modules/unexpected-bogus/');
          expect(err).toSatisfy({ code: 1 });
        });
      });

      it('should not trim unexpected plugins from the stack trace when the UNEXPECTED_FULL_TRACE environment variable is set', () => {
        return expect('fullTrace', 'executed through jest', {
          UNEXPECTED_FULL_TRACE: 'yes',
        }).spread(function (err, stdout, stderr) {
          expect(stderr).toContain('node_modules/unexpected-bogus/');
          expect(err).toSatisfy({ code: 1 });
        });
      });

      it('should accept an UNEXPECTED_DEPTH environment variable', () => {
        return expect('deepObject', 'executed through jest', {
          UNEXPECTED_DEPTH: 6,
        }).spread(function (err, stdout, stderr) {
          expect(err).toBeFalsy();
        });
      });

      it('should render a long stack trace for an async test', () => {
        return expect('failingAsync', 'executed through jest').spread(function (
          err,
          stdout,
          stderr
        ) {
          expect(err).toBeTruthy();
          expect(stderr).toContain('From previous event:');
        });
      });

      it('should fail when a promise failing in the next tick is created but not returned', () => {
        return expect(
          'forgotToReturnPromiseRejectedInTheNextTick',
          'executed through jest'
        ).spread(function (err, stdout, stderr) {
          expect(stderr).toContain(
            'should fail: You have created a promise that was not returned from the it block'
          );
          expect(err).toSatisfy({ code: 1 });
        });
      });

      it('should not fail when an unresolved promise was used in a expect.promise.any construct', () => {
        return expect(
          'avoidPromiseAnyFootgunFalsePositive',
          'executed through jest'
        ).then(([err]) => {
          expect(err).toBeFalsy();
        });
      });

      it('should not fail when an unresolved promise was used in a expect.promise.race construct', () => {
        return expect(
          'avoidPromiseRaceFootgunFalsePositive',
          'executed through jest'
        ).then(([err]) => {
          expect(err).toBeFalsy();
        });
      });

      describe('with a test suite spanning multiple files', () => {
        it('should report that a promise was created, but not returned by the it block in the first test', () => {
          return expect(
            ['forgotToReturnPendingPromiseFromSuccessfulItBlock', 'successful'],
            'executed through jest'
          ).spread(function (err, stdout, stderr) {
            expect(stderr).toContain(
              'should call the callback: You have created a promise that was not returned from the it block'
            );
            expect(err).toSatisfy({ code: 1 });
          });
        });

        it('should report that a promise was created, but not returned by the it block in the second test', () => {
          return expect(
            ['successful', 'forgotToReturnPendingPromiseFromSuccessfulItBlock'],
            'executed through jest'
          ).spread(function (err, stdout, stderr) {
            expect(stderr).toContain(
              'should call the callback: You have created a promise that was not returned from the it block'
            );
            expect(err).toSatisfy({ code: 1 });
          });
        });
      });

      describe('with an assertion that succeeds, but creates a promise that remains pending', () => {
        it('should pass', () => {
          return expect(
            'assertionSucceedsWhilePromiseIsPending',
            'executed through jest'
          ).spread(function (err, stdout, stderr) {
            expect(stderr).notToContain(
              'should call the callback: You have created a promise that was not returned from the it block'
            );
            expect(err).toBeFalsy();
          });
        });
      });

      it('should render the stack trace of the thrown error without any artifacts when "not to error" encounters an error', () => {
        return expect('notToErrorCaughtError', 'executed through jest').spread(
          function (err, stdout, stderr) {
            expect(err).toSatisfy({ code: 1 });
            expect(stderr)
              .toContain(
                '    not to error\n' +
                  "      returned promise rejected with: Error('argh')\n"
              )
              .and('to contain', '      at thisIsImportant');
          }
        );
      });
    });
  });
}
