Asserts that the string does not have the specified length.

<!-- evaluate -->
```javascript
expect('Hello world', 'not to have length', 12);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello world', 'not to have length', 11);
```

```
expected 'Hello world' not to have length 11
```
<!-- /evaluate -->
