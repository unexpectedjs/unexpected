Asserts that the value is defined.

<!-- evaluate -->
```javascript
expect('Hello world!', 'to be defined');
expect({ foo: { bar: 'baz' } }, 'to be defined');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(undefined, 'to be defined');
```

```
expected undefined to be defined
```
<!-- /evaluate -->

Alias for [not to be undefined](/assertions/any/not-to-be-undefined).
