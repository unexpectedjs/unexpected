/* global expect */
describe('exportAssertion', () => {
  var parentExpect;
  var childExpect;
  beforeEach(() => {
    parentExpect = expect.clone();
    childExpect = parentExpect.child();
  });

  it('is chainable', () => {
    childExpect
      .exportAssertion('<any> foo', function() {})
      .exportAssertion('<any> bar', function() {});

    expect(parentExpect.assertions, 'to have keys', 'foo', 'bar');
  });

  it('makes the assertion available to the parent expect', () => {
    childExpect.exportAssertion('<string> to foo', function(expect, subject) {
      expect(subject, 'to equal', 'foo');
    });

    parentExpect('foo', 'to foo');
  });

  it('does not make the assertion available to a parent parent expect', () => {
    childExpect
      .child()
      .exportAssertion('<string> to foo', function(expect, subject) {
        expect(subject, 'to equal', 'foo');
      });
    expect(
      function() {
        parentExpect('foo', 'to foo');
      },
      'to throw',
      /^Unknown assertion 'to foo'/
    );
  });

  it('binds the assertion to the child expect so custom types are available', () => {
    childExpect.addType({
      name: 'yadda',
      identify(obj) {
        return /^yadda/.test(obj);
      },
      inspect(value, depth, output, inspect) {
        output
          .text('>>')
          .text(value)
          .text('<<');
      }
    });
    childExpect.addAssertion('<yadda> to foo', function(expect, subject) {
      expect(subject, 'to contain', 'foo');
    });
    childExpect.exportAssertion('<string> to be silly', function(
      expect,
      subject
    ) {
      expect(subject, 'to foo');
    });
    parentExpect('yaddafoo', 'to be silly');

    expect(
      function() {
        parentExpect('yaddafo', 'to be silly');
      },
      'to throw',
      'expected >>yaddafo<< to be silly\n' + '\n' + 'yaddafo\n' + '     ^^'
    );
  });

  it('picks up type definitions from the parent expect when setting expect.subjectType and expect.argTypes', () => {
    childExpect.exportAssertion('<any> to foo <any>', function(
      expect,
      subject,
      value
    ) {
      expect(expect.subjectType.name, 'to equal', 'number');
      expect(expect.argTypes, 'to satisfy', [{ name: 'string' }]);
    });

    parentExpect(123, 'to foo', 'bar');
  });

  it('should make custom styles available to the output generation code called by expect.fail', () => {
    childExpect.addStyle('fancyQuotes', function(text) {
      this.text('>>')
        .text(text)
        .text('<<');
    });
    childExpect.exportAssertion('<any> to foo', function(expect, subject) {
      if (subject !== 'foo') {
        expect.fail({
          diff(output, diff, inspect, equal) {
            return output
              .text('got ')
              .fancyQuotes(subject)
              .text(' but expected ')
              .fancyQuotes('foo')
              .text(' and once again ')
              .append(inspect(subject))
              .text(' the difference being')
              .nl()
              .append(diff(subject, 'foo'))
              .nl()
              .text(
                `and they really are different, see: ${equal(subject, 'foo')}`
              );
          }
        });
      }
    });

    expect(
      function() {
        parentExpect('bar', 'to foo');
      },
      'to error',
      "expected 'bar' to foo\n" +
        '\n' +
        "got >>bar<< but expected >>foo<< and once again 'bar' the difference being\n" +
        '-bar\n' +
        '+foo\n' +
        'and they really are different, see: false'
    );
  });

  it('should make custom styles available when a parent expect appends an error associated with a child expect', () => {
    childExpect.addStyle('fancyQuotes', function(text) {
      this.text('>>')
        .text(text)
        .text('<<');
    });
    childExpect.exportAssertion('<any> to foo', function(expect, subject) {
      if (subject !== 'foo') {
        expect.fail({
          diff(output, diff, inspect, equal) {
            return output
              .text('got ')
              .fancyQuotes(subject)
              .text(' but expected ')
              .fancyQuotes('foo');
          }
        });
      }
    });

    expect(
      function() {
        expect(
          function() {
            parentExpect('bar', 'to foo');
          },
          'to error',
          "expected 'barf' to foo\n" + '\n' + 'got >>bar<< but expected >>foo<<'
        );
      },
      'to error',
      "expected function () { parentExpect('bar', 'to foo'); }\n" +
        "to error 'expected \\'barf\\' to foo\\n\\ngot >>bar<< but expected >>foo<<'\n" +
        '  expected\n' +
        '  UnexpectedError(\n' +
        "    expected 'bar' to foo\n" +
        '\n' +
        '    got >>bar<< but expected >>foo<<\n' +
        '  )\n' +
        "  to have message 'expected \\'barf\\' to foo\\n\\ngot >>bar<< but expected >>foo<<'\n" +
        "    expected 'expected \\'bar\\' to foo\\n\\ngot >>bar<< but expected >>foo<<'\n" +
        "    to equal 'expected \\'barf\\' to foo\\n\\ngot >>bar<< but expected >>foo<<'\n" +
        '\n' +
        "    -expected 'bar' to foo\n" +
        "    +expected 'barf' to foo\n" +
        '     got >>bar<< but expected >>foo<<'
    );
  });

  describe('when shifting from an exported middle-of-the-rocket assertion in an inherited expect to an assertion defined in the parent expect', () => {
    beforeEach(() => {
      childExpect.exportAssertion(
        '<string> when prepended with foo <assertion?>',
        function(expect, subject) {
          return expect.shift(`foo${subject}`);
        }
      );

      parentExpect.addAssertion('<string> to foo', function(expect, subject) {
        expect(subject, 'to equal', 'foo');
      });
    });

    it('should succeed', () => {
      parentExpect('', 'when prepended with foo', 'to foo');
    });

    it('should fail with a diff', () => {
      expect(
        function() {
          parentExpect('bar', 'when prepended with foo', 'to foo');
        },
        'to throw',
        "expected 'bar' when prepended with foo to foo\n" +
          '\n' +
          '-foobar\n' +
          '+foo'
      );
    });
  });

  describe('when shifting from an exported middle-of-the-rocket assertion in an inherited expect to an assertion exported from another inherit', () => {
    beforeEach(() => {
      childExpect.exportAssertion(
        '<string> when prepended with foo <assertion?>',
        function(expect, subject) {
          return expect.shift(`foo${subject}`);
        }
      );

      parentExpect
        .child()
        .exportAssertion('<string> to foo', function(expect, subject) {
          expect(subject, 'to equal', 'foo');
        });
    });

    it('should succeed', () => {
      parentExpect('', 'when prepended with foo', 'to foo');
    });

    it('should fail with a diff', () => {
      expect(
        function() {
          parentExpect('bar', 'when prepended with foo', 'to foo');
        },
        'to throw',
        "expected 'bar' when prepended with foo to foo\n" +
          '\n' +
          '-foobar\n' +
          '+foo'
      );
    });
  });

  describe('when delegating to an exported assertion from the parent', () => {
    beforeEach(() => {
      childExpect.exportAssertion(
        '<string> when prepended with foo <assertion?>',
        function(expect, subject) {
          return expect.shift(`foo${subject}`);
        }
      );

      childExpect.exportAssertion(
        '<string> when trimmed <assertion?>',
        function(expect, subject) {
          return expect.shift(subject.trim());
        }
      );

      parentExpect
        .child()
        .exportAssertion('<string> to foo', function(expect, subject) {
          expect(subject, 'to equal', 'foo');
        });
    });

    it('should succeed', () => {
      parentExpect('', 'when prepended with foo when trimmed', 'to foo');
    });

    it('should fail with a diff', () => {
      expect(
        function() {
          parentExpect(
            'bar',
            'when prepended with foo when prepended with foo',
            'to foo'
          );
        },
        'to throw',
        "expected 'bar' when prepended with foo when prepended with foo to foo\n" +
          '\n' +
          '-foofoobar\n' +
          '+foo'
      );
    });
  });
});
