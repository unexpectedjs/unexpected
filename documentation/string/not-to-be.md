Asserts `!==` equality.

<!-- evaluate -->
```javascript
expect('Hello', 'not to be', 'Hello world!');
expect('1', 'not to be', 1);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello world!', 'not to be', 'Hello world!');
```

```
expected 'Hello world!' not to be 'Hello world!'
```
<!-- /evaluate -->
