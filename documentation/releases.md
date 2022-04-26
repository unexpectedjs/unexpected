---
title: Releases
template: default.ejs
menuPage: false
theme: light
repository: https://github.com/unexpectedjs/unexpected
---

# Releases

Here is a very high level overview of the major releases. See the
[changelog](https://github.com/unexpectedjs/unexpected/blob/master/CHANGELOG.md)
for more details.

### v13.0.0 (2022-04-26)

- Drop support for node.js < 14
- Add support for assertions on `Set` instances, [documentation](../assertions/Set/) ([#783](https://github.com/unexpectedjs/unexpected/pull/783))
- Remove legacy support for addAssertion without a subject type ([782](https://github.com/unexpectedjs/unexpected/pull/782))
- Add the parent expect to the prototype chain of a child expect ([785](https://github.com/unexpectedjs/unexpected/pull/785))

### v12.0.0 (2020-11-18)

- Drop support for node.js < 10

### v11.0.0 (2019-01-06)

This release includes backwards-incompatible changes. There's a [migration
guide](../migration/) to help you upgrade.

- Drop support for node.js < 6
- The main export is now a frozen `expect` function. To add assertions and
  install plugins, you must now [`clone()`](../api/clone/) it first
  ([#517](https://github.com/unexpectedjs/unexpected/pull/517))
- Include non-enumerable properties when comparing objects
  ([#482](https://github.com/unexpectedjs/unexpected/pull/482))
- `to satisfy` now compares functions by value. Functions in the spec that are
  to be executed must now be wrapped in `expect.it`
  ([#328](https://github.com/unexpectedjs/unexpected/pull/328))
- The `function` type is now modelled as a subtype of `object`. This means that
  all assertions defined for `object`, such as [`to have properties`](../assertions/object/to-have-properties/), also work for
  functions now ([#448](https://github.com/unexpectedjs/unexpected/pull/448))
- Drop compatibility with pre-10.10.0 diff objects. This will mainly affect
  older plugins ([#407](https://github.com/unexpectedjs/unexpected/pull/407))
- Remove support for `expect.async`
  ([#566](https://github.com/unexpectedjs/unexpected/pull/566))
- Remove long-deprecated support for `this.subject` etc. in assertion handlers
  ([#567](https://github.com/unexpectedjs/unexpected/pull/567))

### v10.0.0 (2015-10-08)

- Assertions are now declared with explicit type requirements for
  the arguments as part of the pattern. This is a breaking change
  that removes support for the old `addAssertion` syntax where the
  subject type(s) were passed as the first argument.
  See [addAssertion](../api/addAssertion/) for more
  information.
- The `to be >`, `to be >=`, `to be <`, and `to be <=` assertions
  have been removed as they clashed with the new type syntax.
  Please use the fully spelled-out variants: `to be greater than`,
  `to be less than or equal to`, etc.
- The `[not] to begin with`, `[not] to end with`, and
  `[not] to contain` assertions now require strings as the needle(s).
  Previously they supported any type, which would then be stringified.
- Inside an assertion you can now access the `errorMode`, `shift`,
  `flags`, `alternations` properties etc. via the `expect` passed
  to the assertion. They can still be accessed via `this` as
  previously, but that is deprecated. (This change actually
  debuted in 9.12.0).
- The `when passed as parameter(s) to`, `when called with`,
  `when decoded as` assertions can now be used standalone, ie. without delegating
  the result to another assertion in the same `expect` call.
  In that case they will provide the result as the fulfillment
  value of the promise.

### v9.0.0 (2015-07-03)

- Build all error messages lazily. This is an internal refactoring
  that makes it possible to generate very different output in the
  text, Ansi, and HTML modes using the magicpen
  [raw](https://github.com/sunesimonsen/magicpen#raw) feature. This
  change mostly affects plugins, and we have updated all the official
  plugins accordingly, so please upgrade those to the latest version
  when you upgrade to Unexpected 9.
- Made it possible to tweak the default error message when creating
  assertions. See [addAssertion](../api/addAssertion/) for more
  information.
- Expanded the `to have message` assertion defined for `Error`
  instances to allow matching a serialization other than plain text:
  `to have ansi message`, `to have html message`.
- The `to contain` assertion defined for strings: When the assertion fails,
  display a "diff" where partial matches are highlighted.

### v8.0.0 (2015-06-10)

- All errors originating from assertions are now instances of
  [`UnexpectedError`](../api/UnexpectedError/), which can be manipulated before being
  serialized.
- Error messages and diffs are now built lazily, improving
  performance.
- Unexpected now detects created promises that were never returned and
  fails synchronously. This will uncover some extremely nasty bugs
  where the test suite succeeds when it should actually fail. This
  feature only works in [Mocha](https://mochajs.org/) and [Jasmine](https://jasmine.github.io/).
- Deprecated error.output, please use error.getErrorMessage() instead.
- Deprecated error.label, please use error.getLabel() instead.
- `when decoded as`, `when called with`, `when passed as parameter to`, `when passed as parameters to`: Require the 4th argument to be
  a string specifying an assertion. Previously a function was also
  allowed, which turned out to be error prone. This also affects all
  plugins that use the internal function `Assertion.prototype.shift`
  to delegate to other assertions.
- Nested error mode: Don't repeat the subject when it takes up
  multiple lines and is identical to the parent subject.
- Added a new `bubbleThrough` error mode that will make the error
  bubble all the way to the top, mainly useful internally.
- Added [`to error`](../assertions/function/to-error/) assertion.
- Minor bugfixes and output tweaks.

### v7.0.0 (2015-04-17)

- Support for
  [asynchronous assertions using promises](../api/addAssertion/#asynchronous-assertions).
  All built-in assertions that delegate to other assertions (such as `to satisfy`)
  have been rewritten to support this. The change is fully backwards compatible.
- Removed support for the `to be an array of` and
  `to be an array of (strings|numbers|...)` assertions. There are better and
  more flexible alternatives.
- Renamed assertions so that the subject type isn't mentioned in the assertion name.
  The old names are kept around as aliases for now. These assertions are affected:
  - `to be an array whose items satisfy` => `to have items satisfying`
  - `to be an (object|hash|map) whose keys satisfy` => `to have keys satisfying`
  - `to be an (object|hash|map) whose values satisfy` => `to have values satisfying`
    Also, these 3 assertions no longer pass for empty collections.
- New `when passed as parameter to constructor` and `when passed as parameter to async` "adverbial" assertions.
- New `when decoded as` "adverbial" assertion for `Buffer` instances.
- New `to have message` assertion defined for `Error` instances.
- A lot of output improvements and minor tweaks.

### v6.0.0 (2015-03-03)

- New documentation and [corresponding site](https://unexpected.js.org/).
- Use `Object.is`/the [SameValue algorithm](http://ecma-international.org/ecma-262/5.1/#sec-9.12) when checking equality of primitive values (the `to be` and `to equal` assertions).
- Tweaked the output of numerous assertions.
- Constrained `to be empty` and `to have length` to only work with strings and array-like objects.
- Renamed the `arrayLike` type to `array-like`.
- Changed style names and added theming support (mostly internal).
- Removed grammatically incorrect assertions.

### v5.0.0 (2014-12-22)

- Add custom diffs for many assertions.
- Added `to satisfy` and `expect.it`.
- Removed the word "minimalistic" from the sales pitch in the documention :)

### v4.0.0 (2014-08-13)

- Added type system for assertion subjects.
- Use [magicpen](https://github.com/sunesimonsen/magicpen) for all generating
  all output. No longer rely on the tests runner to render diffs.

### v3.0.0 (2014-03-21)

- Hand an expect function to custom assertions.
- Added the ability for an assertion to control how the error message of nested
  expect calls are formatted.

### v2.0.0 (2013-12-20)

- `to have properties` gets introduced.
- Tightened up equality semantics.

### v1.0.0 (2013-09-16)

- First release that's not 0.x!
