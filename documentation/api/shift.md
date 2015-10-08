# expect.shift([newSubject])

Inside an assertion that takes another assertion as the last parameter via
the `<assertion>` type, you can use `expect.shift` to invoke that assertion,
optionally replacing the subject with an alternative one.

```js
expect.addAssertion('<string> when parsed as an integer <assertion>', function (expect, subject) {
    expect(subject, 'to match', /^[1-9][0-9]*$/);
    return expect.shift(parseInt(subject, 10));
});

expect('42', 'when parsed as an integer', 'to be greater than', 10);
```

If you omit the `newSubject` parameter to `expect.shift`, the current subject
will be preserved. This is mainly useful for assertions that have side effects,
for example mocking out parts of the environment.

It is important that the return value of `expect.shift` is returned (or yielded
as the fulfillment value of a promise) from your assertion. That way everything
will work out when delegating to an asynchronous assertion, ie. one that returns
a promise. The promise will then be propagated correctly.

## Promise-based flows

If your assertion does not take an `<assertion>` as a parameter, or if it
optionally takes one via `<assertion?>` and is invoked without,
`expect.shift` will propagate its argument as the fulfillment value of the
promise returned from your assertion:

```js#freshExpect:true
expect.addAssertion('<string> [when] parsed as an integer <assertion?>', function (expect, subject) {
    expect(subject, 'to match', /^[1-9][0-9]*$/);
    return expect.shift(parseInt(subject, 10));
});

return expect('42', 'parsed as an integer').then(function (integer) {
    return expect(integer, 'to be within', 30, 50);
});
```

## Multiple invocations

You can call `expect.shift()` multiple times in your assertion if you want
to delegate to the other assertion several times, optionally with different
subjects. Remember that each invocation could result in a promise -- make
sure to gather up the return values and use `expect.promise.all` or a similar
construct to resolve them all, for example:

```js
expect.addAssertion('<number> up to [and including] <number> <assertion?>', function (expect, subject, value) {
    expect.errorMode = 'nested';
    var numbers = [];
    for (var i = subject ; i < (expect.flags['and including'] ? value + 1 : value) ; i += 1) {
        numbers.push(i);
    }
    return expect.promise.all(numbers.map(function (number) {
        return expect.promise(function () {
            return expect.shift(number);
        });
    }));
});

expect(5, 'up to and including', 100, 'to be greater than', 4);
```

Again, this has the nice property that the shifted values will be provided as
the fulfillment value of the promise if invoked without an assertion:

```js#async:true
return expect(10, 'up to', 20).then(function (numbers) {
    expect(numbers, 'to have length', 10);
});
```
