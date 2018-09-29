/*global expect*/
describe('freeze', () => {
  it('is chainable', () => {
    const clonedExpect = expect.clone();

    clonedExpect.freeze()('foo', 'to equal', 'foo');
  });

  // Debatable? Seems nice for forwards compatibility if we freeze
  // the default instance in Unexpected 11.
  it('does not throw if the instance is already frozen', () => {
    expect
      .clone()
      .freeze()
      .freeze();
  });

  it('makes .use(...) throw', () => {
    expect(
      () => {
        expect
          .clone()
          .freeze()
          .use(() => {});
      },
      'to throw',
      'Cannot install a plugin into a frozen instance, please run .clone() first'
    );
  });

  it('should allow cloning, and the clone should not be frozen', () => {
    expect
      .clone()
      .freeze()
      .clone()
      .use(() => {});
  });

  it('makes .addAssertion(...) throw', () => {
    expect(
      () => {
        expect
          .clone()
          .freeze()
          .addAssertion('<string> to foo', (expect, subject) => {
            expect(subject, 'to equal', 'foo');
          });
      },
      'to throw',
      'Cannot add an assertion to a frozen instance, please run .clone() first'
    );
  });

  it('makes .addType(...) throw', () => {
    expect(
      () => {
        expect
          .clone()
          .freeze()
          .addType({ name: 'foo', identify: false });
      },
      'to throw',
      'Cannot add a type to a frozen instance, please run .clone() first'
    );
  });

  it('makes .addStyle(...) throw', () => {
    expect(
      () => {
        expect
          .clone()
          .freeze()
          .addStyle('smiley', function() {
            this.red('\u263a');
          });
      },
      'to throw',
      'Cannot add a style to a frozen instance, please run .clone() first'
    );
  });

  it('makes .installTheme(...) throw', () => {
    expect(
      () => {
        expect
          .clone()
          .freeze()
          .installTheme('html', { comment: 'gray' });
      },
      'to throw',
      'Cannot install a theme into a frozen instance, please run .clone() first'
    );
  });

  describe('with .child()', () => {
    it('does not throw', () => {
      expect
        .clone()
        .freeze()
        .child();
    });

    it('allows addAssertion', () => {
      expect
        .clone()
        .freeze()
        .child()
        .addAssertion('<string> to foo', (expect, subject) => {
          expect(subject, 'to equal', 'foo');
        });
    });

    it('throws on exportAssertion', () => {
      expect(
        () => {
          expect
            .clone()
            .freeze()
            .child()
            .exportAssertion('<string> to foo', (expect, subject) => {
              expect(subject, 'to equal', 'foo');
            });
        },
        'to throw',
        'Cannot add an assertion to a frozen instance, please run .clone() first'
      );
    });

    it('throws on exportType', () => {
      expect(
        () => {
          expect
            .clone()
            .freeze()
            .child()
            .exportType({ name: 'foo', identify: false });
        },
        'to throw',
        'Cannot add a type to a frozen instance, please run .clone() first'
      );
    });

    it('allows .addStyle(...)', () => {
      expect
        .clone()
        .freeze()
        .child()
        .addStyle('smiley', function() {
          this.red('\u263a');
        });
    });

    it('throws on exportStyle', () => {
      expect(
        () => {
          expect
            .clone()
            .freeze()
            .child()
            .exportStyle('smiley', function() {
              this.red('\u263a');
            });
        },
        'to throw',
        'Cannot add a style to a frozen instance, please run .clone() first'
      );
    });
  });
});
