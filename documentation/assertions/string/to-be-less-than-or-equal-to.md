Asserts that a string is less than or equal to another string using
the `<=` operator.


```javascript
expect('b', 'to be less than or equal to', 'b');
expect('b', 'to be <=', 'c');
expect('c', '<=', 'c');
```

In case of a failing expectation you get the following output:

```javascript
expect('b', 'to be less than or equal to', 'a');
```

```output
expected 'b' to be less than or equal to 'a'
```

This assertion can be negated using the `not` flag:

```javascript
expect('b', 'not to be less than or equal to', 'a');
expect('c', 'not to be <=', 'b');
```

In case of a failing expectation you get the following output:

```javascript
expect('a', 'not to be less than or equal to', 'a');
```

```output
expected 'a' not to be less than or equal to 'a'
```
