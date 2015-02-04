Asserts that the string has the specified length.

```javascript
expect('Hello world', 'to have length', 11);
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello world', 'to have length', 12);
```

```output
expected 'Hello world' to have length 12
  expected 11 to be 12
```

This assertion can be negated using the `not` flag:

```javascript
expect('Hello world', 'not to have length', 12);
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello world', 'not to have length', 11);
```

```output
expected 'Hello world' not to have length 11
```
