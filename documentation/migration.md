---
title: Migration
template: default.ejs
menuPage: false
theme: light
repository: https://github.com/unexpectedjs/unexpected
---

# Migration

Unexpected has from its inception taken backwards compatibility very
seriously. We think this is particularly important for a library
intended for use in testing &ndash; we recognise that comprehensive test
suites are often a large investment and play a central role in ongoing
development of software. This sets a very high bar for any changes.

The project strictly adheres to semver. As such anything that carries
a risk of breakage is carefully considered, must demonstrate significant
benefit to be chosen for inclusion and would mean a new major version.

## Major revisions

### Migration to Unexpected 11

Version 11 is the first major release that makes some carefully
calculated changes in the user facing API which may require test
changes. We have made every effort to minimise the effects on end
users and this extends to the plugin ecosystem which has seen the
most commonly used being made compatible.

The changes are all focused on simplifying the mental model for users.
A handful of constructs which proved themselves to be sources of
confusion and to the best of our knowledge have not seen wide use
have been replaced with **existing** alternatives. This means a safe
upgrade path is available: tests can be updated against the current
version of the library and the changes are forwards compatible.

#### Raise minimum node version to 6+

In our work to continue moving forward we have upgraded many of our
dependencies. Many of these tools have themselves dropped node 4
support and we have decided to do the same. This does not affect our
browser compatibility which remains at the ES5 level and IE11.

#### Using extensions via the API requires calling .clone()

Previously once imported the entirety of the Unexpected API was
immediately available to users which could lead to surprising
results if types or assertions were added to it directly.

In version 11 the top-level of the library has been frozen and
extending the functionality requires an expilcit `.clone()` call
to be made:

<!-- unexpected-markdown evaluate:false -->
<!-- eslint-skip -->
```js
const unexpected = require('unexpected');

const expect = unexpected.clone();

expect.addAssertion(...);
```

#### Use `expect.it()` for assertions on property values

Previously when used in conjunction with [to satisfy](../assertions/any/to-satisfy/)
a property
defined as a function on the right-hand side would be passed the
value to allow further assertions:

<!-- unexpected-markdown evaluate:false -->
```js
const obj = {
  version: 11,
  greeting: 'hello new major'
};

expect(obj, 'to satisfy', {
  year: 2018,
  greeting: function(theValue) {
    expect(theValue, 'to start with', 'hello');
  }
});
```

> Note: this is no longer supported by Unexpected v11

For cases where the value of a property must conform to a more
rigorous set of constraints, we replaced the earlier syntax with
the `expect.it()`:

```js
const obj = {
  version: 11,
  greeting: 'hello new major'
};

expect(obj, 'to satisfy', {
  version: 11,
  greeting: expect.it(function(theValue) {
    expect(theValue, 'to start with', 'hello');
  })
});
```

We believe this is also much more versatile because of the powerful
chaining support provided by `expect.it()`:

```js
expect(obj, 'to satisfy', {
  version: 11,
  greeting: expect
    .it('to be a string')
    .and('to end with', 'major')
    .and(theValue => expect(theValue.split(' '), 'to have length', 3))
});
```

#### Functions are always compared by value

Building upon the `expect.it()` changes, all function comparisons
will now be made using the identity of the function. This is unlike
previous versions where they were treated specially and could lead
to surprising results:

```js
function createErrorIfRequired(message) {
  if (typeof message !== 'string') {
    return null;
  }
  return new Error(message);
}

function somethingThatThrows() {
  throw createErrorIfRequired('failure');
}
```

<!-- unexpected-markdown evaluate:false -->
```js
expect(somethingThatThrows, 'to throw error', createErrorIfRequired);
```

> Note: this is no longer supported by Unexpected v11

The code above is intended to check the error type, but passing a
function directly on the right-hand side would cause it to succeed.
In version 11 it immediately leads to an error and the assertion
must be written more explicitly allowing the issue to be caught:

```js
expect(
  somethingThatThrows,
  'to throw error',
  expect.it('to equal', createErrorIfRequired('failure'))
);
```

When interacting with object types this affects:

- [to satisfy](../assertions/any/to-satisfy/)
- [to have keys satisfying](../assertions/object/to-have-keys-satisfying/)
- [to have a value satisfying](../assertions/object/to-have-a-value-satisfying/)
- [to have values satisfying](../assertions/object/to-have-values-satisfying/)

```js
function myCallback() {}

const options = {
  data: null,
  callback: myCallback
};

expect(options, 'to satisfy', {
  callback: myCallback
});

expect(options, 'to have a value satisfying', myCallback);
```

With array-like types it affects:

- [to satisfy](../assertions/any/to-satisfy/)
- [to have an item satisfying](../assertions/array-like/to-have-an-item-satisfying/)
- [to have items satisfying](../assertions/array-like/to-have-items-satisfying/)

```js
const args = [myCallback];

expect(args, 'to have an item satisfying', myCallback);
```

#### Support for `expect.async` has been removed

`expect.async` was a helper for asynchronous tests. It predates Unexpected's
promise support and we expect that it's very unlikely to be used by anyone.

If you're using it, we recommend that you rewrite the given tests to a
promise-driven flow as part of upgrading to Unexpected 11.

#### `this.errorMode` etc. no longer available in assertion handlers

This syntax has been deprecated since Unexpected 3:

<!-- unexpected-markdown evaluate:false -->
```js
expect.addAssertion('<string> to be foo', (expect, subject) => {
  this.errorMode = 'nested';
  expect(subject, 'to equal', 'foo');
});
```

> Note: this is no longer supported by Unexpected v11

To fix code like this, access the property on `expect` instead:

```js
expect.addAssertion('<string> to be foo', (expect, subject) => {
  expect.errorMode = 'nested';
  expect(subject, 'to equal', 'foo');
});
```
