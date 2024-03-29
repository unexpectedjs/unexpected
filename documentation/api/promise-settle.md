---
title: promise.settle
---

# expect.promise.settle(...)

This method will find all promises in the given structure and return a
promise that will be fulfilled when all of the promises have been rejected or
fulfilled. When the returned promise is fulfilled, you can use
[synchronous inspection](https://github.com/petkaantonov/bluebird/blob/master/API.md#synchronous-inspection)
on each of the promises to read their values.

Let's make an asynchronous assertion that we can use for the examples:

```js
expect.addAssertion(
  '<any> to be a number after a short delay',
  function (expect, subject) {
    return expect.promise(function (run) {
      setTimeout(
        run(function () {
          expect(subject, 'to be a number');
        }),
        1
      );
    });
  }
);
```

See the [promise](../promise/) documentation for more details on how
expect.promise works.

The following code snippet creates a promise that is rejected when any
promise in the nested structure is rejected. When the returned promise
is rejected it create an error report with the details.

<!-- unexpected-markdown async:true -->

```js
const promises = {
  foo: expect('42', 'to be a number after a short delay'),
  bar: expect(
    [0, 1, 2],
    'to have items satisfying',
    expect.it('to be a number after a short delay')
  ),
  baz: expect(
    { a: '1', b: 2 },
    'to have values satisfying',
    'to be a number after a short delay'
  ),
};

return expect.promise.all(promises).caught(function () {
  return expect.promise.settle(promises).then(function () {
    expect.fail(function (output) {
      output.text('{').nl();
      output.indentLines();
      Object.keys(promises).forEach(function (key, index) {
        output.i().jsKey(key).text(':').sp();
        if (promises[key].isFulfilled()) {
          output.success('✓');
        } else {
          output
            .error('⨯ ')
            .block(promises[key].reason().getErrorMessage({ output }));
        }
        output.nl();
      });
      output.outdentLines();
      output.text('}');
    });
  });
});
```

```output
{
  foo: ⨯ expected '42' to be a number after a short delay
  bar: ✓
  baz: ⨯ expected { a: '1', b: 2 }
         to have values satisfying to be a number after a short delay

         {
           a: '1', // should be a number after a short delay
           b: 2
         }
}
```
