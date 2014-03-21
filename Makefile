REPORTER = dot

TARGETS ?= unexpected.js unexpected.es5.js

lint:
	@./node_modules/.bin/jshint lib/*.js test/*.js

.PHONY: lint

unexpected.js: lint lib/*
	@echo "(function () {" > $@

	@cat lib/unexpected-license.js \
         lib/unexpected-namespace.js \
         lib/unexpected-es4-compatible.js \
         lib/unexpected-es5-compatible.js \
         lib/unexpected-utils.js \
         lib/unexpected-equal.js \
         lib/unexpected-inspect.js \
         lib/unexpected-core.js \
         lib/unexpected-assertions.js \
         lib/unexpected-module.js | sed -e 's/^/    /' | sed -e 's/^\s*$$//' | sed -e 's/\/\*\(global\|exported\).*//' >> $@

	@echo "}());" >> $@

unexpected.es5.js: lint lib/*
	@echo "(function () {" > $@

	@cat lib/unexpected-license.js \
         lib/unexpected-namespace.js \
         lib/unexpected-es5-compatible.js \
         lib/unexpected-utils.js \
         lib/unexpected-equal.js \
         lib/unexpected-inspect.js \
         lib/unexpected-core.js \
         lib/unexpected-assertions.js \
         lib/unexpected-module.js | sed -e 's/^/    /' | sed -e 's/^\s*$$//' | sed -e 's/\/\*\(global\|exported\).*//' >> $@

	@echo "}());" >> $@

test-phantomjs: lint
	@$(eval QUERY=$(shell node -e "console.log(decodeURIComponent(process.argv.pop()))" "${grep}")) \
    ./node_modules/.bin/mocha-phantomjs test/tests.html?grep=${QUERY}

test: lint
	mocha -R spec

.PHONY: test

test-production: lint ${TARGETS}
	@./node_modules/.bin/mocha-phantomjs test/tests.production.html
	@./node_modules/.bin/mocha-phantomjs test/tests.production.es5.html

.PHONY: test-production

lib-cov: lib/*
	@rm -rf lib-cov
	@jscoverage --no-highlight lib $@

lib-cov/index.html: lib-cov
	@COVERAGE=1 ./node_modules/.bin/mocha \
        --require ./test/common \
        --reporter html-cov > $@
	@echo Coverage report has been generated to $@

coverage: lib-cov/index.html

test-browser:
	@./node_modules/.bin/serve .

.PHONY: test-browser

git-dirty-check:
ifneq ($(shell git describe --always --dirty | grep -- -dirty),)
	$(error Working tree is dirty, please commit or stash your changes, then try again)
endif

.PHONY: git-dirty-check

git-commit-lib:
	git add lib
	git ci -m "Build unexpected for production"

.PHONY: git-commit-lib

release-patch: git-dirty-check ${TARGETS} test-production git-commit-lib
	npm version patch
	@echo Patch release ready to be publised to NPM

.PHONY: release-patch

release-minor: git-dirty-check ${TARGETS} test-production git-commit-lib
	npm version minor
	@echo Minor release ready to be publised to NPM

.PHONY: release-minor

release-major: git-dirty-check ${TARGETS} test-production git-commit-lib
	npm version major
	@echo Major release ready to be publised to NPM

.PHONY: release-major

.PHONY: clean
clean:
	-rm -fr ${TARGETS} lib-cov
