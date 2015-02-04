Asserts that a string is greater than another string using the `>`
operator.

```javascript
expect('b', 'to be greater than', 'a');
expect('b', 'to be above', 'a');
expect('b', 'to be >', 'a');
expect('b', '>', 'a');
```

In case of a failing expectation you get the following output:

```javascript
expect('a', 'to be greater than', 'a');
```

```output
expected 'a' to be greater than 'a'
```

This assertion can be negated using the `not` flag:

```javascript
expect('a', 'not to be greater than', 'a');
expect('a', 'not to be above', 'a');
expect('a', 'not to be >', 'a');
```

In case of a failing expectation you get the following output:

```javascript
expect('b', 'not to be above', 'a');
```

```output
expected 'b' not to be above 'a'
```
