/*global expect*/
describe('to error assertion', () => {
  describe('with a function that throws', () => {
    describe('with the "not" flag', () => {
      it('should indicate that the function threw', () => {
        expect(
          () => {
            expect(() => {
              throw new Error('yikes');
            }, 'not to error');
          },
          'to throw',
          "expected () => { throw new Error('yikes'); } not to error\n" +
            "  threw: Error('yikes')"
        );
      });
    });
  });

  describe('with a function that returns a promise that is rejected', () => {
    describe('with the "not" flag', () => {
      it('should indicate that the function returned a rejected promise', () => {
        return expect(
          // prettier-ignore
          expect(() => {
            return expect.promise((resolve, reject) => {
              setTimeout(() => {
                reject(new Error('wat'));
              }, 1);
            });
          }, 'not to error'),
          'to be rejected with',
          'expected\n' +
            '() => {\n' +
            '  return expect.promise((resolve, reject) => {\n' +
            '    setTimeout(() => {\n' +
            "      reject(new Error('wat'));\n" +
            '    }, 1);\n' +
            '  });\n' +
            '}\n' +
            'not to error\n' +
            "  returned promise rejected with: Error('wat')"
        );
      });
    });
  });

  it('should fail if the function returns a fulfilled promise', () => {
    expect(
      () => {
        expect(() => {
          return expect.promise.resolve(123);
        }, 'to error');
      },
      'to throw',
      'expected\n' +
        '() => {\n' +
        '  return expect.promise.resolve(123);\n' +
        '}\n' +
        'to error'
    );
  });

  it('should fail if the function does not throw and does not return a promise', () => {
    expect(
      () => {
        expect(() => {}, 'to error');
      },
      'to throw',
      'expected () => {} to error'
    );
  });

  it('should allow matching the message of an UnexpectedError against a regexp', () => {
    expect(
      () => {
        expect(123, 'to equal', 456);
      },
      'to error',
      /expected 123 to equal 456/
    );
  });

  describe('without the not flag', () => {
    it('should use the stack of the rejection reason when failing', () => {
      return expect(
        () => {
          return expect(
            () => {
              return expect.promise(() => {
                (function thisIsImportant() {
                  throw new Error('argh');
                })();
              });
            },
            'to error with',
            'foobar'
          );
        },
        'to error',
        err => {
          expect(err.stack, 'to match', /thisIsImportant/);
        }
      );
    });

    describe('with another promise library', () => {
      it('should use the stack of the rejection reason when failing', () => {
        return expect(
          () => {
            return expect(
              () => {
                return new Promise((resolve, reject) => {
                  (function thisIsImportant() {
                    throw new Error('argh');
                  })();
                });
              },
              'to error with',
              'foobar'
            );
          },
          'to error',
          err => {
            expect(err.stack, 'to match', /thisIsImportant/);
          }
        );
      });
    });
  });

  describe('with the not flag', () => {
    it('should use the stack of the rejection reason when failing', () => {
      return expect(
        () => {
          return expect(() => {
            return expect.promise(() => {
              (function thisIsImportant() {
                throw new Error('argh');
              })();
            });
          }, 'not to error');
        },
        'to error',
        err => {
          expect(err.stack, 'to match', /thisIsImportant/);
        }
      );
    });

    describe('with another promise library', () => {
      it('should use the stack of the rejection reason when failing', () => {
        return expect(
          () => {
            return expect(() => {
              return new Promise((resolve, reject) => {
                (function thisIsImportant() {
                  throw new Error('argh');
                })();
              });
            }, 'not to error');
          },
          'to error',
          err => {
            expect(err.stack, 'to match', /thisIsImportant/);
          }
        );
      });
    });
  });
});
