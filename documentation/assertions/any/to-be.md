Asserts equality using `Object.is`/the [SameValue](http://ecma-international.org/ecma-262/5.1/#sec-9.12) algorithm.

```js
var obj = {};
expect(obj, 'to be', obj);
expect(1, 'to be', 1);
expect(null, 'to be', null);
expect(undefined, 'to be', obj.foo);
expect(true, 'to be', !false);
```

The SameValue/`Object.is` algorithm has some subtle differences compared to the `===` operator, which makes it more suitable for an assertion lib:

```js
expect(NaN, 'to be', NaN);
expect(-0, 'not to be', 0);
```

In case of a failing expectation you get the following output:

```js
expect('1', 'to be', 1);
```

```output
expected '1' to be 1
```

This assertion can be negated using the `not` flag:

```js
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

```js
expect(1, 'not to be', 1);
```

```output
expected 1 not to be 1
```
