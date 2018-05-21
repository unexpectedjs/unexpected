/*global expect*/
describe('freeze', function() {
  it('is chainable', function() {
    const clonedExpect = expect.clone();

    clonedExpect.freeze()('foo', 'to equal', 'foo');
  });

  // Debatable? Seems nice for forwards compatibility if we freeze
  // the default instance in Unexpected 11.
  it('does not throw if the instance is already frozen', function() {
    expect
      .clone()
      .freeze()
      .freeze();
  });

  it('makes .use(...) throw', function() {
    expect(
      function() {
        expect
          .clone()
          .freeze()
          .use(function() {});
      },
      'to throw',
      'Cannot install a plugin into a frozen instance, please run .clone() first'
    );
  });

  it('should allow cloning, and the clone should not be frozen', function() {
    expect
      .clone()
      .freeze()
      .clone()
      .use(function() {});
  });

  it('makes .addAssertion(...) throw', function() {
    expect(
      function() {
        expect
          .clone()
          .freeze()
          .addAssertion('<string> to foo', function(expect, subject) {
            expect(subject, 'to equal', 'foo');
          });
      },
      'to throw',
      'Cannot add an assertion to a frozen instance, please run .clone() first'
    );
  });

  it('makes .addType(...) throw', function() {
    expect(
      function() {
        expect
          .clone()
          .freeze()
          .addType({ name: 'foo', identify: false });
      },
      'to throw',
      'Cannot add a type to a frozen instance, please run .clone() first'
    );
  });

  it('makes .addStyle(...) throw', function() {
    expect(
      function() {
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

  it('makes .installTheme(...) throw', function() {
    expect(
      function() {
        expect
          .clone()
          .freeze()
          .installTheme('html', { comment: 'gray' });
      },
      'to throw',
      'Cannot install a theme into a frozen instance, please run .clone() first'
    );
  });

  describe('with .child()', function() {
    it('does not throw', function() {
      expect
        .clone()
        .freeze()
        .child();
    });

    it('allows addAssertion', function() {
      expect
        .clone()
        .freeze()
        .child()
        .addAssertion('<string> to foo', function(expect, subject) {
          expect(subject, 'to equal', 'foo');
        });
    });

    it('throws on exportAssertion', function() {
      expect(
        function() {
          expect
            .clone()
            .freeze()
            .child()
            .exportAssertion('<string> to foo', function(expect, subject) {
              expect(subject, 'to equal', 'foo');
            });
        },
        'to throw',
        'Cannot add an assertion to a frozen instance, please run .clone() first'
      );
    });

    it('throws on exportType', function() {
      expect(
        function() {
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

    it('allows .addStyle(...)', function() {
      expect
        .clone()
        .freeze()
        .child()
        .addStyle('smiley', function() {
          this.red('\u263a');
        });
    });

    it('throws on exportStyle', function() {
      expect(
        function() {
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
