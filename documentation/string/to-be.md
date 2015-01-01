Asserts `===` equality.

<!-- evaluate -->
```javascript
expect('Hello', 'to be', 'Hello');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello beautiful!', 'to be', 'Hello world!');
```

```
expected 'Hello' to be 'Hello world!'

-Hello
+Hello world!
```
<!-- /evaluate -->
