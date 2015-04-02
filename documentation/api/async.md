### expect.async(...)

Unexpected comes with build in support for asynchronous assertions.

Internally Unexpected uses promises to orchestrate the asynchronous
computation and in test frameworks like [Mocha](http://mochajs.org/)
that supports promises out of the box, you will be able to just return
the promise of an asynchronous assertion:

```js#evaluate:false
describe('asynchronous testing', function () {
  it('should be fun', function () {
    return expect(middleware, 'to yield exchange', {
      request: { url: '/hello' },
      response: { statusCode: 200 }
    });
  });
});
```

For test frameworks that only supports a done-callback, we provide a
wrapper function:

```js#evaluate:false
describe('asynchronous testing', function () {
  it('should be fun', expect.async(function () {
    return expect(middleware, 'to yield exchange', {
      request: { url: '/hello' },
      response: { statusCode: 200 }
    });
  }));
});
```
