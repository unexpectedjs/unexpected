Asserts that the value is _truthy_.

<!-- evaluate -->
```javascript
expect(1, 'to be ok');
expect(true, 'to be ok');
expect({}, 'to be ok');
expect('foo', 'to be ok');
expect(/foo/, 'to be ok');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('', 'to be ok');
```

```
expected '' to be ok
```
<!-- /evaluate -->
