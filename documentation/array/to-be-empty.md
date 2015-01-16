Asserts that an array is empty.

<!-- evaluate -->
```javascript
expect([], 'to be empty');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect([1,2,3], 'to be empty');
```

```
expected [ 1, 2, 3 ] to be empty
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect([1,2,3], 'not to be empty');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect([], 'not to be empty');
```

```
expected [] not to be empty
```
<!-- /evaluate -->
