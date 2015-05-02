---
template: default.ejs
theme: dark
title: Unexpected
---

# Welcome to Unexpected
# The extensible BDD assertion toolkit

```javascript
expect({ text: 'f00!' }, 'to equal', { text: 'foo!' });
```

```output
expected { text: 'f00!' } to equal { text: 'foo!' }

{
  text: 'f00!' // should equal 'foo!'
               // -f00!
               // +foo!
}
```

## Badges

[![NPM version](https://badge.fury.io/js/unexpected.svg)](http://badge.fury.io/js/unexpected)
[![Build Status](https://travis-ci.org/unexpectedjs/unexpected.svg?branch=master)](https://travis-ci.org/unexpectedjs/unexpected)
[![Coverage Status](https://coveralls.io/repos/unexpectedjs/unexpected/badge.svg)](https://coveralls.io/r/unexpectedjs/unexpected)
[![Dependency Status](https://david-dm.org/unexpectedjs/unexpected.svg)](https://david-dm.org/unexpectedjs/unexpected)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/unexpectedjs/unexpected?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Features

- Extensible
- Fast
- Provides really nice error messages
- Helps you if you misspells assertions
- Compatible with all test frameworks.
- Node.JS ready (`require('unexpected')`)
- Supports [asynchronous assertions using promises](/api/addAssertion/#asynchronous-assertions)
- Single global with no prototype extensions or shims.
- Cross-browser: works on Chrome, Firefox, Safari, Opera, IE6+,
  (IE6-IE8 with [es5-shim](https://github.com/es-shims/es5-shim))

### Node

Install it with NPM or add it to your `package.json`:

```
$ npm install unexpected
```

Then:

```js#evaluate:false
var expect = require('unexpected');
```

### Browser

Include `unexpected.js`.

```html
<script src="unexpected.js"></script>
```

this will expose the expect function under the following namespace:

```js#evaluate:false
var expect = weknowhow.expect;
```

### RequireJS

Include the library with RequireJS the following way:

```js#evaluate:false
require.config({
    paths: {
        unexpected: 'path/to/unexpected'
    }
});

define(['unexpected'], function (expect) {
   // Your code
});
```

## Using Unexpected with a test framework

For example, if you create a test suite with
[mocha](http://github.com/visionmedia/mocha).

Let's say we wanted to test the following program:

**math.js**

```js#evaluate:false
function add (a, b) { return a + b; };
```

Our test file would look like this:

```js#evaluate:false
describe('math.js', function () {
  describe('add', function () {
    it('is a function', function () {
      expect(add, 'to be a', 'function');
    });

    it('does addition on numbers', function () {
      expect(add(1, 3), 'to be', 4);
    });
  });
});
```

If a certain expectation fails, an exception will be raised which gets captured
and shown/processed by the test runner.

## Source

The source for Unexpected can be found on
[Github](https://github.com/unexpectedjs/unexpected).

## Releases

### 7.0.0

* Support for
  [asynchronous assertions using promises](/api/addAssertion/#asynchronous-assertions).
  All built-in assertions that delegate to other assertions (such as `to satisfy`)
  have been rewritten to support this. The change is fully backwards compatible.
* Removed support for the `to be an array of` and
  `to be an array of (strings|numbers|...)` assertions. There are better and
  more flexible alternatives.
* Renamed assertions so that the subject type isn't mentioned in the assertion name.
  The old names are kept around as aliases for now. These assertions are affected:
    * `to be an array whose items satisfy` => `to have items satisfying`
    * `to be an (object|hash|map) whose keys satisfy` => `to have keys satisfying`
    * `to be an (object|hash|map) whose values satisfy` => `to have values satisfying`
  Also, these 3 assertions no longer pass for empty collections.
* New `when passed as parameter to constructor` and `when passed as parameter to async` "adverbial" assertions.
* New `when decoded as` "adverbial" assertion for `Buffer` instances.
* New `to have message` assertion defined for `Error` instances.
* A lot of output improvements and minor tweaks.

### 6.0.0

* New documentation and [corresponding site](https://unexpectedjs.github.io/).
* Use `Object.is`/the [SameValue](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue) when checking equality of primitive values (the `to be` and `to equal` assertions).
* Tweaked the output of numerous assertions.
* Constrained `to be empty` and `to have length` to only work with strings and array-like objects.
* Renamed the `arrayLike` type to `array-like`.
* Changed style names and added theming support (mostly internal).
* Removed grammatically incorrect assertions.

## MIT License

Copyright (c) 2013 Sune Simonsen <sune@we-knowhow.dk>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
