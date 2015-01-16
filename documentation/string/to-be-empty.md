Asserts that the string is empty.

<!-- evaluate -->
```javascript
expect('', 'to be empty');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello world', 'to be empty');
```

```
expected 'Hello world' to be empty
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect('Hello world', 'not to be empty');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('', 'not to be empty');
```

```
expected '' not to be empty
```
<!-- /evaluate -->
