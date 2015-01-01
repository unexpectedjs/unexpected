Asserts that the value is `undefined`.

<!-- evaluate -->
```javascript
expect(undefined, 'to be undefined');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello world', 'to be undefined');
```

```
expected 'Hello world' to be undefined
```
<!-- /evaluate -->

The assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect('Hello world!', 'not to be undefined');
expect({ foo: { bar: 'baz' } }, 'not to be undefined');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(undefined, 'not to be undefined');
```

```
expected undefined not to be undefined
```
<!-- /evaluate -->
