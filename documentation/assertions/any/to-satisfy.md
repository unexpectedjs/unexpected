Asserts that a value match a given specification.

All properties and nested objects mentioned in the right-hand side object are
required to be present. Primitive values are compared with `to equal` semantics:

```javascript
expect({ hey: { there: true } }, 'to satisfy', { hey: {} });
```

To disallow additional properties in the subject, use `to exhaustively satisfy`:

```javascript
expect({ hey: { there: true } }, 'to exhaustively satisfy', { hey: { there: true } });
```

Regular expressions and functions in the right-hand side object will be run
against the corresponding values in the subject:

```javascript
expect({ bar: 'quux', baz: true }, 'to satisfy', { bar: /QU*X/i });
```

Can be combined with `expect.it` or functions to create complex
specifications that delegate to existing assertions:

```javascript
expect({foo: 123, bar: 'bar', baz: 'bogus', qux: 42, quux: 'wat'}, 'to satisfy', {
    foo: expect.it('to be a number').and('to be greater than', 10),
    baz: expect.it('not to match', /^boh/),
    qux: expect.it('to be a string')
                  .and('not to be empty')
               .or('to be a number')
                  .and('to be positive'),
    quux: function (value) {
      expect(value, 'to be a string');
    }
});
```

In case of a failing expectation you get the following output:

```javascript
expect({foo: 9, bar: 'bar', baz: 'bogus', qux: 42, quux: 'wat'}, 'to satisfy', {
    foo: expect.it('to be a number').and('to be greater than', 10),
    baz: expect.it('not to match', /^bog/),
    qux: expect.it('to be a string')
                  .and('not to be empty')
               .or('to be a number')
                  .and('to be positive'),
    quux: function (value) {
      expect(value, 'to be a number');
    }
});
```

```output
expected { foo: 9, bar: 'bar', baz: 'bogus', qux: 42, quux: 'wat' } to satisfy
{
  foo: expect.it('to be a number')
               .and('to be greater than', 10),
  baz: expect.it('not to match', /^bog/),
  qux: expect.it('to be a string')
               .and('not to be empty')
             .or('to be a number')
               .and('to be positive'),
  quux: function (value) {
    expect(value, 'to be a number');
  }
}

{
  foo: 9, // ✓ expected 9 to be a number and
          // ⨯ expected 9 to be greater than 10
  bar: 'bar',
  baz: 'bogus', // expected 'bogus' not to match /^bog/
                //
                // bogus
  qux: 42,
  quux: 'wat' // expected 'wat' to be a number
}
```
