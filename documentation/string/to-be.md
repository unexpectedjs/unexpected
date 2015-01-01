Asserts `===` equality.

<!-- evaluate -->
```javascript
expect('Hello', 'to be', 'Hello');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello beautiful!', 'to be', 'Hello world!');
```

```
expected 'Hello' to be 'Hello world!'

-Hello
+Hello world!
```
<!-- /evaluate -->

The assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect('Hello', 'not to be', 'Hello world!');
expect('1', 'not to be', 1);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello world!', 'not to be', 'Hello world!');
```

```
expected 'Hello world!' not to be 'Hello world!'
```
<!-- /evaluate -->
