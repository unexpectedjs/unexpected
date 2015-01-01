Alias for [to be truthy](/assertions/any/to-be-truthy).

Asserts that the value is _truthy_.

<!-- evaluate -->
```javascript
expect(1, 'not to be falsy');
expect(true, 'not to be falsy');
expect({}, 'not to be falsy');
expect('foo', 'not to be falsy');
expect(/foo/, 'not to be falsy');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('', 'not to be falsy');
```

```
expected '' not to be falsy
```
<!-- /evaluate -->
