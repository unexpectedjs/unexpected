/*global expect*/
describe('to call the callback assertion', () => {
  it('should succeed when the callback is called synchronously', () => {
    return expect(cb => {
      cb();
    }, 'to call the callback');
  });

  it('should fail when the callback is called twice synchronously', () => {
    return expect(
      () => {
        return expect(cb => {
          cb();
          cb();
        }, 'to call the callback');
      },
      'to error',
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
    return expect(
      () => {
        // prettier-ignore
        return expect((cb) => {
          setTimeout(() => {
            cb();
            cb();
          }, 0);
        }, 'to call the callback');
      },
      'to error',
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
    return expect(cb => {
      cb(1, 2, 3, 4);
    }, 'to call the callback').then(args => {
      expect(args, 'to equal', [1, 2, 3, 4]);
    });
  });

  it("should return a promise that is compatible with Bluebird's spread feature", () => {
    return expect(cb => {
      cb(1, 2);
    }, 'to call the callback').spread(function(arg1, arg2) {
      expect(arg1, 'to equal', 1);
      expect(arg2, 'to equal', 2);
      expect(arguments, 'to satisfy', [1, 2]);
    });
  });

  it('should succeed when the callback is called asynchronously', () => {
    return expect(cb => {
      setTimeout(() => {
        cb();
      });
    }, 'to call the callback');
  });

  it('should succeed when the callback is called with an error', () => {
    return expect(cb => {
      setTimeout(() => {
        cb(new Error("don't mind me"));
      });
    }, 'to call the callback');
  });

  it('should fail if the function throws an exception', () => {
    return expect(
      () => {
        return expect(cb => {
          throw new Error('argh');
        }, 'to call the callback');
      },
      'to error',
      'argh'
    );
  });

  describe('with error', () => {
    describe('with an expected error', () => {
      it('should succeed', () => {
        return expect(
          cb => {
            setTimeout(() => {
              cb(new Error('bla'));
            }, 0);
          },
          'to call the callback with error',
          new Error('bla')
        );
      });

      it('should provide the error as the promise fulfillment value', () => {
        return expect(
          cb => {
            setTimeout(() => {
              cb(new Error('bla'));
            }, 0);
          },
          'to call the callback with error',
          new Error('bla')
        ).then(err => {
          expect(err, 'to equal', new Error('bla'));
        });
      });

      it('should provide the error as the promise fulfillment value when matching against an UnexpectedError', () => {
        try {
          expect(true, 'to be falsy');
        } catch (err) {
          return expect(
            cb => {
              setTimeout(() => {
                cb(err);
              }, 0);
            },
            'to call the callback with error',
            'expected true to be falsy'
          ).then(err => {
            expect(err, 'to have message', 'expected true to be falsy');
          });
        }
      });

      describe('given as a string to be tested against the error message', () => {
        it('should succeed', () => {
          return expect(
            cb => {
              setTimeout(() => {
                cb(new Error('bla'));
              }, 0);
            },
            'to call the callback with error',
            'bla'
          );
        });

        it('should fail with a diff', () => {
          return expect(
            () => {
              return expect(
                // prettier-ignore
                (cb) => {
                  setTimeout(() => {
                    cb(new Error('bla'));
                  }, 0);
                },
                'to call the callback with error',
                'quux'
              );
            },
            'to error',
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
          return expect(
            cb => {
              setTimeout(() => {
                cb(new Error('bla'));
              }, 0);
            },
            'to call the callback with error',
            /a/
          );
        });

        it('should fail with a diff', () => {
          return expect(
            () => {
              return expect(
                // prettier-ignore
                (cb) => {
                  setTimeout(() => {
                    cb(new Error('bla'));
                  }, 0);
                },
                'to call the callback with error',
                /q/
              );
            },
            'to error',
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
          return expect(
            () => {
              return expect(
                // prettier-ignore
                (cb) => {
                  setTimeout(() => {
                    try {
                      expect(false, 'to be truthy');
                    } catch (err) {
                      cb(err);
                    }
                  }, 0);
                },
                'to call the callback with error',
                /qqxqwxeqw/
              );
            },
            'to error',
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
        return expect(
          () => {
            return expect(
              // prettier-ignore
              (cb) => {
                setTimeout(() => {
                  cb(new Error('foo'));
                }, 0);
              },
              'to call the callback with error',
              new Error('bla')
            );
          },
          'to error',
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
        return expect(
          () => {
            return expect(
              cb => {
                setTimeout(cb, 0);
              },
              'to call the callback with error',
              new Error('bla')
            );
          },
          'to error',
          'expected function (cb) { setTimeout(cb, 0); }\n' +
            "to call the callback with error Error('bla')"
        );
      });
    });

    describe('without an expected error', () => {
      it('should succeed', () => {
        return expect(cb => {
          setTimeout(() => {
            cb(new Error('bla'));
          }, 0);
        }, 'to call the callback with error');
      });

      it('should fail with a diff when no error was passed to the callback', () => {
        return expect(
          () => {
            return expect(cb => {
              setTimeout(cb, 0);
            }, 'to call the callback with error');
          },
          'to error',
          'expected function (cb) { setTimeout(cb, 0); } to call the callback with error'
        );
      });
    });
  });

  describe('without error', () => {
    it('should throw if called with an expected error instance', () => {
      expect(
        () => {
          return expect(
            // prettier-ignore
            (cb) => {
              setTimeout(() => {
                cb(new Error('bla'));
              }, 0);
            },
            'to call the callback without error',
            new Error('bla')
          );
        },
        'to throw',
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
      return expect(cb => {
        return setTimeout(cb, 0);
      }, 'to call the callback without error');
    });

    it('should fail with a diff', () => {
      return expect(
        () => {
          // prettier-ignore
          return expect((cb) => {
            return setTimeout(() => {
              cb(new Error('wat'));
            }, 0);
          }, 'to call the callback without error');
        },
        'to error',
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
      return expect(cb => {
        cb(null, 1, 2);
      }, 'to call the callback without error').then(args => {
        expect(args, 'to equal', [1, 2]);
      });
    });

    it('should support UnexpectedError instances', () => {
      return expect(
        () => {
          // prettier-ignore
          return expect((cb) => {
            setTimeout(() => {
              try {
                expect(false, 'to be truthy');
              } catch (err) {
                cb(err);
              }
            }, 0);
          }, 'to call the callback without error');
        },
        'to error',
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
