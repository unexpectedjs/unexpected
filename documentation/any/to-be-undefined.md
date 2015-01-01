Asserts that the value is `undefined`.

<!-- evaluate -->
```javascript
expect(undefined, 'to be undefined');
```
<!-- /evaluate -->

We will get the following error if we make an incorrect assumption:

<!-- evaluate -->
```javascript
expect('Hello world', 'to be undefined');
```

```
expected 'Hello world' to be undefined

-string
+undefined
```
<!-- /evaluate -->
