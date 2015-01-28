Asserts that a string is greater than another string using the `>`
operator.

<!-- evaluate -->
```javascript
expect('b', 'to be greater than', 'a');
expect('b', 'to be above', 'a');
expect('b', 'to be >', 'a');
expect('b', '>', 'a');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('a', 'to be greater than', 'a');
```

```
expected 'a' to be greater than 'a'
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect('a', 'not to be greater than', 'a');
expect('a', 'not to be above', 'a');
expect('a', 'not to be >', 'a');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('b', 'not to be above', 'a');
```

```
expected 'b' not to be above 'a'
```
<!-- /evaluate -->
