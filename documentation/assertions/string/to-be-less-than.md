Asserts that a string is less than another string using the `<`
operator.

```javascript
expect('a', 'to be less than', 'b');
expect('a', 'to be below', 'b');
expect('a', 'to be <', 'b');
expect('a', '<', 'b');
```

In case of a failing expectation you get the following output:

```javascript
expect('a', 'to be less than', 'a');
```

```output
expected 'a' to be less than 'a'
```

This assertion can be negated using the `not` flag:

```javascript
expect('a', 'not to be less than', 'a');
expect('a', 'not to be below', 'a');
expect('a', 'not to be <', 'a');
```

In case of a failing expectation you get the following output:

```javascript
expect('a', 'not to be below', 'b');
```

```output
expected 'a' not to be below 'b'
```
