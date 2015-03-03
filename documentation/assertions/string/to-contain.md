Asserts a string contains one or more substrings.

```javascript
expect('Hello beautiful world!', 'to contain', 'beautiful');
expect('Hello beautiful world!', 'to contain', 'Hello', 'world');
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello world!', 'to contain', 'beautiful');
```

```output
expected 'Hello world!' to contain 'beautiful'
```

This assertion can be negated using the `not` flag:

```javascript
expect('Hello world!', 'not to contain', 'beautiful', 'ugly');
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello beautiful world!', 'not to contain', 'beautiful', 'ugly');
```

```output
expected 'Hello beautiful world!' not to contain 'beautiful', 'ugly'

Hello beautiful world!
```
