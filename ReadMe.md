# Unexpected

Minimalistic BDD assertion toolkit based on
[expect.js](https://github.com/LearnBoost/expect.js)

```js
expect(window.r, 'to be', undefined);
expect({ a: 'b' }, 'to equal', { a: 'b' });
expect(5, 'to be a', 'number');
expect([], 'to be an', 'array');
expect(window, 'to not be an', Image);
```

[![Build Status](https://travis-ci.org/sunesimonsen/unexpected.png)](https://travis-ci.org/sunesimonsen/unexpected)

[Run the test in the browser](http://sunesimonsen.github.io/unexpected/test/tests.html)

## Features

- Fast
- Provides really nice error messages
- Helps you if you misspells assertions
- Compatible with all test frameworks.
- Node.JS ready (`require('unexpected')`).
- Single global with no prototype extensions or shims.
- Cross-browser: works on IE6+, Firefox, Safari, Chrome, Opera.

## How to use

### Node

Install it with NPM or add it to your `package.json`:

```
$ npm install unexpected
```

Then:

```js
var expect = require('unexpected');
```

### Browser

Include the `unexpected.js` found at the lib directory of this
repository.

```html
<script src="unexpected.js"></script>
```

this will expose the expect function under the following namespace:

```js
var expect = weknowhow.expect;
```

### RequireJS

Include the library with RequireJS the following way:

```js
define(['unexpected/lib/unexpected.js'], funtion (expect) {
   // Your code
});
```

## API

### to be ok

asserts that the value is _truthy_

**ok** / **truthy** / **falsy**: asserts that the value is _truthy_ or not

```js
expect(1, 'to be ok');
expect(true, 'to be ok');
expect(true, 'to not be falsy');
expect({}, 'to be truthy');
expect(0, 'to not be ok');
expect(0, 'to be falsy');
expect(null, 'to be falsy');
expect(undefined, 'to be falsy');
```

**be**: asserts `===` equality

```js
expect(obj, 'to be', obj);
expect(obj, 'to not be', {});
expect(1, 'to be', 1);
expect(NaN, 'to not be', NaN);
expect(1, 'to not be', true);
expect('1', 'to not be', 1);
expect(null, 'to not be', undefined);
```

**equal**: asserts loose equality that works with objects

```js
expect({ a: 'b' }, 'to equal', { a: 'b' });
expect(1, 'to equal', '1');
expect(null, 'to not equal', '1');
var now = new Date();
expect(now, 'to equal', now);
expect(now, 'to equal', new Date(now.getTime()));
expect({ now: now }, 'to equal', { now: now });
```

**a** / **an**: asserts `typeof` with support for `array` type and `instanceof`

```js
expect(5, 'to be a', 'number');
expect(5, 'to be a number');

expect([], 'to be an', 'array');
expect([], 'to be an array');
expect([], 'to be an', Array);

expect([], 'to be an', 'object');
expect([], 'to be an object');

expect(null, 'to not be an', 'object');
expect(null, 'to not be an object');

expect(true, 'to be a', 'boolean');
expect(true, 'to be a boolean');

expect("".substring, 'to be a', 'function');
expect("".substring, 'to be a function');
```

**match**: asserts `String` regular expression match

```js
expect('test', 'to match', /.*st/);
expect('test', 'to not match', /foo/);
expect(null, 'to not match', /foo/);
```

**contain**: asserts indexOf for an array or string

```js
expect([1, 2], 'to contain', 1);
expect('hello world', 'to contain', 'world');
expect(null, 'to not contain', 'world');
```

**length**: asserts array `.length`

```js
expect([], 'to have length', 0);
expect([1,2,3], 'to have length', 3);
expect([1,2,3], 'to not have length', 4);
```

**empty**: asserts that an array is empty or not

```js
expect([], 'to be empty');
expect('', 'to be empty');
expect({}, 'to be empty');
expect({ length: 0, duck: 'typing' }, 'to be empty');
expect({ my: 'object' }, 'to not be empty');
expect([1,2,3], 'to not be empty');
```

**property**: asserts presence of an own property (and value optionally)

```js
expect([1, 2], 'to have property', 'length');
expect([1, 2], 'to have property', 'length', 2);
expect({a: 'b'}, 'to have property', 'a');
expect({a: 'b'}, 'to have property', 'a', 'b');
expect({a: 'b'}, 'to have property', 'toString');
expect({a: 'b'}, 'to have own property', 'a');
expect(Object.create({a: 'b'}), 'to not have own property', 'a');
```

**key** / **keys**: asserts the presence of a key. Supports the `only` modifier

```js
expect(null, 'to not have key', 'a');
expect({ a: 'b' }, 'to have key', 'a');
expect({ a: 'b' }, 'to not have key', 'b');
expect({ a: 'b', c: 'd' }, 'to not only have key', 'a');
expect({ a: 'b', c: 'd' }, 'to only have keys', 'a', 'c');
expect({ a: 'b', c: 'd' }, 'to only have keys', ['a', 'c']);
expect({ a: 'b', c: 'd', e: 'f' }, 'to not only have keys', ['a', 'c']);
```

**throw exception** / **throw error**: asserts that the `Function` throws or not when called

```js
expect(fn, 'to throw exception'); // synonym of throwException
expect(fn, 'to throw exception', function (e) { // get the exception object
  expect(e, 'to be a', SyntaxError);
});
expect(fn, 'to throw exception', /matches the exception message/);
expect(fn, 'to throw error', 'matches the exact exception message');
expect(fn2, 'to not throw error');
```

**within**: asserts a number within a range

```js
expect(0, 'to be within', 0, 4);
expect(1, 'to be within', 0, 4);
expect(4, 'to be within', 0, 4);
expect(-1, 'to not be within', 0, 4);
expect(5, 'to not be within', 0, 4);
```

**greater than** / **above**: asserts `>`

```js
expect(3, 'to be greater than', 2);
expect(1, 'to be above', 0);
expect(4, 'to be >', 3);
expect(4, '>', 3);
```

**greater than or equals to**: asserts `>`

```js
expect(3, 'to be greater than or equals to', 2);
expect(3, 'to be >=', 3);
expect(3, '>=', 3);
```

**less than** / **below**: asserts `<`

```js
expect(0, 'to be less than', 4);
expect(0, 'to be below', 1);
expect(3, 'to be <', 4);
expect(3, '<', 4);
```

**less than or equals to**: asserts `>`

```js
expect(0, 'to be less than or equals to', 4);
expect(4, 'to be <=', 4);
expect(3, '<=', 4);
```

**positive**: assert that a number is positive

```js
expect(3, 'to be positive');
```

**negative**: assert that a number is negative

```js
expect(-1, 'to be negative');
```

**fail**: explicitly forces failure.

```js
expect.fail()
expect.fail('Custom failure message')
expect.fail('{0} was expected to be {1}', 0, 'zero');
```

## Using with a test framework

For example, if you create a test suite with
[mocha](http://github.com/visionmedia/mocha).

Let's say we wanted to test the following program:

**math.js**

```js
function add (a, b) { return a + b; };
```

Our test file would look like this:

```js
describe('test suite', function () {
  it('should expose a function', function () {
    expect(add, 'to be a', 'function');
  });

  it('should do math', function () {
    expect(add(1, 3), 'to be', 4);
  });
});
```

If a certain expectation fails, an exception will be raised which gets captured
and shown/processed by the test runner.

## Running tests

Clone the repository and install the developer dependencies:

```
git clone git://github.com/sunesimonsen/unexpected.git unexpected
cd unexpected && npm install
```

### Node

`npm test`

## Credits

(The MIT License)

Copyright (c) 2013 Sune Simonsen &lt;sune@we-knowhow.dk&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the 'Software'), to deal in the Software without
restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### 3rd-party

Heavily borrows from [expect.js](https://github.com/LearnBoost/expect.js) by 
Guillermo Rauch - MIT.
