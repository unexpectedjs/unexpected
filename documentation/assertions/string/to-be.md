Asserts `===` equality.

```javascript
expect('Hello', 'to be', 'Hello');
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello beautiful!', 'to be', 'Hello world!');
```

```output
expected 'Hello beautiful!' to be 'Hello world!'

-Hello beautiful!
+Hello world!
```

This assertion can be negated using the `not` flag:

```javascript
expect('Hello', 'not to be', 'Hello world!');
expect('1', 'not to be', 1);
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello world!', 'not to be', 'Hello world!');
```

```output
expected 'Hello world!' not to be 'Hello world!'
```
