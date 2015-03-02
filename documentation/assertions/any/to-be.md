Asserts equality using `Object.is`/the [SameValue](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue) algorithm.

```javascript
var obj = {};
expect(obj, 'to be', obj);
expect(1, 'to be', 1);
expect(null, 'to be', null);
expect(undefined, 'to be', obj.foo);
expect(true, 'to be', !false);
```

The SameValue/`Object.is` algorithm has some subtle differences compared to the `===` operator, which makes it more suitable for an assertion lib:

<!-- evaluate -->
```javascript
expect(NaN, 'to be', NaN);
expect(-0, 'not to be', 0);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

```javascript
expect('1', 'to be', 1);
```

```output
expected '1' to be 1
```

This assertion can be negated using the `not` flag:

```javascript
expect({}, 'not to be', {});
expect(1, 'not to be', true);
expect('1', 'not to be', 1);
expect(null, 'not to be', undefined);
expect(0, 'not to be', 'null');
expect(undefined, 'not to be', 'null');
expect(false, 'not to be', 'true');
expect(true, 'not to be', 'false');
```

In case of a failing expectation you get the following output:

```javascript
expect(1, 'not to be', 1);
```

```output
expected 1 not to be 1
```
