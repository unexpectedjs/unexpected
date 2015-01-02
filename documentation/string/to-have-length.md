Asserts that the string has the specified length.

<!-- evaluate -->
```javascript
expect('Hello world', 'to have length', 11);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello world', 'to have length', 12);
```

```
expected 'Hello world' to have length 12
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

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
