Asserts a string matches a regular expression.

```javascript
expect('Hello beautiful world!', 'to match', /bea.t.*/);
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello world!', 'to match', /beautiful/);
```

```output
expected 'Hello world!' to match /beautiful/
```

This assertion can be negated using the `not` flag:

```javascript
expect('Hello world!', 'not to match', /beautiful/);
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello beautiful world!', 'not to match', /beautiful/);
```

```output
expected 'Hello beautiful world!' not to match /beautiful/

Hello beautiful world!
      ^^^^^^^^^
```

The return value of `String.prototype.match` will be provided as the fulfillment
value of the returned promise, so the values captured by the regular expression
are available to the `then` function:

```javascript#async:true
return expect('Hello world!', 'to match', /(\w+)!/).then(function (captures) {
    expect(captures[0], 'to equal', 'world!');
    expect(captures[1], 'to equal', 'world');
    expect(captures.index, 'to equal', 6);
});
```

Or using the Bluebird-specific `.spread` extension:

```javascript#async:true
return expect('Hello world!', 'to match', /(\w+)!/).spread(function ($0, $1) {
    expect($0, 'to equal', 'world!');
    expect($1, 'to equal', 'world');
});
```
