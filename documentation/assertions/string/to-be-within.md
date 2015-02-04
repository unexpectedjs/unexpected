Asserts that a string is within a range of strings.

```javascript
expect('a', 'to be within', 'a', 'd');
expect('b', 'to be within', 'a', 'd');
expect('aabbcc', 'to be within', 'aaa', 'aaz');
```

In case of a failing expectation you get the following output:

```javascript
expect('abbbcc', 'to be within', 'aaa', 'aaz');
```

```output
expected 'abbbcc' to be within 'aaa'..'aaz'
```

This assertion can be negated using the `not` flag:

```javascript
expect('bar', 'not to be within', 'foo', 'baz');
expect('e', 'not to be within', 'a', 'd');
expect('abbbcc', 'not to be within', 'aaa', 'aaz');
```

In case of a failing expectation you get the following output:

```javascript
expect('c', 'not to be within', 'a', 'd');
```

```output
expected 'c' not to be within 'a'..'d'
```
