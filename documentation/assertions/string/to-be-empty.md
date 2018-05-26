Asserts that the string is empty.

Aliases: `to be the empty string`, `to be an empty string`

```js
expect('', 'to be empty');
```

In case of a failing expectation you get the following output:

```js
expect('Hello world', 'to be empty');
```

```output
expected 'Hello world' to be empty
```

This assertion can be negated using the `not` flag:

```js
expect('Hello world', 'not to be empty');
```

In case of a failing expectation you get the following output:

```js
expect('', 'not to be empty');
```

```output
expected '' not to be empty
```
