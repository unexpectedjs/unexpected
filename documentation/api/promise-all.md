---
title: promise.all
---

### expect.promise.all(...)

This method will find all promises in the given structure and return a
promise that resolves when all of the promises in the structure have
resolved. If any of the promises are rejected the resulting promise
will be rejected with the same error.

This method is usually used in combination with
[expect.promise.settle](/api/promise-settle).

Let's make an asynchronous assertion that we can uses for the examples:

```js
expect.addAssertion('to be a number after a short delay', function (expect, subject) {
  return expect.promise(function (run) {
    setTimeout(run(function () {
        expect(subject, 'to be a number');
    }), 1);
  });
});
```

See the [promise](/api/promise) documentation for more details on how
expect.promise works.

The following code snippet creates a promise that resolves when all the
promises in the nested structure resolves.

```js#async:true
return expect.promise.all({
  foo: [
    expect(42, 'to be a number after a short delay')
  ],
  bar: expect([0, 1, 2], 'to have items satisfying',
                         expect.it('to be a number after a short delay')),

  baz: expect({ a: 1, b: 2 }, 'to have values satisfying',
                              'to be a number after a short delay')
});
```

The following code snippet create a promise that is rejected when one
of the promises in the nested structure is rejected.

```js#async:true
return expect.promise.all({
  foo: [
    expect(42, 'to be a number after a short delay')
  ],
  bar: expect([0, 1, 2], 'to have items satisfying',
                         expect.it('to be a number after a short delay')),

  baz: expect({ a: '0', b: 1 }, 'to have values satisfying',
                                'to be a number after a short delay')
});
```

```output
failed expectation in { a: '0', b: 1 }:
  a: expected '0' to be a number after a short delay
```
