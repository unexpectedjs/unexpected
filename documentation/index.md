---
template: default.ejs
theme: dark
title: Unexpected
repository: https://github.com/unexpectedjs/unexpected
---

# Welcome to Unexpected

# The extensible BDD assertion toolkit

```js
const library = {
  name: 'un3xp3c73d',
  created: 2013,
  site: 'https://unexpected.js.org',
};

expect(library, 'to satisfy', {
  name: 'Unexpected',
  created: 2013,
});
```

```output
expected { name: 'un3xp3c73d', created: 2013, site: 'https://unexpected.js.org' }
to satisfy { name: 'Unexpected', created: 2013 }

{
  name: 'un3xp3c73d', // should equal 'Unexpected'
                      //
                      // -un3xp3c73d
                      // +Unexpected
  created: 2013,
  site: 'https://unexpected.js.org'
}
```

## Badges

[![NPM version](https://badge.fury.io/js/unexpected.svg)](https://www.npmjs.com/package/unexpected)
[![Build Status](https://github.com/unexpectedjs/unexpected/workflows/Tests/badge.svg)](https://github.com/unexpectedjs/unexpected/actions)
[![Coverage Status](https://coveralls.io/repos/unexpectedjs/unexpected/badge.svg)](https://coveralls.io/github/unexpectedjs/unexpected)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/unexpectedjs/unexpected?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![Github](https://img.shields.io/github/stars/unexpectedjs/unexpected.svg?label=Star&maxAge=2592000&style=flat)](https://github.com/unexpectedjs/unexpected)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=cjVWSDFIaERKWVdxc2s5bStaY08vMUFwbW1NbTdzZHJmVXBCUjBlemo3Yz0tLU5iL3I0L3Z4elVhZjBTbWtvbmpHRnc9PQ==--692805fea09bec4c4ea7c898fa9208a0fa61283e)](https://www.browserstack.com/automate/public-build/cjVWSDFIaERKWVdxc2s5bStaY08vMUFwbW1NbTdzZHJmVXBCUjBlemo3Yz0tLU5iL3I0L3Z4elVhZjBTbWtvbmpHRnc9PQ==--692805fea09bec4c4ea7c898fa9208a0fa61283e)

## Features

- Extensible
- Fast
- Provides really nice error messages
- Helps if you misspell assertions
- Compatible with all test frameworks
- Node.js ready (`require('unexpected')`)
- Supports [asynchronous assertions using promises](./api/addAssertion/#asynchronous-assertions)
- Single global with no prototype extensions or shims
- Cross-browser: works on Chrome, Firefox, Safari, Opera, IE11, Edge

### Node

Install it with NPM or add it to your `package.json`:

```
$ npm install --save-dev unexpected
```

Then:

<!-- unexpected-markdown evaluate:false -->
<!-- eslint-disable import/no-extraneous-dependencies -->

```js
const expect = require('unexpected');
```

### Browser

Include `unexpected.js`.

```html
<script src="unexpected.js"></script>
```

This will expose the `expect` function under the following namespace:

<!-- unexpected-markdown evaluate:false -->

```js
const expect = weknowhow.expect;
```

### RequireJS

Include the library with RequireJS the following way:

<!-- unexpected-markdown evaluate:false -->

```js
require.config({
  paths: {
    unexpected: 'path/to/unexpected',
  },
});

define(['unexpected'], function (expect) {
  // Your code
});
```

## Using Unexpected with a test framework

For example, if you create a test suite with
[mocha](https://github.com/mochajs/mocha).

Let's say we wanted to test the following program:

**math.js**

<!-- unexpected-markdown evaluate:false -->

```js
function add(a, b) {
  return a + b;
}
```

Our test file would look like this:

<!-- unexpected-markdown evaluate:false -->

```js
describe('math.js', function () {
  describe('add', function () {
    it('is a function', function () {
      expect(add, 'to be a', 'function');
    });

    it('adds numbers', function () {
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

See [the releases page](releases/).

## Configure the error output

### Disable stack trace trimming

You can disable stack trace trimming the following way:

```
UNEXPECTED_FULL_TRACE=true mocha
```

You can achieve the same in the browser by setting the query parameter
`full-trace` to `true`.

### Controlling the inspection depth

To change the level subtrees gets dotted out, you can set the inspection depth
the following way:

```
UNEXPECTED_DEPTH=9 mocha
```

You can achieve the same in the browser by setting the query parameter `depth`
to the inspection depth you want.

## MIT License

Copyright (c) 2013 Sune Simonsen <mailto:sune@we-knowhow.dk>

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
