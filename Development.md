# Development

## Getting started

Clone the repository and install the developer dependencies:

```
git clone git://github.com/sunesimonsen/unexpected.git unexpected
cd unexpected && npm install
```

## Source files

* *src/unexpected-license.js*:<br>
  The license file
* *src/unexpected-namespace.js*:<br>
  The internal namespace definition
* *src/unexpected-es4-compatible.js*:<br>
  ES5 functions shimmed to work in a ES4 compatible environment
* *src/unexpected-utils.js*:<br>
  Utility functions
* *src/unexpected-equal.js*:<br>
  Deep-equality
* *src/unexpected-inspect.js*:<br>
  Object inspect
* *src/unexpected-core.js*:<br>
  The core part of Unexpected
* *src/unexpected-assertions.js*:<br>
  The core assertions provided by Unexpected
* *src/unexpected-module.js*:<br>
  The module definitions

## Running tests in the console

```
make test
make test-production
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
