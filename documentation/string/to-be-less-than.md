Asserts that a string is less than another string using the `<`
operator.

<!-- evaluate -->
```javascript
expect('a', 'to be less than', 'b');
expect('a', 'to be below', 'b');
expect('a', 'to be <', 'b');
expect('a', '<', 'b');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('a', 'to be less than', 'a');
```

```
expected 'a' to be less than 'a'
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect('a', 'not to be less than', 'a');
expect('a', 'not to be below', 'a');
expect('a', 'not to be <', 'a');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('a', 'not to be below', 'b');
```

```
expected 'a' not to be below 'b'
```
<!-- /evaluate -->
