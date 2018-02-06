/*global expect*/
describe('to call the callback assertion', function() {
  it('should succeed when the callback is called synchronously', function() {
    return expect(function(cb) {
      cb();
    }, 'to call the callback');
  });

  it('should fail when the callback is called twice synchronously', function() {
    return expect(
      function() {
        return expect(function(cb) {
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

  it('should fail when the callback is called twice asynchronously', function() {
    return expect(
      function() {
        return expect(function(cb) {
          setTimeout(function() {
            cb();
            cb();
          }, 0);
        }, 'to call the callback');
      },
      'to error',
      'expected\n' +
        'function (cb) {\n' +
        '  setTimeout(function() {\n' +
        '    cb();\n' +
        '    cb();\n' +
        '  }, 0);\n' +
        '}\n' +
        'to call the callback\n' +
        '  The callback was called twice'
    );
  });

  it('should return a promise that is fulfilled with the values passed to the callback', function() {
    return expect(function(cb) {
      cb(1, 2, 3, 4);
    }, 'to call the callback').then(function(args) {
      expect(args, 'to equal', [1, 2, 3, 4]);
    });
  });

  it("should return a promise that is compatible with Bluebird's spread feature", function() {
    return expect(function(cb) {
      cb(1, 2);
    }, 'to call the callback').spread(function(arg1, arg2) {
      expect(arg1, 'to equal', 1);
      expect(arg2, 'to equal', 2);
      expect(arguments, 'to satisfy', [1, 2]);
    });
  });

  it('should succeed when the callback is called asynchronously', function() {
    return expect(function(cb) {
      setTimeout(function() {
        cb();
      });
    }, 'to call the callback');
  });

  it('should succeed when the callback is called with an error', function() {
    return expect(function(cb) {
      setTimeout(function() {
        cb(new Error("don't mind me"));
      });
    }, 'to call the callback');
  });

  it('should fail if the function throws an exception', function() {
    return expect(
      function() {
        return expect(function(cb) {
          throw new Error('argh');
        }, 'to call the callback');
      },
      'to error',
      'argh'
    );
  });

  describe('with error', function() {
    describe('with an expected error', function() {
      it('should succeed', function() {
        return expect(
          function(cb) {
            setTimeout(function() {
              cb(new Error('bla'));
            }, 0);
          },
          'to call the callback with error',
          new Error('bla')
        );
      });

      it('should provide the error as the promise fulfillment value', function() {
        return expect(
          function(cb) {
            setTimeout(function() {
              cb(new Error('bla'));
            }, 0);
          },
          'to call the callback with error',
          new Error('bla')
        ).then(function(err) {
          expect(err, 'to equal', new Error('bla'));
        });
      });

      it('should provide the error as the promise fulfillment value when matching against an UnexpectedError', function() {
        try {
          expect(true, 'to be falsy');
        } catch (err) {
          return expect(
            function(cb) {
              setTimeout(function() {
                cb(err);
              }, 0);
            },
            'to call the callback with error',
            'expected true to be falsy'
          ).then(function(err) {
            expect(err, 'to have message', 'expected true to be falsy');
          });
        }
      });

      describe('given as a string to be tested against the error message', function() {
        it('should succeed', function() {
          return expect(
            function(cb) {
              setTimeout(function() {
                cb(new Error('bla'));
              }, 0);
            },
            'to call the callback with error',
            'bla'
          );
        });

        it('should fail with a diff', function() {
          return expect(
            function() {
              return expect(
                function(cb) {
                  setTimeout(function() {
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
              '  setTimeout(function() {\n' +
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

      describe('given as a regular expression to be matched against the error message', function() {
        it('should succeed', function() {
          return expect(
            function(cb) {
              setTimeout(function() {
                cb(new Error('bla'));
              }, 0);
            },
            'to call the callback with error',
            /a/
          );
        });

        it('should fail with a diff', function() {
          return expect(
            function() {
              return expect(
                function(cb) {
                  setTimeout(function() {
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
              '  setTimeout(function() {\n' +
              "    cb(new Error('bla'));\n" +
              '  }, 0);\n' +
              '}\n' +
              'to call the callback with error /q/\n' +
              "  expected Error('bla') to satisfy /q/"
          );
        });

        it('should support UnexpectedError instances', function() {
          return expect(
            function() {
              return expect(
                function(cb) {
                  setTimeout(function() {
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
              '  setTimeout(function() {\n' +
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

      it('should fail with a diff when the error does not satisfy the expected error', function() {
        return expect(
          function() {
            return expect(
              function(cb) {
                setTimeout(function() {
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
            '  setTimeout(function() {\n' +
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

      it('should fail with a diff when no error was passed to the callback', function() {
        return expect(
          function() {
            return expect(
              function(cb) {
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

    describe('without an expected error', function() {
      it('should succeed', function() {
        return expect(function(cb) {
          setTimeout(function() {
            cb(new Error('bla'));
          }, 0);
        }, 'to call the callback with error');
      });

      it('should fail with a diff when no error was passed to the callback', function() {
        return expect(
          function() {
            return expect(function(cb) {
              setTimeout(cb, 0);
            }, 'to call the callback with error');
          },
          'to error',
          'expected function (cb) { setTimeout(cb, 0); } to call the callback with error'
        );
      });
    });
  });

  describe('without error', function() {
    it('should throw if called with an expected error instance', function() {
      expect(
        function() {
          return expect(
            function(cb) {
              setTimeout(function() {
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
          '  setTimeout(function() {\n' +
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

    it('should succeed', function() {
      return expect(function(cb) {
        return setTimeout(cb, 0);
      }, 'to call the callback without error');
    });

    it('should fail with a diff', function() {
      return expect(
        function() {
          return expect(function(cb) {
            return setTimeout(function() {
              cb(new Error('wat'));
            }, 0);
          }, 'to call the callback without error');
        },
        'to error',
        'expected\n' +
          'function (cb) {\n' +
          '  return setTimeout(function() {\n' +
          "    cb(new Error('wat'));\n" +
          '  }, 0);\n' +
          '}\n' +
          'to call the callback without error\n' +
          "  called the callback with: Error('wat')"
      );
    });

    it('should return a promise that is fulfilled with the values passed to the callback excluding the first (falsy error) parameter', function() {
      return expect(function(cb) {
        cb(null, 1, 2);
      }, 'to call the callback without error').then(function(args) {
        expect(args, 'to equal', [1, 2]);
      });
    });

    it('should support UnexpectedError instances', function() {
      return expect(
        function() {
          return expect(function(cb) {
            setTimeout(function() {
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
          '  setTimeout(function() {\n' +
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
