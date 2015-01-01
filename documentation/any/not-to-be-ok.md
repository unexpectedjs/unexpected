Alias for [to be falsy](/assertions/any/to-be-falsy).

Asserts that the value is _falsy_.

<!-- evaluate -->
```javascript
expect(0, 'not to be ok');
expect(false, 'not to be ok');
expect('', 'not to be ok');
expect(undefined, 'not to be ok');
expect(null, 'not to be ok');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({}, 'not to be ok');
```

```
expected {} not to be ok
```
<!-- /evaluate -->
