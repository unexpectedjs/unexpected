Asserts that a value match a given specification.

All properties and nested objects mentioned in the right-hand side object are
required to be present. Primitive values are compared with `to equal` semantics:

<!-- evaluate -->
```javascript
expect({ hey: { there: true } }, 'to satisfy', { hey: {} });
```
<!-- /evaluate -->

To disallow additional properties in the subject, use `to exhaustively satisfy`:

<!-- evaluate -->
```javascript
expect({ hey: { there: true } }, 'to exhaustively satisfy', { hey: { there: true } });
```
<!-- /evaluate -->

Regular expressions and functions in the right-hand side object will be run
against the corresponding values in the subject:

<!-- evaluate -->
```javascript
expect({ bar: 'quux', baz: true }, 'to satisfy', { bar: /QU*X/i });
```
<!-- /evaluate -->

Can be combined with `expect.it` to create complex specifications that delegate to
existing assertions:

<!-- evaluate -->
```javascript
expect({foo: 123, bar: 'bar', baz: 'bogus', qux: 42}, 'to satisfy', {
    foo: expect.it('to be a number').and('to be greater than', 10),
    baz: expect.it('not to match', /^boh/),
    qux: expect.it('to be a string')
                  .and('not to be empty')
               .or('to be a number')
                  .and('to be positive')
});
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({foo: 9, bar: 'bar', baz: 'bogus', qux: 42}, 'to satisfy', {
    foo: expect.it('to be a number').and('to be greater than', 10),
    baz: expect.it('not to match', /^bog/),
    qux: expect.it('to be a string')
                  .and('not to be empty')
               .or('to be a number')
                  .and('to be positive')
});
```

```
expected { foo: 9, bar: 'bar', baz: 'bogus', qux: 42 } to satisfy
{
  foo: expect.it('to be a number')
               .and('to be greater than', 10),
  baz: expect.it('not to match', /^bog/),
  qux: expect.it('to be a string')
               .and('not to be empty')
             .or('to be a number')
               .and('to be positive')
}

{
  foo: 9, // ✓ expected 9 to be a number and
          // ⨯ expected 9 to be greater than 10
  bar: 'bar',
  baz: 'bogus', // expected 'bogus' not to match /^bog/
                // 
                // bogus
  qux: 42
}
```
<!-- /evaluate -->
