---
title: Migration
template: default.ejs
theme: light
repository: https://github.com/unexpectedjs/unexpected
---

# Migration

Unexpected has from its inception taken backwards compatibiity very
seriously. We think this is particularly important for a library
intended for use in testing - we recognise that comprehensive test
suites are often a large investment and as a central role in ongoing
development of software. This sets a very high bar for any changes.

The project strictly adheres to semver. As such anything that carries
a risk of breakage is carefully considered and must demonstrate
significant benefit to be considered and would mean a new major version.

## Major revisions

### Unexpected 11

Version 11 is the first major release that makes some carefully
calculated changes in the user facing API that may require test
changes. We have made every effort to minimise the effects on end
users and this extends to the plugin ecosystem in which the most
commonly used have been made compatible.

The changes are all focused on simplifying the mental model for users.
A handful of constructs which proved themselves to be sources of
confusion and to the best of our knowledge have not
seen wide use have been replaced with **existing** alternatives. This
means tests can be updated against the current version of the library
and thus the changes are forwards compatible.

#### Functions are always compared by value

Previously when using "to satisfy" a property defined as a function
on the right-hand side would be given the value from the subject and
further assertions could be made.

```js#evaluate:false
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

This feature was not widely known and instead you can now write
the same using `expect.it()`:

```js
const obj = {
  version: 11,
  greeting: 'hello new major'
};

expect(obj, 'to satisfy', {
  version: 11,
  greeting: expect.it('to start with', 'hello')
});
```

We believe this is also much more versatile because of the powerful
chaining support provided by `expect.it()`:

```js
expect(obj, 'to satisfy', {
  version: 11,
  greeting: expect.it('to be a string').and('to end with', 'major')
});
```

#### Use of extensions via the API requires calling .clone()

Previously once imported the entirety of the Unexpected API was
immediately available to users which could lead to surprising
results if types or assertions were added to it directly.

In version 11 the top-level of the library has been frozen and
extending the functionality requires an explcit `.clone()` call
to be made:

```js#evaluate:false
const unexpected = require('unexpected');

const expect = unexpected.clone();

expect.addAssertion(...);
```

#### Raise minimum node version to 6+

In our work to continue moving forward we have upgraded many of our
dependencies. Many of these tools have themselves dropped node 4
support and we have decided to do the same. This does not affect our
browser compatibility which remains at the ES5 level and IE11.
