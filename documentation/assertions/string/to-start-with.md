Asserts that a string start with a given string.

```js
expect('Hello beautiful world!', 'to start with', 'Hello');
```

In case of a failing expectation you get the following output:

```js
expect('Hello world!', 'to start with', 'foo');
```

```output
expected 'Hello world!' to start with 'foo'
```

If there is a partially matching prefix you'll get a diff with the common
part highlighted:

```js
expect('Hello world!', 'to start with', 'Hell yeah');
```

```output
expected 'Hello world!' to start with 'Hell yeah'

Hello world!
^^^^
```

This assertion can be negated using the `not` flag:

```js
expect('Hello world!', 'not to start with', 'Heaven');
```

In case of a failing expectation you get the following output:

```js
expect('Hello beautiful world!', 'not to start with', 'Hello');
```

```output
expected 'Hello beautiful world!' not to start with 'Hello'

Hello beautiful world!
^^^^^
```
