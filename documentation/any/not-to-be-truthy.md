Alias for [to be falsy](/assertions/any/to-be-falsy).

Asserts that the value is _falsy_.

<!-- evaluate -->
```javascript
expect(0, 'not to be truthy');
expect(false, 'not to be truthy');
expect('', 'not to be truthy');
expect(undefined, 'not to be truthy');
expect(null, 'not to be truthy');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({}, 'not to be truthy');
```

```
expected {} not to be truthy
```
<!-- /evaluate -->
