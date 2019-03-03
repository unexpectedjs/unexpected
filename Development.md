# Development

## Getting started

Clone the repository and install the developer dependencies:

```
git clone git://github.com/unexpectedjs/unexpected.git unexpected
cd unexpected && npm install
```

## Source files

- _lib/index.js_:<br>
  The entry point for the library.
- _lib/Unexpected.js_:<br>
  The core of the library.
- _lib/Assertion.js_:<br>
  The class that assertions are instantiated from.
- _lib/utils.js_:<br>
  Utility functions
- _lib/styles.js_:<br>
  MagicPen styles for controling the output.
- _lib/types.js_:<br>
  Type definitions for every type Unexpected understands.
- _lib/assertions.js_:<br>
  All assertions that is included in the core library.

## Running tests in the console

```
make test
make test-phantomjs
```

## Running tests in the browser

```
make test-chrome-headless
```

or you can run them interactively through [Karma](http://karma-runner.github.io/):

```
make test-browser
```

click the debug button to open the HTML runner.

## Coverage report

```
make coverage
```

## Build a new release

Make sure that you have commited all changes before making the release.

The following make-targets will build the production version of _unexpected_,
commit the generated file and tag a new version using NPM.

### Patch release

make release patch

### Minor release

make release minor

### Major release

make release major
