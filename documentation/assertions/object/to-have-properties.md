Assert presence of properties in an object.

```js
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to have properties', ['a', 'b']);
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to have properties', {
  a: 'a',
  b: { c: 'c' },
});
expect(['a', { c: 'c' }, 'd'], 'to have properties', {
  1: { c: 'c' },
  2: 'd',
});
```

When validating the object against an array of properties, the `only` flag can
be used to assert that only the specified properties are present:

```js
expect({ foo: 123, bar: 456 }, 'to only have properties', ['foo']);
```

```output
expected { foo: 123, bar: 456 } to only have properties [ 'foo' ]

{
  foo: 123,
  bar: 456 // should be removed
}
```

Using the `own` flag, you can assert presence of an own properties.

```js
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to have own properties', ['a', 'b']);
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to have own properties', {
  a: 'a',
  b: { c: 'c' },
});
```

In case of a failing expectation you get the following output:

```js
expect({ a: 'f00', b: 'bar' }, 'to have own properties', {
  a: 'foo',
  c: 'baz',
});
```

```output
expected { a: 'f00', b: 'bar' } to have own properties { a: 'foo', c: 'baz' }

{
  a: 'f00', // should equal 'foo'
            //
            // -f00
            // +foo
  b: 'bar'
  // missing c: 'baz'
}
```

This assertion can be negated using the `not` flag:

```js
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'not to have properties', ['k', 'l']);
expect(Object.create({ a: 'a', b: 'b' }), 'not to have own properties', [
  'a',
  'b',
]);
```

In case of a failing expectation you get the following output:

```js
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'not to have properties', ['b', 'd']);
```

```output
expected { a: 'a', b: { c: 'c' }, d: 'd' } not to have properties [ 'b', 'd' ]
```
