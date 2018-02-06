/*global expect*/
describe('to have items satisfying assertion', function() {
  it('requires a third argument', function() {
    expect(
      function() {
        expect([1, 2, 3], 'to have items satisfying');
      },
      'to throw',
      'expected [ 1, 2, 3 ] to have items satisfying\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <array> to have items satisfying\n' +
        '  did you mean:\n' +
        '    <array-like> to have items [exhaustively] satisfying <any>\n' +
        '    <array-like> to have items [exhaustively] satisfying <assertion>'
    );
  });

  it('does not accept a fourth argument', function() {
    expect(
      function() {
        expect([1], 'to have items satisfying', 1, 2);
      },
      'to throw',
      'expected [ 1 ] to have items satisfying 1, 2\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <array> to have items satisfying <number> <number>\n' +
        '  did you mean:\n' +
        '    <array-like> to have items [exhaustively] satisfying <any>\n' +
        '    <array-like> to have items [exhaustively] satisfying <assertion>'
    );
  });

  it('only accepts arrays as the target object', function() {
    expect(
      function() {
        expect(42, 'to have items satisfying', function(item) {});
      },
      'to throw',
      'expected 42 to have items satisfying function (item) {}\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <number> to have items satisfying <function>\n' +
        '  did you mean:\n' +
        '    <array-like> to have items [exhaustively] satisfying <any>\n' +
        '    <array-like> to have items [exhaustively] satisfying <assertion>'
    );
  });

  it('fails if the given array is empty', function() {
    expect(
      function() {
        expect([], 'to have items satisfying', function(item) {
          expect(item, 'to be a number');
        });
      },
      'to throw',
      'expected [] to have items satisfying\n' +
        'function (item) {\n' +
        "  expect(item, 'to be a number');\n" +
        '}\n' +
        '  expected [] not to be empty'
    );
  });

  it('asserts that the given callback does not throw for any items in the array', function() {
    expect([0, 1, 2, 3], 'to have items satisfying', function(item, index) {
      expect(item, 'to be a number');
      expect(index, 'to be a number');
    });

    expect(['0', '1', '2', '3'], 'to have items satisfying', function(
      item,
      index
    ) {
      expect(item, 'not to be a number');
      expect(index, 'to be a number');
    });

    expect([0, 1, 2, 3], 'to have items satisfying', 'to be a number');

    expect(
      ['0', '1', '2', '3'],
      'to have items satisfying',
      'not to be a number'
    );

    expect(
      [[1], [2]],
      'to have items satisfying',
      'to have items satisfying',
      'to be a number'
    );
  });

  it('formats non-Unexpected errors correctly', function() {
    expect(
      function() {
        expect(
          [
            [
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20
            ]
          ],
          'to have items satisfying',
          function(item) {
            expect.fail(function(output) {
              output
                .text('foo')
                .nl()
                .text('bar');
            });
          }
        );
      },
      'to throw',
      'expected array to have items satisfying\n' +
        'function (item) {\n' +
        '  expect.fail(function(output) {\n' +
        '    output\n' +
        "      .text('foo')\n" +
        '      .nl()\n' +
        "      .text('bar');\n" +
        '  });\n' +
        '}\n' +
        '\n' +
        '[\n' +
        '  [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ] // foo\n' +
        '                                                                            // bar\n' +
        ']'
    );
  });

  it('supports legacy "to be an array whose items satisfy"', function() {
    expect(
      ['0', '1', '2', '3'],
      'to be an array whose items satisfy',
      'not to be a number'
    );
  });

  it('provides the item index to the callback function', function() {
    var arr = ['0', '1', '2', '3'];
    expect(arr, 'to have items satisfying', function(item, index) {
      expect(index, 'to be a number');
      expect(index, 'to be', parseInt(item, 10));
    });
  });

  it('fails when the assertion fails', function() {
    expect(
      function() {
        expect(['0', 1, '2', '3'], 'to have items satisfying', function(item) {
          expect(item, 'not to be a number');
        });
      },
      'to throw',
      /1, \/\/ should not be a number/
    );

    expect(
      function() {
        expect(
          ['0', 1, '2', '3'],
          'to have items satisfying',
          'not to be a number'
        );
      },
      'to throw',
      /1, \/\/ should not be a number/
    );
  });

  it('provides a detailed report of where failures occur', function() {
    expect(
      function() {
        expect([0, 1, '2', 3, 4], 'to have items satisfying', function(item) {
          expect(item, 'to be a number');
          expect(item, 'to be less than', 4);
        });
      },
      'to throw',
      "expected [ 0, 1, '2', 3, 4 ] to have items satisfying\n" +
        'function (item) {\n' +
        "  expect(item, 'to be a number');\n" +
        "  expect(item, 'to be less than', 4);\n" +
        '}\n' +
        '\n' +
        '[\n' +
        '  0,\n' +
        '  1,\n' +
        "  '2', // should be a number\n" +
        '  3,\n' +
        '  4 // should be less than 4\n' +
        ']'
    );
  });

  it('indents failure reports of nested assertions correctly', function() {
    expect(
      function() {
        expect(
          [[0, 1, 2], [4, '5', 6], [7, 8, '9']],
          'to have items satisfying',
          function(arr) {
            expect(arr, 'to have items satisfying', function(item) {
              expect(item, 'to be a number');
            });
          }
        );
      },
      'to throw',
      'expected array to have items satisfying\n' +
        'function (arr) {\n' +
        "  expect(arr, 'to have items satisfying', function(item) {\n" +
        "    expect(item, 'to be a number');\n" +
        '  });\n' +
        '}\n' +
        '\n' +
        '[\n' +
        '  [ 0, 1, 2 ],\n' +
        '  [\n' +
        '    4,\n' +
        "    '5', // should be a number\n" +
        '    6\n' +
        '  ],\n' +
        '  [\n' +
        '    7,\n' +
        '    8,\n' +
        "    '9' // should be a number\n" +
        '  ]\n' +
        ']'
    );
  });

  describe('delegating to an async assertion', function() {
    var clonedExpect = expect
      .clone()
      .addAssertion('to be a number after a short delay', function(
        expect,
        subject,
        delay
      ) {
        expect.errorMode = 'nested';

        return expect.promise(function(run) {
          setTimeout(
            run(function() {
              expect(subject, 'to be a number');
            }),
            1
          );
        });
      });

    it('should succeed', function() {
      return clonedExpect(
        [1, 2, 3],
        'to have items satisfying',
        'to be a number after a short delay'
      );
    });

    it('should fail with a diff', function() {
      return expect(
        clonedExpect(
          [0, false, 'abc'],
          'to have items satisfying',
          'to be a number after a short delay'
        ),
        'to be rejected with',
        "expected [ 0, false, 'abc' ]\n" +
          'to have items satisfying to be a number after a short delay\n' +
          '\n' +
          '[\n' +
          '  0,\n' +
          '  false, // should be a number after a short delay\n' +
          '         //   should be a number\n' +
          "  'abc' // should be a number after a short delay\n" +
          '        //   should be a number\n' +
          ']'
      );
    });
  });

  describe('with the exhaustively flag', function() {
    it('should succeed', function() {
      expect(
        [{ foo: 'bar', quux: 'baz' }],
        'to have items exhaustively satisfying',
        { foo: 'bar', quux: 'baz' }
      );
    });

    it('should fail when the spec is not met only because of the "exhaustively" semantics', function() {
      expect(
        function() {
          expect(
            [{ foo: 'bar', quux: 'baz' }],
            'to have items exhaustively satisfying',
            { foo: 'bar' }
          );
        },
        'to throw',
        "expected [ { foo: 'bar', quux: 'baz' } ]\n" +
          "to have items exhaustively satisfying { foo: 'bar' }\n" +
          '\n' +
          '[\n' +
          '  {\n' +
          "    foo: 'bar',\n" +
          "    quux: 'baz' // should be removed\n" +
          '  }\n' +
          ']'
      );
    });
  });

  // Regression test for #285
  it('should not render a "not to match" diff inline', function() {
    expect(
      function() {
        expect([']1V3ZRFOmgiE*'], 'to have items satisfying', function(item) {
          expect(item, 'not to match', /[!@#$%^&*()_+]/);
        });
      },
      'to throw',
      "expected [ ']1V3ZRFOmgiE*' ] to have items satisfying\n" +
        'function (item) {\n' +
        "  expect(item, 'not to match', /[!@#$%^&*()_+]/);\n" +
        '}\n' +
        '\n' +
        '[\n' +
        "  ']1V3ZRFOmgiE*' // should not match /[!@#$%^&*()_+]/\n" +
        '                  //\n' +
        '                  // ]1V3ZRFOmgiE*\n' +
        '                  //             ^\n' +
        ']'
    );
  });
});
