Asserts that a value matches a given specification.

## object

All properties and nested objects mentioned in the right-hand side object are
required to be present. Primitive values are compared with `to equal` semantics:

```js
expect({ hey: { there: true } }, 'to satisfy', { hey: {} });
```

To disallow additional properties in the subject, use `to exhaustively satisfy`:

```js
expect({ hey: { there: true } }, 'to exhaustively satisfy', {
  hey: { there: true }
});
```

Regular expressions and `expect.it` expressions in the right-hand side object
will be run against the corresponding values in the subject:

```js
expect({ bar: 'quux', baz: true }, 'to satisfy', { bar: /QU*X/i });
```

## array-like

When satisfying against an array-like, length is always taken into account. The
effect is that the asasertion allows making statements via a specification of
each element that is expected to be in the array:

```js
expect([0, 1, 2], 'to satisfy', [0, 1]);
```

```output
expected [ 0, 1, 2 ] to satisfy [ 0, 1 ]

[
  0,
  1,
  2 // should be removed
]
```

In order to make statements about a subset of the available indices, an object
specification on the right hand side can mention specific indexes as keys which
are themselves compared using `to satisfy` semantics:

```js
expect(['foo', 'catch me', 'baz'], 'to satisfy', { 1: 'bar' });
```

```output
expected [ 'foo', 'catch me', 'baz' ] to satisfy { 1: 'bar' }

[
  'foo',
  'catch me', // should equal 'bar'
              //
              // -catch me
              // +bar
  'baz'
]
```

### arrays with non-numeric properties

In JavaScript, arrays are themselves objects which means they support properties
being attached. An object on the right-hand side can also be used to check the
values belonging to such keys:

```js
const arrayWithNonNumerics = ['foo', 'bar'];

arrayWithNonNumerics.someProperty = 'baz';

expect(arrayWithNonNumerics, 'to satisfy', { someProperty: 'baz' });
```

## Complex specifications

`to satisfy` specifications allow complex statements to be made about the values
corresponding to a specific key. When combined with `expect.it` these specifications
can delegate to other assertions:

```js
expect({ foo: 123, bar: 'bar', baz: 'bogus', qux: 42 }, 'to satisfy', {
  foo: expect.it('to be a number').and('to be greater than', 10),
  baz: expect.it('not to match', /^boh/),
  qux: expect
    .it('to be a string')
    .and('not to be empty')
    .or('to be a number')
    .and('to be positive')
});
```

In case of a failing expectation you get the following output:

```js
expect({ foo: 9, bar: 'bar', baz: 'bogus', qux: 42 }, 'to satisfy', {
  foo: expect.it('to be a number').and('to be greater than', 10),
  baz: expect.it('not to match', /^bog/),
  qux: expect
    .it('to be a string')
    .and('not to be empty')
    .or('to be a number')
    .and('to be positive')
});
```

```output
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
  foo: 9, // ✓ should be a number and
          // ⨯ should be greater than 10
  bar: 'bar',
  baz: 'bogus', // should not match /^bog/
                //
                // bogus
                // ^^^
  qux: 42
}
```
