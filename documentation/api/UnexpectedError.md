# UnexpectedError

When assertions fail in Unexpected they yield an
`UnexpectedError`. This instance has several convenience methods for
retrieving information about the error.

## UnexpectedError.getErrorMessage(options)

Returns the error message as a
[magicpen](https://github.com/sunesimonsen/magicpen) instance. The
method uses the assertion error modes to produce the correct
error message.

Notice that you must either provide an output or a format in the given
options. The format can be on of `text`, `ansi` or `html`. As a
shortcut you can also just pass the output or format directly.

An alternative to calling `getErrorMessage(output)` with an output,
you can append the error message to an output the following way:

```js#evaluate:false
output.appendErrorMessage(error);
```

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
            result.diff.append(error.getErrorMessage(output));
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

## UnexpectedError.parent

When assertions delegate to nested `expect` calls the errors that are
thrown at each level are chained together through the `parent`
property. The error message is serialized lazily, so it is possible to
change the error hierarchy before the error is serialized, or extract
information from the hierarchy and use [expect.fail](../fail/) to throw
a new error.

We could for example change the error mode for all the errors in the
chain to `nested`:

```js
expect.addAssertion('detailed to be', function (expect, subject, value) {
  expect.errorMode = 'bubble';
  expect.withError(function () {
    expect(subject, 'to be', value);
  }, function (err) {
    err.getParents().forEach(function (e) {
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

## UnexpectedError.getParents()

Return an array with all the ancestor errors to this error. See
<a href="#unexpectederror-parent">parent</a> for more information.

## UnexpectedError.getAllErrors()

Return an array with this error and all its ancestors. See
<a href="#unexpectederror-parent">parent</a> for more information.

## UnexpectedError.getDiff()

Find the first error in the hierarchy that contains a diff and
return it. This method if useful if you want to hoist a diff from an
ancestor error and combine it with a new message.

Notice that you must either provide an output or a format in the given
options. The format can be on of `text`, `ansi` or `html`. As a
shortcut you can also just pass the output or format directly.

## UnexpectedError.getDiffMethod()

In case you need to wrap diff with additional information you can
retrieve a method that will build a diff for you. It will find the
first ancestor error that contains a diff and return the method to
create the diff. Now you can delegate to that method from
`expect.fail`:

```js
expect.addAssertion('to be completely custom', function (expect, subject) {
  return expect.withError(function () {
    expect(subject, 'to satisfy', { custom: true });
  }, function (err) {
    var createDiff = err.getDiffMethod();
    expect.fail({
      diff: function (output, diff, inspect, equal) {
        output.text('~~~~~~~~~~~~~~').sp().success('custom').sp().text('~~~~~~~~~~~~~~').nl();
        var result = createDiff(output, diff, inspect, equal);
        return result;
      }
    });
  });
});

expect({ custom: false }, 'to be completely custom');
```

```output
expected { custom: false } to be completely custom

~~~~~~~~~~~~~~ custom ~~~~~~~~~~~~~~
{
  custom: false // should equal true
}
```

## UnexpectedError.getLabel()

Get a shortened representation of the error message that doesn't
repeat the subject, for example `should equal 'bar'` rather than
`expected 'foo' to equal 'bar'`. This makes it suitable for display next
to an existing rendering of the subject, such as inside a diff.
