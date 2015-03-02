---
template: default.ejs
theme: dark
title: Unexpected
---

# Welcome to Unexpected
### The extensible BDD assertion toolkit

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

[![NPM version](https://badge.fury.io/js/unexpected.svg)](http://badge.fury.io/js/unexpected)
[![Build Status](https://travis-ci.org/sunesimonsen/unexpected.svg?branch=master)](https://travis-ci.org/sunesimonsen/unexpected)
[![Coverage Status](https://coveralls.io/repos/sunesimonsen/unexpected/badge.svg)](https://coveralls.io/r/sunesimonsen/unexpected)
[![Dependency Status](https://david-dm.org/sunesimonsen/unexpected.svg)](https://david-dm.org/sunesimonsen/unexpected)

## Features

- Extensible
- Fast
- Provides really nice error messages
- Helps you if you misspells assertions
- Compatible with all test frameworks.
- Node.JS ready (`require('unexpected')`).
- Single global with no prototype extensions or shims.
- Cross-browser: works on Chrome, Firefox, Safari, Opera, IE6+,
  (IE6-IE8 with [es5-shim](https://github.com/es-shims/es5-shim)).

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
