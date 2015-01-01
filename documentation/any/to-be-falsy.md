Asserts that the value is _falsy_.

<!-- evaluate -->
```javascript
expect(0, 'to be falsy');
expect(false, 'to be falsy');
expect('', 'to be falsy');
expect(undefined, 'to be falsy');
expect(null, 'to be falsy');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({}, 'to be falsy');
```

```
expected {} to be falsy
```
<!-- /evaluate -->
