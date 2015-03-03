Asserts a string matches a regular expression.

```javascript
expect('Hello beautiful world!', 'to match', /bea.t.*/);
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello world!', 'to match', /beautiful/);
```

```output
expected 'Hello world!' to match /beautiful/
```

This assertion can be negated using the `not` flag:

```javascript
expect('Hello world!', 'not to match', /beautiful/);
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello beautiful world!', 'not to match', /beautiful/);
```

```output
expected 'Hello beautiful world!' not to match /beautiful/

Hello beautiful world!
```
