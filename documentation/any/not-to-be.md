Asserts `!==` equality.

<!-- evaluate -->
```javascript
expect({}, 'not to be', {});
expect(1, 'not to be', true);
expect('1', 'not to be', 1);
expect(null, 'not to be', undefined);
expect(0, 'not to be', 'null');
expect(undefined, 'not to be', 'null');
expect(false, 'not to be', 'true');
expect(true, 'not to be', 'false');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(1, 'not to be', 1);
```

```
expected 1 not to be 1
```
<!-- /evaluate -->
