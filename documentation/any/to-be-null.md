Asserts that the value is `null`.

<!-- evaluate -->
```javascript
expect(null, 'to be null');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({ foo: { bar: 'baz' } }, 'to be null');
```

```
expected { foo: { bar: 'baz' } } to be null
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect({ foo: { bar: 'baz' } }, 'not to be null');
expect('Hello world!', 'not to be null');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(null, 'not to be null');
```

```
expected null not to be null
```
<!-- /evaluate -->
