# expect.addAssertion(...)

Signature:

<!-- unexpected-markdown evaluate:false -->
<!-- eslint-skip -->

```js
expect.addAssertion(pattern, handler);
expect.addAssertion([pattern, ...]], handler);
```

`expect.addAssertion` takes two arguments:

1. a string pattern (or an array of patterns) that describes the assertion.
2. a handler function that is called when the assertion is invoked.

For example:

```js
expect.addAssertion('<array> to have item <any>', function (
  expect,
  subject,
  value
) {
  expect(subject, 'to contain', value);
});
```

A handler function can use other assertions, including other custom assertions
previously added via `expect.addAssertion`. This way, one could build up complex assertions from simpler ones or just reword an existing assertion, like in this example.

The new assertion can then be used as follows:

```js
expect([1, 2, 3], 'to have item', 2);
```

The first parameter to `addAssertion` is a string or an array of strings
describing the pattern(s) the assertion should match. The pattern takes the
following structure:

`<subject type> an assertion string <value type>`

The words in angle brackets define what types the assertion applies to. These
can be any of the internally-defined types or new types added via
[expect.addType](../addType). In this example, the subject to `to have item`
must be an array, while the value may be of any type.

If mismatching types are used when an assertion is invoked, Unexpected throws an
error with a helpful suggestion:

```js
expect('abcd', 'to have item', 'a');
```

```output
expected 'abcd' to have item 'a'
  The assertion does not have a matching signature for:
    <string> to have item <string>
  did you mean:
    <array> to have item <any>
```

An assertion may only have one `<subject type>` definition, followed by the
desired assertion string, followed by zero or more `<value type>` definitions.
It's not possible to add words between the value-type definitions. For instance,
an assertion such as `<number> to be between <number> and <number>` could
instead be written as:

```js
expect.addAssertion('<number> to be between <number> <number>', function (
  expect,
  subject,
  value1,
  value2
) {
  expect(subject, 'to be greater than', value1).and('to be less than', value2);
});
```

```js
expect(2, 'to be between', 1, 3);
```

Assertions that support different subject or value types can be defined as
follows:

<!-- unexpected-markdown freshExpect:true -->

```js
expect.addAssertion('<array> to have item <number|string>', function (
  expect,
  subject,
  value
) {
  expect(subject, 'to contain', value);
});
```

This would make the assertion more strict, only allowing number and string
values but not boolean values, for example:

```js
expect([1, 2, 3], 'to have item', 2);
expect(['a', 'b', 'c'], 'to have item', 'a');
expect([true, false], 'to have item', true);
```

```output
expected [ true, false ] to have item true
  The assertion does not have a matching signature for:
    <array> to have item <boolean>
  did you mean:
    <array> to have item <number|string>
```

## Alternations

Different versions of the same assertion, or different assertions that share the
same handler function, can be added using an array:

<!-- unexpected-markdown freshExpect:true -->

```js
expect.addAssertion(
  ['<array> to have item <any>', '<array> to have value <any>'],
  function (expect, subject, value) {
    expect(subject, 'to contain', value);
  }
);
```

```js
expect([1, 2, 3], 'to have item', 2);
expect([1, 2, 3], 'to have value', 3);
```

However, when it's a small deviation, as in this case, an alternation is more
handy:

<!-- unexpected-markdown freshExpect:true -->

```js
expect.addAssertion('<array> to have (item|value) <any>', function (
  expect,
  subject,
  value
) {
  expect(subject, 'to contain', value);
});
```

```js
expect([1, 2, 3], 'to have item', 2);
expect([1, 2, 3], 'to have value', 3);
```

Alternations allow branching, similar to an `if..else` statement. They are made
available to the handler function as an `expect.alternations` array which
contains the word used when the assertion is invoked:

<!-- unexpected-markdown freshExpect:true -->

```js
expect.addAssertion('<array> to have (index|value) <any>', function (
  expect,
  subject,
  value
) {
  if (expect.alternations[0] === 'index') {
    expect(subject[value], 'to be defined');
  } else {
    expect(subject, 'to contain', value);
  }
});
```

```js
expect(['a', 'b'], 'to have index', 1);
expect(['a', 'b'], 'to have value', 'b');
```

## Flags

Flags allow assertions to define modifiers which can alter the behaviour of the assertion. The most common example is the `not` flag which requests that
the assertion be negated:

<!-- unexpected-markdown freshExpect:true -->

```js
expect.addAssertion('<array> [not] to have item <any>', function (
  expect,
  subject,
  value
) {
  if (expect.flags.not) {
    expect(subject, 'not to contain', value);
  } else {
    expect(subject, 'to contain', value);
  }
});
```

This makes the following assertions possible:

```js
expect([1, 2, 3], 'to have item', 2);
expect([1, 2, 3], 'not to have item', 4);
```

Flags are made available to the handler function as an `expect.flags` object,
where the keys are the names of the flags and the values are `true`, if the flag
is used, or otherwise `undefined`.

This example could be improved further. Since
[to contain](../../assertions/array-like/to-contain/) also supports the `not`
flag, one can propagate the flag to that assertion as follows:

<!-- unexpected-markdown freshExpect:true -->

```js
expect.addAssertion('<array> [not] to have item <any>', function (
  expect,
  subject,
  value
) {
  expect(subject, '[not] to contain', value);
});
```

In this way, when `to have item` is invoked with the `not` flag, that flag will
be passed along to `to contain`.

When flags are propagated, one can also invert the flag as follows:

<!-- unexpected-markdown freshExpect:true -->

```js
expect.addAssertion('<array> [not] to have item <any>', function (
  expect,
  subject,
  value
) {
  expect(subject, '[!not] to contain', value);
});
```

This means that if `to have item` is invoked with the `not` flag, that flag will
not be propagated to `to contain` - and vice versa:

```js
expect([1, 2, 3], 'not to have item', 2);
expect([1, 2, 3], 'to have item', 4);
```

Fun with flags, right? Flags can also be used to define optional filler words
that make an assertion read better:

<!-- unexpected-markdown freshExpect:true -->

```js
expect.addAssertion('<array> to have [this] item <any>', function (
  expect,
  subject,
  value
) {
  expect(subject, 'to contain', value);
});
```

```js
expect([1, 2, 3], 'to have item', 2);
expect([1, 2, 3], 'to have this item', 2);
```

## Optional values

Assertions where a value is optional can be defined by adding a `?` after the
value's type definition. For instance, this can be used to define optional
`function` values:

```js
var errorMode = 'default'; // use to control the error mode in later examples
expect.addAssertion(
  '<array> [not] to be (sorted|ordered) [by] <function?>',
  function (expect, subject, cmp) {
    expect.errorMode = errorMode;
    expect(subject, '[not] to equal', [].concat(subject).sort(cmp));
  }
);
```

Which can then be used as follows:

```js
expect([1, 2, 3], 'to be sorted');
expect([1, 2, 3], 'to be ordered');
expect([2, 1, 3], 'not to be sorted');
expect([2, 1, 3], 'not to be ordered');
expect([3, 2, 1], 'to be sorted', function (x, y) {
  return y - x;
});
expect([3, 2, 1], 'to be sorted by', function (x, y) {
  return y - x;
});
```

## Overriding the standard error message

When you create a new assertion Unexpected will generate an error
message from the assertion text and the input arguments. In some cases
it can be preferable to tweak the output instead of creating
completely custom output using [expect.fail](../fail/).

You can override how the `subject` is displayed by providing a
`subjectOutput` for the specific assertion. You can also override the output of
the arguments by overriding parts of `argsOutput` or provide a
completely custom output for the arguments by setting `argsOutput` to
an output function on the assertion.

Here is a few examples:

```js
expect.addAssertion('<number> to be contained by <number> <number>', function (
  expect,
  subject,
  start,
  finish
) {
  expect.subjectOutput = function (output) {
    output.text('point ').jsNumber(subject);
  };
  expect.argsOutput = function (output) {
    output
      .text('interval ')
      .text('[')
      .appendInspected(start)
      .text(';')
      .appendInspected(finish)
      .text(']');
  };
  expect(subject >= start && subject <= finish, '[not] to be truthy');
});

expect(4, 'to be contained by', 8, 10);
```

```output
expected point 4 to be contained by interval [8;10]
```

```js
expect.addAssertion('<number> to be similar to <number> <number?>', function (
  expect,
  subject,
  value,
  epsilon
) {
  if (typeof epsilon !== 'number') {
    epsilon = 1e-9;
  }
  expect.argsOutput[2] = function (output) {
    output.text('(epsilon: ').jsNumber(epsilon.toExponential()).text(')');
  };
  expect(Math.abs(subject - value), 'to be less than or equal to', epsilon);
});

expect(4, 'to be similar to', 4.0001);
```

```output
expected 4 to be similar to 4.0001, (epsilon: 1e-9)
```

## Controlling the output of nested expects

When a call to `expect` fails inside your assertion the standard error
message for the custom assertion will be used. In the case of our
_sorted_ assertion fails, the output will be:

```js
expect([1, 3, 2, 4], 'to be sorted');
```

```output
expected [ 1, 3, 2, 4 ] to be sorted

[
    1,
┌─▷
│   3,
└── 2, // should be moved
    4
]
```

We can control the output of the nested expects by changing the
`expect.errorMode` property.

The _bubble_ error mode will hoist the next level error message to this level.

If we change the error mode to _bubble_, we get the following output:

```js
errorMode = 'bubble';
expect([1, 3, 2, 4], 'to be sorted');
```

```output
expected [ 1, 3, 2, 4 ] to equal [ 1, 2, 3, 4 ]

[
    1,
┌─▷
│   3,
└── 2, // should be moved
    4
]
```

In the _nested_ error mode the next level error message is included and
indented underneath the standard error message.

If we change the error mode to _nested_, we get the following output:

```js
errorMode = 'nested';
expect([1, 3, 2, 4], 'to be sorted');
```

```output
expected [ 1, 3, 2, 4 ] to be sorted
  expected [ 1, 3, 2, 4 ] to equal [ 1, 2, 3, 4 ]

  [
      1,
  ┌─▷
  │   3,
  └── 2, // should be moved
      4
  ]
```

The _defaultOrNested_ error mode uses the default mode if the error chain contains a diff;
otherwise it the _nested_ error mode will be used.

If we change the error mode to _defaultOrNested_, we get the following output:

```js
errorMode = 'defaultOrNested';
expect([1, 3, 2, 4], 'to be sorted');
```

```output
expected [ 1, 3, 2, 4 ] to be sorted

[
    1,
┌─▷
│   3,
└── 2, // should be moved
    4
]
```

In the _diff_ error mode will hoist the first found diff as the error message.
If no diff is present, it will fall back to the _default_ error mode.

If we change the error mode to _diff_, we get the following output:

```js
errorMode = 'diff';
expect([1, 3, 2, 4], 'to be sorted');
```

```output
[
    1,
┌─▷
│   3,
└── 2, // should be moved
    4
]
```

## Asynchronous assertions

Unexpected comes with built-in support for asynchronous
assertions. You basically just return a promise from the assertion.

For the purpose of explaining how we can make an asynchronous
assertion we will define a silly type which contains a
value that can only be retrieved after a delay:

```js
function Timelock(value, delay) {
  this.value = value;
  this.delay = delay;
}

Timelock.prototype.getValue = function (cb) {
  var that = this;
  setTimeout(function () {
    cb(that.value);
  }, this.delay);
};
```

It would be pretty nice if we could use
[to satisfy](../../assertions/any/to-satisfy/) on the value of a `Timelock`,
even if the retrieval is delayed. Then we would be able to do stuff
like this:

<!-- unexpected-markdown evaluate:false -->

```js
return expect(
  new Timelock('Hello world'),
  'to satisfy',
  expect.it('have length', 11)
);
```

First we need to define a [type](../addType/) for handling the `Timelock`:

```js
expect.addType({
  name: 'Timelock',
  identify: function (value) {
    return value && value instanceof Timelock;
  },
  inspect: function (value, depth, output) {
    output.jsFunctionName('Timelock');
  },
});
```

```js
expect.addAssertion('<Timelock> to satisfy <any>', function (
  expect,
  subject,
  spec
) {
  return expect.promise(function (run) {
    subject.getValue(
      run(function (value) {
        return expect(value, 'to satisfy', spec);
      })
    );
  });
});
```

Let's see how it works:

<!-- unexpected-markdown async:true -->

```js
return expect(
  new Timelock('Hello world!', 5),
  'to satisfy',
  expect.it('not to match', /!/)
);
```

```output
expected Timelock to satisfy expect.it('not to match', /!/)

expected 'Hello world!' not to match /!/

Hello world!
           ^
```

The best resource for learning more about custom assertions is to look
at how the predefined assertions are built:

[lib/assertions.js](https://github.com/unexpectedjs/unexpected/blob/master/lib/assertions.js)
