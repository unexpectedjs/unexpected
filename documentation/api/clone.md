### expect.clone()

Before extending the unexpected instance with new functionality it is
usually a good idea to clone it, so you don't change the global
instance. You do that by calling the `clone` method.

Adding new functionality to the cloned instance will not affect the
original instance:

```js
var originalExpect = expect;

expect = expect.clone().addAssertion('to be an integer', function (expect, subject) {
  expect(subject, 'to be a number');
  expect(Math.round(subject), 'to be', subject);
});

expect(42, 'to be an integer');
```

If we try to use the new assertion on the original instance it fails:

```js
originalExpect(42, 'to be an integer');
```

```output
Unknown assertion "to be an integer", did you mean: "to be a number"
```
