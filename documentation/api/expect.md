# expect(subject, assertionName, [value, ...])

Perform an assertion about `subject`.

The `expect` function will throw an `UnexpectedError` if the assertion can be
decided synchronously and isn't fulfilled:

```javascript
expect(123, 'to equal', 456);
```

```output
expected 123 to equal 456
```

In all other cases `expect` will return a
[Bluebird promise](https://github.com/petkaantonov/bluebird) which will either be
rejected or fulfilled. For consistency, even successful synchronous assertions will
return a promise.

The idea is that you can return the promise to your test framework (from an `it`
block or equivalent), so that the outcome of the test will be decided by whether
the promise is fulfilled. This works natively in mocha 1.18+, and Unexpected
does some unholy trickery so it also works in Jasmine.

Note that if the assertion is asynchronous, you'll have to return the promise
to the `it` block:

```javascript#eval:false
it('should call the callback', function () {
    return expect(setImmediate, 'to call the callback');
});
```

Otherwise your test framework will assume that the test has passed and won't wait
for the asynchronous work to complete.

As of 8.0.0 Unexpected will detect created promises that were never returned
and make the test fail synchronously. This will uncover some extremely nasty
bugs where the test suite succeeds when it should actually fail. However, this
feature only works in Mocha and Jasmine.


## expect(...).and(assertionName, [value, ...])

The returned promise will be augmented with an `and` method that allows you to
perform more assertions on the same subject:

```javascript
expect('abc', 'to be a string').and('to have length', 3);
```

Again, note that you need to return the value returned by `expect` to your `it`
block if any of the assertions are asynchronous:

```javascript#eval:false
it('should do the right thing', function () {
    return expect(setImmediate, 'to be a function').and('to call the callback');
});
```
