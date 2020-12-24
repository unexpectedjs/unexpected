/* global unexpected */

describe('expect.output.preferredWidth', () => {
  let expect = unexpected.clone();
  beforeEach(() => {
    expect = expect.clone();
    expect.output.preferredWidth = 9999;
  });

  describe('and a clone', () => {
    let clonedExpect;
    beforeEach(() => {
      clonedExpect = expect.clone();
    });

    it('should propagate into the clone', () => {
      expect(clonedExpect.output.preferredWidth).toBe(9999);
    });

    describe('when the value is changed in the clone', () => {
      beforeEach(() => {
        clonedExpect.output.preferredWidth = 7777;
      });

      it('should not affect the original', () => {
        expect(expect.output.preferredWidth).toBe(9999);
      });
    });

    describe('when the value is changed in the original after the clone was made', () => {
      beforeEach(() => {
        expect.output.preferredWidth = 5555;
      });

      it('should not affect the clone', () => {
        expect(clonedExpect.output.preferredWidth).toBe(9999);
      });
    });
  });

  describe('and a child', () => {
    let childExpect;
    beforeEach(() => {
      childExpect = expect.child();
    });

    it('should propagate into the child', () => {
      expect(childExpect.output.preferredWidth).toBe(9999);
    });

    describe('when the value is changed in the child', () => {
      beforeEach(() => {
        childExpect.output.preferredWidth = 7777;
      });

      it('should not affect the original', () => {
        expect(expect.output.preferredWidth).toBe(9999);
      });

      describe('and then in the parent', () => {
        beforeEach(() => {
          expect.output.preferredWidth = 4444;
        });

        it('should not affect the child', () => {
          expect(childExpect.output.preferredWidth).toBe(7777);
        });
      });
    });

    describe('when the value is changed in the original after the child was made', () => {
      beforeEach(() => {
        expect.output.preferredWidth = 5555;
      });

      it('should propagate the change to the child', () => {
        expect(childExpect.output.preferredWidth).toBe(5555);
      });
    });
  });
});
