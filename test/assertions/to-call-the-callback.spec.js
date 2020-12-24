/* global expect */
describe('to call the callback assertion', () => {
  it('should succeed when the callback is called synchronously', () => {
    return expect(function (cb) {
      cb();
    }).toCallTheCallback();
  });

  it('should fail when the callback is called twice synchronously', () => {
    return expect(function () {
      return expect(function (cb) {
        cb();
        cb();
      }).toCallTheCallback();
    }).toError(
      'expected\n' +
        'function (cb) {\n' +
        '  cb();\n' +
        '  cb();\n' +
        '}\n' +
        'to call the callback\n' +
        '  The callback was called twice'
    );
  });

  it('should fail when the callback is called twice asynchronously', () => {
    return expect(function () {
      // prettier-ignore
      return expect(function (cb) {
          setTimeout(function () {
            cb();
            cb();
          }, 0);
        }).toCallTheCallback();
    }).toError(
      'expected\n' +
        'function (cb) {\n' +
        '  setTimeout(function () {\n' +
        '    cb();\n' +
        '    cb();\n' +
        '  }, 0);\n' +
        '}\n' +
        'to call the callback\n' +
        '  The callback was called twice'
    );
  });

  it('should return a promise that is fulfilled with the values passed to the callback', () => {
    return expect(function (cb) {
      cb(new Error('foo'), 2, 3, 4);
    })
      .toCallTheCallback()
      .then(function (args) {
        expect(args).toEqual([new Error('foo'), 2, 3, 4]);
      });
  });

  it("should return a promise that is compatible with Bluebird's spread feature", () => {
    return expect(function (cb) {
      cb(new Error('foo'), 2);
    })
      .toCallTheCallback()
      .spread(function (arg1, arg2) {
        expect(arg1).toEqual(new Error('foo'));
        expect(arg2).toEqual(2);
        expect(arguments).toSatisfy([new Error('foo'), 2]);
      });
  });

  it('should succeed when the callback is called asynchronously', () => {
    return expect(function (cb) {
      setTimeout(function () {
        cb();
      });
    }).toCallTheCallback();
  });

  it('should succeed when the callback is called with an error', () => {
    return expect(function (cb) {
      setTimeout(function () {
        cb(new Error("don't mind me"));
      });
    }).toCallTheCallback();
  });

  it('should fail if the function throws an exception', () => {
    return expect(function () {
      return expect(function (cb) {
        throw new Error('argh');
      }).toCallTheCallback();
    }).toError('argh');
  });

  describe('with error', () => {
    describe('with an expected error', () => {
      it('should succeed', () => {
        return expect(function (cb) {
          setTimeout(function () {
            cb(new Error('bla'));
          }, 0);
        }).toCallTheCallbackWithError(new Error('bla'));
      });

      it('should provide the error as the promise fulfillment value', () => {
        return expect(function (cb) {
          setTimeout(function () {
            cb(new Error('bla'));
          }, 0);
        })
          .toCallTheCallbackWithError(new Error('bla'))
          .then(function (err) {
            expect(err).toEqual(new Error('bla'));
          });
      });

      it('should provide the error as the promise fulfillment value when matching against an UnexpectedError', () => {
        try {
          expect(true).toBeFalsy();
        } catch (err) {
          return expect(function (cb) {
            setTimeout(function () {
              cb(err);
            }, 0);
          })
            .toCallTheCallbackWithError('expected true to be falsy')
            .then(function (err) {
              expect(err).toHaveMessage('expected true to be falsy');
            });
        }
      });

      describe('given as a string to be tested against the error message', () => {
        it('should succeed', () => {
          return expect(function (cb) {
            setTimeout(function () {
              cb(new Error('bla'));
            }, 0);
          }).toCallTheCallbackWithError('bla');
        });

        it('should fail with a diff', () => {
          return expect(function () {
            return expect(
              // prettier-ignore
              function (cb) {
                  setTimeout(function () {
                    cb(new Error('bla'));
                  }, 0);
                }
            ).toCallTheCallbackWithError('quux');
          }).toError(
            'expected\n' +
              'function (cb) {\n' +
              '  setTimeout(function () {\n' +
              "    cb(new Error('bla'));\n" +
              '  }, 0);\n' +
              '}\n' +
              "to call the callback with error 'quux'\n" +
              "  expected Error('bla') to satisfy 'quux'\n" +
              '\n' +
              '  -bla\n' +
              '  +quux'
          );
        });
      });

      describe('given as a regular expression to be matched against the error message', () => {
        it('should succeed', () => {
          return expect(function (cb) {
            setTimeout(function () {
              cb(new Error('bla'));
            }, 0);
          }).toCallTheCallbackWithError(/a/);
        });

        it('should fail with a diff', () => {
          return expect(function () {
            return expect(
              // prettier-ignore
              function (cb) {
                  setTimeout(function () {
                    cb(new Error('bla'));
                  }, 0);
                }
            ).toCallTheCallbackWithError(/q/);
          }).toError(
            'expected\n' +
              'function (cb) {\n' +
              '  setTimeout(function () {\n' +
              "    cb(new Error('bla'));\n" +
              '  }, 0);\n' +
              '}\n' +
              'to call the callback with error /q/\n' +
              "  expected Error('bla') to satisfy /q/"
          );
        });

        it('should support UnexpectedError instances', () => {
          return expect(function () {
            return expect(
              // prettier-ignore
              function(cb) {
                  setTimeout(function () {
                    try {
                      expect(false).toBeTruthy();
                    } catch (err) {
                      cb(err);
                    }
                  }, 0);
                }
            ).toCallTheCallbackWithError(/qqxqwxeqw/);
          }).toError(
            'expected\n' +
              'function (cb) {\n' +
              '  setTimeout(function () {\n' +
              '    try {\n' +
              "      expect(false, 'to be truthy');\n" +
              '    } catch (err) {\n' +
              '      cb(err);\n' +
              '    }\n' +
              '  }, 0);\n' +
              '}\n' +
              'to call the callback with error /qqxqwxeqw/\n' +
              '  expected UnexpectedError(expected false to be truthy) to have message /qqxqwxeqw/\n' +
              "    expected 'expected false to be truthy' to match /qqxqwxeqw/"
          );
        });
      });

      it('should fail with a diff when the error does not satisfy the expected error', () => {
        return expect(function () {
          return expect(
            // prettier-ignore
            function (cb) {
                setTimeout(function () {
                  cb(new Error('foo'));
                }, 0);
              }
          ).toCallTheCallbackWithError(new Error('bla'));
        }).toError(
          'expected\n' +
            'function (cb) {\n' +
            '  setTimeout(function () {\n' +
            "    cb(new Error('foo'));\n" +
            '  }, 0);\n' +
            '}\n' +
            "to call the callback with error Error('bla')\n" +
            "  expected Error('foo') to satisfy Error('bla')\n" +
            '\n' +
            '  Error({\n' +
            "    message: 'foo' // should equal 'bla'\n" +
            '                   //\n' +
            '                   // -foo\n' +
            '                   // +bla\n' +
            '  })'
        );
      });

      it('should fail with a diff when no error was passed to the callback', () => {
        return expect(function () {
          return expect(function (cb) {
            setTimeout(cb, 0);
          }).toCallTheCallbackWithError(new Error('bla'));
        }).toError(
          'expected function (cb) { setTimeout(cb, 0); }\n' +
            "to call the callback with error Error('bla')"
        );
      });
    });

    describe('without an expected error', () => {
      it('should succeed', () => {
        return expect(function (cb) {
          setTimeout(function () {
            cb(new Error('bla'));
          }, 0);
        }).toCallTheCallbackWithError();
      });

      it('should fail with a diff when no error was passed to the callback', () => {
        return expect(function () {
          return expect(function (cb) {
            setTimeout(cb, 0);
          }).toCallTheCallbackWithError();
        }).toError(
          'expected function (cb) { setTimeout(cb, 0); } to call the callback with error'
        );
      });
    });
  });

  describe('without error', () => {
    it('should throw if called with an expected error instance', () => {
      expect(function () {
        return expect(
          // prettier-ignore
          function (cb) {
              setTimeout(function () {
                cb(new Error('bla'));
              }, 0);
            }
        ).toCallTheCallbackWithoutError(new Error('bla'));
      }).toThrow(
        'expected\n' +
          'function (cb) {\n' +
          '  setTimeout(function () {\n' +
          "    cb(new Error('bla'));\n" +
          '  }, 0);\n' +
          '}\n' +
          "to call the callback without error Error('bla')\n" +
          '  The assertion does not have a matching signature for:\n' +
          '    <function> to call the callback without error <Error>\n' +
          '  did you mean:\n' +
          '    <function> to call the callback without error'
      );
    });

    it('should succeed', () => {
      return expect(function (cb) {
        return setTimeout(cb, 0);
      }).toCallTheCallbackWithoutError();
    });

    it('should fail with a diff', () => {
      return expect(function () {
        // prettier-ignore
        return expect(function (cb) {
            return setTimeout(function () {
              cb(new Error('wat'));
            }, 0);
          }).toCallTheCallbackWithoutError();
      }).toError(
        'expected\n' +
          'function (cb) {\n' +
          '  return setTimeout(function () {\n' +
          "    cb(new Error('wat'));\n" +
          '  }, 0);\n' +
          '}\n' +
          'to call the callback without error\n' +
          "  called the callback with: Error('wat')"
      );
    });

    it('should return a promise that is fulfilled with the values passed to the callback excluding the first (falsy error) parameter', () => {
      return expect(function (cb) {
        cb(null, 1, 2);
      })
        .toCallTheCallbackWithoutError()
        .then(function (args) {
          expect(args).toEqual([1, 2]);
        });
    });

    it('should support UnexpectedError instances', () => {
      return expect(function () {
        // prettier-ignore
        return expect(function(cb) {
            setTimeout(function () {
              try {
                expect(false).toBeTruthy();
              } catch (err) {
                cb(err);
              }
            }, 0);
          }).toCallTheCallbackWithoutError();
      }).toError(
        'expected\n' +
          'function (cb) {\n' +
          '  setTimeout(function () {\n' +
          '    try {\n' +
          "      expect(false, 'to be truthy');\n" +
          '    } catch (err) {\n' +
          '      cb(err);\n' +
          '    }\n' +
          '  }, 0);\n' +
          '}\n' +
          'to call the callback without error\n' +
          '  called the callback with: expected false to be truthy'
      );
    });
  });
});
