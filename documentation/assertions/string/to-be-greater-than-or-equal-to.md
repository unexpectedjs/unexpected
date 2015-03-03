Asserts that a string is greater than or equal to another string using
the `>=` operator.


```javascript
expect('b', 'to be greater than or equal to', 'b');
expect('c', 'to be >=', 'b');
expect('c', '>=', 'c');
```

In case of a failing expectation you get the following output:

```javascript
expect('a', 'to be greater than or equal to', 'b');
```

```output
expected 'a' to be greater than or equal to 'b'
```

This assertion can be negated using the `not` flag:

```javascript
expect('a', 'not to be greater than or equal to', 'b');
expect('b', 'not to be >=', 'c');
```

In case of a failing expectation you get the following output:

```javascript
expect('a', 'not to be greater than or equal to', 'a');
```

```output
expected 'a' not to be greater than or equal to 'a'
```
