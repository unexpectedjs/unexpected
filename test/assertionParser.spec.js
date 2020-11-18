/* global unexpected */
describe('parseAssertion', () => {
  const expect = unexpected.clone();

  it('converts an assertion string to an object representation', () => {
    const assertion = expect.parseAssertion(
      '<string|function> [not] to be <string> <string*|object>'
    );
    expect(assertion, 'to satisfy', [
      {
        subject: { minimum: 1, maximum: 1, type: { name: 'string' } },
        assertion: '[not] to be',
        args: [
          { minimum: 1, maximum: 1, type: { name: 'string' } },
          { minimum: 0, maximum: Infinity, type: { name: 'string' } },
        ],
      },
      {
        subject: { minimum: 1, maximum: 1, type: { name: 'string' } },
        assertion: '[not] to be',
        args: [
          { minimum: 1, maximum: 1, type: { name: 'string' } },
          { minimum: 1, maximum: 1, type: { name: 'object' } },
        ],
      },
      {
        subject: { minimum: 1, maximum: 1, type: { name: 'function' } },
        assertion: '[not] to be',
        args: [
          { minimum: 1, maximum: 1, type: { name: 'string' } },
          { minimum: 0, maximum: Infinity, type: { name: 'string' } },
        ],
      },
      {
        subject: { minimum: 1, maximum: 1, type: { name: 'function' } },
        assertion: '[not] to be',
        args: [
          { minimum: 1, maximum: 1, type: { name: 'string' } },
          { minimum: 1, maximum: 1, type: { name: 'object' } },
        ],
      },
    ]);
  });

  it('accepts assertions without alternations', () => {
    const assertion = expect.parseAssertion(
      '<any> [not] to [exhaustively] satisfy [assertion] <any*>'
    );
    expect(assertion, 'to satisfy', [
      {
        subject: { minimum: 1, maximum: 1, type: { name: 'any' } },
        assertion: '[not] to [exhaustively] satisfy [assertion]',
        args: [{ minimum: 0, maximum: Infinity, type: { name: 'any' } }],
      },
    ]);
  });

  it('accepts assertions with alternations on the subject', () => {
    const assertion = expect.parseAssertion(
      '<string|array-like> [not] to be empty <any*>'
    );
    expect(assertion, 'to satisfy', [
      {
        subject: { minimum: 1, maximum: 1, type: { name: 'string' } },
        assertion: '[not] to be empty',
        args: [{ minimum: 0, maximum: Infinity, type: { name: 'any' } }],
      },
      {
        subject: { minimum: 1, maximum: 1, type: { name: 'array-like' } },
        assertion: '[not] to be empty',
        args: [{ minimum: 0, maximum: Infinity, type: { name: 'any' } }],
      },
    ]);
  });

  describe('when the legacy typeless assertion syntax is used', () => {
    // Poor man's sinon.stub:
    const originalConsoleWarn = console.warn;
    const consoleWarnCalls = [];
    beforeEach(function () {
      console.warn = (...args) => consoleWarnCalls.push(args);
    });
    afterEach(function () {
      console.warn = originalConsoleWarn;
    });

    it('assumes <any> ... <any+>', () => {
      const assertion = expect.parseAssertion('[not] to be');
      expect(assertion, 'to satisfy', [
        {
          subject: { type: { name: 'any' }, minimum: 1, maximum: 1 },
          assertion: '[not] to be',
          args: [{ type: { name: 'any' }, minimum: 0, maximum: Infinity }],
        },
      ]);
    });

    it('outputs a warning the first time', () => {
      expect.parseAssertion('[not] to be');
      expect(consoleWarnCalls, 'to satisfy', [
        [
          'The typeless expect.addAssertion syntax is deprecated and will be removed in a future update\n' +
            'Please refer to http://unexpected.js.org/api/addAssertion/',
        ],
      ]);

      expect.parseAssertion('[not] to be');
      expect(consoleWarnCalls, 'to have length', 1);
    });
  });

  it('accepts assertions with no arguments', () => {
    const assertion = expect.parseAssertion('<any> [not] to be truthy');
    expect(assertion, 'to satisfy', [
      {
        subject: { type: { name: 'any' }, minimum: 1, maximum: 1 },
        assertion: '[not] to be truthy',
        args: [],
      },
    ]);
  });

  it('throws a type cannot be detected', () => {
    expect(
      function () {
        expect.parseAssertion(
          '<string|function> [not] to be <string> <foo*|object>'
        );
      },
      'to throw',
      'Unknown type: foo in <string|function> [not] to be <string> <foo*|object>'
    );
  });

  it('throws if the subject type is not specified', () => {
    expect(
      function () {
        expect.parseAssertion('[not] to be <string> <string*|object>');
      },
      'to throw',
      'Missing subject type in [not] to be <string> <string*|object>'
    );
  });

  it('throws if the assertion cannot be detected', () => {
    expect(
      function () {
        expect.parseAssertion('<string> <string*|object>');
      },
      'to throw',
      'Missing assertion in <string> <string*|object>'
    );
  });

  it('throws if varargs is used for the subject', () => {
    expect(
      function () {
        expect.parseAssertion('<any*> [not] to be <any*>');
      },
      'to throw',
      'The subject type cannot have varargs: <any*> [not] to be <any*>'
    );
  });

  it('throws if varargs is used before the last argument', () => {
    expect(
      function () {
        expect.parseAssertion('<any> [not] to be <any*> <string>');
      },
      'to throw',
      'Only the last argument type can have varargs: <any> [not] to be <any*> <string>'
    );
  });

  // Under consideration here: https://github.com/unexpectedjs/unexpected/issues/225
  it('throws if the argument list contains multiple assertion strings', () => {
    expect(
      function () {
        expect.parseAssertion(
          '<number> to be in range from <number> up to [and including] <number> '
        );
      },
      'to throw',
      'Only one assertion string is supported (see #225)'
    );
  });

  it('handles types with upper case characters', () => {
    const assertion = expect.parseAssertion('<number|NaN> [not] to be NaN');
    expect(assertion, 'to satisfy', [
      {
        subject: { type: { name: 'number' }, minimum: 1, maximum: 1 },
        assertion: '[not] to be NaN',
        args: [],
      },
      {
        subject: { type: { name: 'NaN' }, minimum: 1, maximum: 1 },
        assertion: '[not] to be NaN',
        args: [],
      },
    ]);
  });

  describe('with an assertion that has <assertion>', () => {
    it('should accept it as the last argument', () => {
      const assertion = expect.parseAssertion(
        '<Buffer> when decoded as <string> <assertion>'
      );
      expect(assertion, 'to satisfy', [
        {
          subject: { type: { name: 'Buffer' }, minimum: 1, maximum: 1 },
          assertion: 'when decoded as',
          args: [
            { type: { name: 'string' }, minimum: 1, maximum: 1 },
            { type: { name: 'assertion' }, minimum: 1, maximum: 1 },
            { type: { name: 'any' }, minimum: 0, maximum: Infinity },
          ],
        },
        {
          subject: { type: { name: 'Buffer' }, minimum: 1, maximum: 1 },
          assertion: 'when decoded as',
          args: [
            { type: { name: 'string' }, minimum: 1, maximum: 1 },
            { type: { name: 'expect.it' }, minimum: 1, maximum: 1 },
          ],
        },
      ]);
    });

    it('should not accept it as the subject type', () => {
      expect(
        function () {
          expect.parseAssertion('<assertion> to foo');
        },
        'to throw',
        'Only the last argument type can be <assertion>: <assertion> to foo'
      );
    });

    it('should not accept it as the non-last argument', () => {
      expect(
        function () {
          expect.parseAssertion(
            '<Buffer> when decoded as <assertion> <string>'
          );
        },
        'to throw',
        'Only the last argument type can be <assertion>: <Buffer> when decoded as <assertion> <string>'
      );
    });

    it('should not accept it with a varargs operator', () => {
      expect(
        function () {
          expect.parseAssertion(
            '<Buffer> when decoded as <string> <assertion+>'
          );
        },
        'to throw',
        '<assertion+> and <assertion*> are not allowed: <Buffer> when decoded as <string> <assertion+>'
      );
    });

    it('should not accept it alternated with other types', () => {
      expect(
        function () {
          expect.parseAssertion(
            '<Buffer> when decoded as <string> <assertion|any+>'
          );
        },
        'to throw',
        '<assertion> cannot be alternated with other types: <Buffer> when decoded as <string> <assertion|any+>'
      );
    });

    it('should not parse an assertion with invalid chars', () => {
      expect(
        function () {
          expect.parseAssertion('<Buffer> wh!!en foo<>');
        },
        'to throw',
        'Cannot parse token at index 19 in <Buffer> wh!!en foo<>'
      );
    });
  });
});
