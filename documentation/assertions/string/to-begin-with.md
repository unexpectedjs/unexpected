Asserts that a string begins with a given string.

```javascript
expect('Hello beautiful world!', 'to begin with', 'Hello');
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello world!', 'to begin with', 'foo');
```

```output
expected 'Hello world!' to begin with 'foo'
```

If there is a partially matching prefix you'll get a diff with the common
part highlighted:

```javascript
expect('Hello world!', 'to begin with', 'Hell yeah');
```

```output
expected 'Hello world!' to begin with 'Hell yeah'

Hello world!
^^^^
```

This assertion can be negated using the `not` flag:

```javascript
expect('Hello world!', 'not to begin with', 'Heaven');
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello beautiful world!', 'not to begin with', 'Hello');
```

```output
expected 'Hello beautiful world!' not to begin with 'Hello'

Hello beautiful world!
^^^^^
```
