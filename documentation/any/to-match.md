Asserts a string matches a regular expression.

<!-- evaluate -->
```javascript
expect('Hello beautiful world!', 'to match', /bea.t.*/);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello world!', 'to match', /beautiful/);
```

```
expected 'Hello world!' to match /beautiful/
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect('Hello world!', 'not to match', /beautiful/);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello beautiful world!', 'not to match', /beautiful/);
expect({ foo: 'foo' }, 'not to match', /foo/);
expect(null, 'not to match', /foo/);
```

```
expected 'Hello beautiful world!' not to match /beautiful/

Hello beautiful world!
```
<!-- /evaluate -->
