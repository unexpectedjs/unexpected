Asserts that the value is not the undefined value.

<!-- evaluate -->
```javascript
expect('Hello world!', 'not to be undefined');
expect({ foo: { bar: 'baz' } }, 'not to be undefined');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(undefined, 'not to be undefined');
```

```
expected undefined not to be undefined
```
<!-- /evaluate -->
