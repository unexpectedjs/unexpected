When assertions fails in Unexpected they yield an
`UnexpectedError`. This instance has several convenience methods for
retrieving information about the error.

### unexpectedError.getErrorMessage()

Returns the error message as a
[magicpen](https://github.com/sunesimonsen/magicpen) instance. The
method uses the assertion error modes to produce the correct
error message.

This is useful if you want to combine multiple errors in one assertion:

```js
expect.addAssertion("array", "to have item satisfying", function (expect, subject) {
  var args = Array.prototype.slice.call(arguments, 2);
  var promises = subject.map(function (item) {
    return expect.promise(function () {
      return expect.apply(expect, [item].concat(args));
    });
  });

  return expect.promise.settle(promises).then(function () {
    var failed = promises.every(function (promise) {
      return promise.isRejected();
    });

    if (failed) {
      expect.fail({
        diff: function (output, diff, inspect, equal) {
          var result = {
            inline: true,
            diff: output
          };
          promises.forEach(function (promise, index) {
            if (index > 0) { result.diff.nl(2); }
            var error = promise.reason();
            // the error is connected to the current scope
            // but we are just interested in the nested error
            error.errorMode = 'bubble';
            result.diff.append(error.getErrorMessage());
          });
          return result;
        }
      });
    }
  });
});
```

When the assertion fails we get the following output:

```js
expect(['foo', 'bar'], 'to have item satisfying', 'to equal', 'bar');
expect(['foo', 'bar'], 'to have item satisfying', 'to equal', 'bAr');
```

```output
expected [ 'foo', 'bar' ] to have item satisfying 'to equal', 'bAr'

expected 'foo' to equal 'bAr'

-foo
+bAr

expected 'bar' to equal 'bAr'

-bar
+bAr
```

### unexpectedError.parent

When assertions delegate to nested `expect` calls the errors that are
thrown on each level are chained together through the `parent`
property. The error message is serialized lazily, so it is possible to
change the error hierarchy before the error is serialized or extract
information from the hierarchy and use [expect.fail](./fail/) to throw
a new error.

We could for example change the error mode for all the errors in the
chain to `nested`:

```js
expect.addAssertion('detailed to be', function (expect, subject, value) {
  this.errorMode = 'bubble';
  expect.withError(function () {
    expect(subject, 'to be', value);
  }, function (err) {
    err.getParents().forEach(function (e){
      e.errorMode = 'nested';
    });
    expect.fail(err);
  });
});

expect('f00!', 'detailed to be', 'foo!');
```

```output
expected 'f00!' to be 'foo!'
  expected 'f00!' to equal 'foo!'
    Explicit failure

    -f00!
    +foo!
```
