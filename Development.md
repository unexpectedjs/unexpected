# Development

## Getting started

Clone the repository and install the developer dependencies:

```
git clone git://github.com/unexpectedjs/unexpected.git unexpected
cd unexpected && npm install
```

## Source files

* *lib/index.js*:<br>
  The entry point for the library.
* *lib/Unexpected.js*:<br>
  The core of the library.
* *lib/Assertion.js*:<br>
  The class that assertions are instantiated from.
* *lib/utils.js*:<br>
  Utility functions
* *lib/styles.js*:<br>
  MagicPen styles for controling the output.
* *lib/types.js*:<br>
  Type definitions for every type Unexpected understands.
* *lib/assertions.js*:<br>
  All assertions that is included in the core library.

## Running tests in the console

```
make test
make test-phantomjs
```

## Running tests in the browser

```
make test-browser
```

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
