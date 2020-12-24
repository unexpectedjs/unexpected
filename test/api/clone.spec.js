/* global expect */
describe('clone', () => {
  let clonedExpect;
  beforeEach(() => {
    clonedExpect = expect.clone();
    clonedExpect.addAssertion(
      '<any> [not] to be the answer to the Ultimate Question of Life, the Universe, and Everything',
      function (expect, subject) {
        expect(subject, '[not] to equal', 42);
      }
    );
  });

  it('changes to the clone does not affect the original instance', () => {
    expect(expect.assertions).notToHaveKeys(
      'to be the answer to the Ultimate Question of Life, the Universe, and Everything',
      'not to be the answer to the Ultimate Question of Life, the Universe, and Everything'
    );
  });

  it('assertions can be added to the clone', () => {
    clonedExpect(
      42,
      'to be the answer to the Ultimate Question of Life, the Universe, and Everything'
    );
    clonedExpect(
      41,
      'not to be the answer to the Ultimate Question of Life, the Universe, and Everything'
    );

    expect(function () {
      clonedExpect(
        41,
        'to be the answer to the Ultimate Question of Life, the Universe, and Everything'
      );
    }).toThrow();
  });

  describe('when the assertion does not exist', () => {
    it('it suggests a similarly named assertion', () => {
      expect(function () {
        clonedExpect(null, 'to bee', null);
      }).toThrow("Unknown assertion 'to bee', did you mean: 'to be'");

      expect(function () {
        clonedExpect(
          1,
          'to be the answer to the ultimate question of life, the universe, and everything'
        );
      }).toThrow(
        "Unknown assertion 'to be the answer to the ultimate question of life, the universe, and everything', did you mean: 'to be the answer to the Ultimate Question of Life, the Universe, and Everything'"
      );
    });

    describe('but exists for another type', () => {
      it('explains that in the error message', () => {
        clonedExpect.addAssertion(
          '<array> to foobarquux',
          function (expect, subject) {
            expect(subject).toEqual(['foobarquux']);
          }
        );
        clonedExpect(['foobarquux'], 'to foobarquux');
        expect(function () {
          clonedExpect('foobarquux', 'to foobarquux');
        }).toThrow(
          "expected 'foobarquux' to foobarquux\n" +
            '  The assertion does not have a matching signature for:\n' +
            '    <string> to foobarquux\n' +
            '  did you mean:\n' +
            '    <array> to foobarquux'
        );
      });

      it('prefers to suggest a similarly named assertion defined for the correct type over an exact match defined for other types', () => {
        clonedExpect
          .addAssertion('<array> to foo', function (expect, subject) {
            expect(subject).toEqual(['foo']);
          })
          .addAssertion('<string> to fooo', function (expect, subject) {
            expect(subject).toEqual('fooo');
          });
        expect(function () {
          clonedExpect(['fooo'], 'to fooo');
        }).toThrow(
          "expected [ 'fooo' ] to fooo\n" +
            '  The assertion does not have a matching signature for:\n' +
            '    <array> to fooo\n' +
            '  did you mean:\n' +
            '    <string> to fooo'
        );

        clonedExpect.addAssertion('<null> to fooo', function (expect, subject) {
          expect(subject.message).toEqual('fooo');
        });
        expect(function () {
          clonedExpect(['fooo'], 'to fooo');
        }).toThrow(
          "expected [ 'fooo' ] to fooo\n" +
            '  The assertion does not have a matching signature for:\n' +
            '    <array> to fooo\n' +
            '  did you mean:\n' +
            '    <null> to fooo\n' +
            '    <string> to fooo'
        );
      });

      it('prefers to suggest a similarly named assertion for a more specific type', () => {
        clonedExpect
          .addType({
            name: 'myType',
            base: 'string',
            identify(obj) {
              return /^a/.test(obj);
            },
          })
          .addType({
            name: 'myMoreSpecificType',
            base: 'myType',
            identify(obj) {
              return /^aa/.test(obj);
            },
          })
          .addType({
            name: 'myMostSpecificType',
            base: 'myMoreSpecificType',
            identify(obj) {
              return /^aaa/.test(obj);
            },
          })
          .addAssertion('<myType> to fooa', function () {})
          .addAssertion('<myMoreSpecificType> to foob', function () {})
          .addAssertion('<myMostSpecificType> to fooc', function () {});

        expect(function () {
          clonedExpect('a', 'to fooo');
        }).toThrow("Unknown assertion 'to fooo', did you mean: 'to fooa'");

        expect(function () {
          clonedExpect('aa', 'to fooo');
        }).toThrow("Unknown assertion 'to fooo', did you mean: 'to foob'");

        expect(function () {
          clonedExpect('aaa', 'to fooo');
        }).toThrow("Unknown assertion 'to fooo', did you mean: 'to fooc'");

        expect(function () {
          clonedExpect('aaa', 'to fooaq');
        }).toThrow("Unknown assertion 'to fooaq', did you mean: 'to fooc'");
      });
    });
  });

  describe('toString on a cloned expect', () => {
    it('returns a string containing all the expanded assertions', () => {
      expect(clonedExpect.toString()).toContain().toBe();
      expect(clonedExpect.toString(), 'to contain', '[not] to be');
      expect(clonedExpect.toString()).toContain(
        'to be the answer to the Ultimate Question of Life, the Universe, and Everything'
      );
      expect(clonedExpect.toString()).toContain(
        '[not] to be the answer to the Ultimate Question of Life, the Universe, and Everything'
      );
    });
  });
});
