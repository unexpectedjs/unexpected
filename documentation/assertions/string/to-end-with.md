Asserts that a string ends with a given string.

```javascript
expect('Hello beautiful world!', 'to end with', 'world!');
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello world!', 'to end with', 'foo');
```

```output
expected 'Hello world!' to end with 'foo'
```

If there is a partially matching suffix you'll get a diff with the common
part highlighted:

```javascript
expect('Hello world!', 'to end with', 'Hola, world!');
```

```output
expected 'Hello world!' to end with 'Hola, world!'

Hello world!
     ^^^^^^^
```

This assertion can be negated using the `not` flag:

```javascript
expect('Hello world!', 'not to end with', 'earth!');
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello beautiful world!', 'not to end with', 'world!');
```

```output
expected 'Hello beautiful world!' not to end with 'world!'

Hello beautiful world!
                ^^^^^^
```
