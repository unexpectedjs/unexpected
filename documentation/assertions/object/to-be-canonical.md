Asserts that an object has its properties defined in sorted order at
all levels.

<!-- evaluate -->
```javascript
expect({ a: 123, b: 456 }, 'to be canonical');
expect([456, { a: 123 }], 'to be canonical');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect([456, { b: 456, a: 123 }], 'to be canonical');
```

```
expected [ 456, { b: 456, a: 123 } ] to be canonical
```
<!-- /evaluate -->
