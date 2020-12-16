# expect.child()

Create a new `expect` function that maintains a close relationship
to the instance it is created from. The child instance has access to
all assertions, types, and styles defined in the parent, even ones
that are added after `child()` is called.

This is mostly useful when creating plugins that have secondary dependencies
that can aid in implementing the plugin itself, but which should not
leak out into the "primary" instance belonging to the user. This can avoid
a class of dependency hell-like problems -- for instance when a plugin
depends on another plugin that's also installed directly by the user at
the top level, and most likely in an incompatible version.

The child instance has the ability to export assertions, types, and styles
to the parent using the `exportAssertion`, `exportType`, and `exportStyle`
methods. These methods have the same signature as `addAssertion`, `addType`,
and `addStyle`, respectively, but affect the parent `expect`:

```js
const childExpect = expect.child();

// Only available in childExpect:
childExpect.addAssertion(
  '<string> to begin with foo',
  function (expect, subject) {
    expect(subject, 'to begin with', 'foo');
  }
);

// Available in parentExpect, but has access to "to begin with foo" internally:
childExpect.exportAssertion('<string> to foobar', function (expect, subject) {
  expect.errorMode = 'nested';
  expect(subject, 'to begin with foo').and('to end with', 'bar');
});

expect('fo0bar', 'to foobar');
```

```output
expected 'fo0bar' to foobar
  expected 'fo0bar' to begin with foo

  fo0bar
  ^^
```

Note that in order to reference a type in the signature used with
`exportAssertion`, the type itself must also be exported to the parent `expect`.
In other words, this won't work:

```js
const childExpect = expect.child();

childExpect.addType({
  name: 'foosomething',
  identify: function (value) {
    return /^foo/.test(String(value));
  },
});

childExpect.exportAssertion(
  '<foosomething> to end with bar',
  function (expect, subject) {
    expect(subject, 'to end with', 'bar');
  }
);
```

```output
Unknown type: foosomething in <foosomething> to end with bar
```

It can be fixed by exporting the `foosomething` type instead of just adding it
to the child.
