Assert presence of properties in an object.

<!-- evaluate -->
```javascript
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to have properties', ['a', 'b']);
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to have properties', {
    a: 'a',
    b: { c: 'c' }
});
expect([ 'a', { c: 'c' }, 'd' ], 'to have properties', {
    1: { c: 'c' },
    2: 'd'
});
```
<!-- /evaluate -->

Using the `own` flag, you can assert presence of an own properties.

<!-- evaluate -->
```javascript
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to have own properties', ['a', 'b']);
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to have own properties', {
    a: 'a',
    b: { c: 'c' }
});
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({ a: 'f00', b: 'bar' }, 'to have own properties', {
  a: 'foo',
  c: 'baz'
});
```

```
expected { a: 'f00', b: 'bar' } to have own properties { a: 'foo', c: 'baz' }

{
  a: 'f00', // should be 'foo'
            // -f00
            // +foo
  b: 'bar',
  c: undefined // should be 'baz'
}
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'not to have properties', ['k', 'l']);
expect(Object.create({ a: 'a', b: 'b' }), 'not to have own properties', ['a', 'b']);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'not to have properties', ['b', 'd']);
```

```
expected { a: 'a', b: { c: 'c' }, d: 'd' } not to have properties [ 'b', 'd' ]
```
<!-- /evaluate -->
