Asserts `===` equality.

<!-- evaluate -->
```javascript
var obj = {};
expect(obj, 'to be', obj);
expect(1, 'to be', 1);
expect(null, 'to be', null);
expect(undefined, 'to be', obj.foo);
expect(true, 'to be', !false);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('1', 'to be', 1);
```

```
expected '1' to be 1
```
<!-- /evaluate -->
