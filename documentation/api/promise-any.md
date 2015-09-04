---
title: promise.any
---

# expect.promise.any(...)

This method will find all promises in the given structure and return a promise
that will be fulfilled when any of the promises in the structure have been
fulfilled. If all of the promises are rejected, the resulting promise will be
rejected with the errors.

Let's make an asynchronous assertion that we can use for the examples:

```js
expect.addAssertion('to be a number after a short delay', function (expect, subject) {
  return expect.promise(function (run) {
    setTimeout(run(function () {
        expect(subject, 'to be a number');
    }), 0);
  });
});
```

See the [promise](/api/promise) documentation for more details on how
expect.promise works.

The following code snippet creates a promise that will be fulfilled when any
of the promises in the nested structure has been fulfilled.

```js#async:true
return expect.promise.any({
  foo: [
    expect('42', 'to be a number after a short delay')
  ],
  bar: expect([0, 1, 2], 'to have items satisfying',
                         expect.it('to be a number after a short delay')),

  baz: expect({ a: '1', b: 2 }, 'to have values satisfying',
                                'to be a number after a short delay')
});
```

The following code snippet create a promise that will rejected when all
of the promises in the nested structure have been rejected:

```js#async:true
return expect.promise.any({
  foo: [
    expect('42', 'to be a number after a short delay')
  ],
  bar: expect([0, '1', 2], 'to have items satisfying',
                           expect.it('to be a number after a short delay')),

  baz: expect({ a: '0', b: 1 }, 'to have values satisfying',
                                'to be a number after a short delay')
}).caught(function (aggregateError) {
  // Let's reformat the error a bit
  expect.fail(function (output) {
    output.error(aggregateError.message);
    var errors = [];
    for (var i = 0; i < aggregateError.length; i += 1) {
      errors.push(aggregateError[i]);
    }

    errors.sort(function (a, b) { // Make the output stable
      if (a.message < b.message) return -1;
      if (a.message > b.message) return 1;
      return 0;
    });

    output.indentLines();
    errors.forEach(function (e, i) {
      output.nl().i().text(i + ': ').block(e.getErrorMessage({ output: output }));
    });
  });
});
```

```output
aggregate error
  0: expected '42' to be a number after a short delay
  1: expected [ 0, '1', 2 ]
     to have items satisfying expect.it('to be a number after a short delay')

     [
       0,
       '1', // expected '1' to be a number after a short delay
       2
     ]
  2: expected { a: '0', b: 1 }
     to have values satisfying 'to be a number after a short delay'

     {
       a: '0', // should be a number after a short delay
       b: 1
     }
```
