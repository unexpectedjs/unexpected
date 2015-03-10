### expect.addAssertion([typeName, ...], [pattern, ...], handler)

Signature:

```js#evaluate:false
expect.addAssertion(pattern, handler);
expect.addAssertion([pattern, ...]], handler);
expect.addAssertion(typeName, pattern, handler);
expect.addAssertion(typeName, [pattern, ...], handler);
expect.addAssertion([typeName, ...], pattern, handler);
expect.addAssertion([typeName, ...], [pattern, ...], handler);
```

New assertions can be added to Unexpected to following way.

```js
var errorMode = 'default'; // use to control the error mode later in the example
expect.addAssertion('array', '[not] to be (sorted|ordered)', function(expect, subject, cmp) {
  this.errorMode = errorMode;
  expect(subject, '[not] to equal', [].concat(subject).sort(cmp));
});

```

The above assertion definition makes the following expects possible:

```js
expect([1,2,3], 'to be sorted');
expect([1,2,3], 'to be ordered');
expect([2,1,3], 'not to be sorted');
expect([2,1,3], 'not to be ordered');
expect([3,2,1], 'to be sorted', function (x, y) { return y - x; });
```

Let's dissect the different parts of the custom assertion we just
introduced.

The first parameter to `addAssertion` is a string or an array
specifying which types the assertion should be defined on. In this
case the assertion in only defined for arrays. In case the type is not
specified the assertion will be defined for the type `any`, and would
be applicable any type. See the `Extending Unexpected with new types`
section for more information about the type system in Unexpected.

The second parameter to `addAssertion` is a string or an array stating
the patterns this assertion should match. A pattern has the following
syntax. A word in square brackets represents a flag that can either be
there or not. If the flag is present `this.flags[flag]` will contain
the value `true`. In this case `not` is a flag. When a flag it present
in a nested `expect` it will be inserted if the flag is present;
otherwise it will be removed. Text that is in parentheses with
vertical bars between them are treated as alternative texts that can
be used. In this case you can write _ordered_ as an alternative to
_sorted_.

The last parameter to `addAssertion` is function that will be called
when `expect` is invoked with an expectation matching the type and
pattern of the assertion.

So in this case, when `expect` is called the following way:

```js#evaluate:false
expect([3,2,1], 'to be sorted', reverse);
```

The handler to our assertion will be called with the values the
following way, where the _not_ flag in the nested expect will be
removed:

```js#evaluate:false
expect.addAssertion('array', '[not] to be (sorted|ordered)', function(expect, [3,2,1], reverse){
    expect([3,2,1], '[not] to equal', [].concat([3,2,1]).sort(reverse));
});
```

## Controlling the output of nested expects

When a call to `expect` fails inside your assertion the standard error
message for the custom assertion will be used. In the case of our
_sorted_ assertion fails, the output will be:

```js
expect([ 1, 3, 2, 4 ], 'to be sorted');
```

```output
expected [ 1, 3, 2, 4 ] to be sorted

[
  1,
  3, // should equal 2
  2, // should equal 3
  4
]
```

We can control the output of the nested expects by changing the
`this.errorMode` property.

If we change the error mode to _bubble_, we get the following output:

```js
errorMode = 'bubble';
expect([ 1, 3, 2, 4 ], 'to be sorted');
```

```output
expected [ 1, 3, 2, 4 ] to equal [ 1, 2, 3, 4 ]

[
  1,
  3, // should equal 2
  2, // should equal 3
  4
]
```

If we change the error mode to _nested_, we get the following output:

```js
errorMode = 'nested';
expect([ 1, 3, 2, 4 ], 'to be sorted');
```

```output
expected [ 1, 3, 2, 4 ] to be sorted
  expected [ 1, 3, 2, 4 ] to equal [ 1, 2, 3, 4 ]

  [
    1,
    3, // should equal 2
    2, // should equal 3
    4
  ]
```

The best resource for learning more about custom assertions is to look
at how the predefined assertions are built:

[lib/assertions.js](https://github.com/unexpectedjs/unexpected/blob/master/lib/assertions.js)
