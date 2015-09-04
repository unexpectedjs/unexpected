---
title: promise.all
---

# expect.promise.all(...)

This method will find all promises in the given structure and return a promise
that will be fulfilled when all of the promises in the structure have been
fulfilled. If any of the promises is rejected, the resulting promise will be
rejected with the same error.

This method is usually used in combination with
[expect.promise.settle](/api/promise-settle).

Let's make an asynchronous assertion that we can use for the examples:

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

The following code snippet creates a promise that is fulfilled when all the
promises in the nested structure are fulfilled.

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

The following code snippet creates a promise that is rejected when one
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
expected { a: '0', b: 1 }
to have values satisfying 'to be a number after a short delay'

{
  a: '0', // should be a number after a short delay
  b: 1
}
```
