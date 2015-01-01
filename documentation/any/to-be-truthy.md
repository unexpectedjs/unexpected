Asserts that the value is _truthy_.

<!-- evaluate -->
```javascript
expect(1, 'to be truthy');
expect(true, 'to be truthy');
expect({}, 'to be truthy');
expect("foo", 'to be truthy');
expect(/foo/, 'to be truthy');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('', 'to be truthy');
```

```
expected '' to be truthy
```
<!-- /evaluate -->
