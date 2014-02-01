REPORTER = dot

lint:
	@./node_modules/.bin/jshint src/*.js test/*.js

.PHONY: lint

lib/unexpected.js: lint src/unexpected-license.js src/unexpected-namespace.js src/unexpected-es4-compatible.js src/unexpected-es5-compatible.js src/unexpected-utils.js src/unexpected-equal.js src/unexpected-inspect.js src/unexpected-core.js src/unexpected-assertions.js src/unexpected-module.js
	@echo "Build unexpected for production"
	@echo "(function () {" > lib/unexpected.js

	@cat src/unexpected-license.js \
         src/unexpected-namespace.js \
         src/unexpected-es4-compatible.js \
         src/unexpected-es5-compatible.js \
         src/unexpected-utils.js \
         src/unexpected-equal.js \
         src/unexpected-inspect.js \
         src/unexpected-core.js \
         src/unexpected-assertions.js \
         src/unexpected-module.js | sed -e 's/^/    /' | sed -e 's/^\s*$$//' | sed -e 's/\/\*\(global\|exported\).*//' >> lib/unexpected.js

	@echo "}());" >> lib/unexpected.js

lib/unexpected.es5.js: lint src/unexpected-license.js src/unexpected-namespace.js src/unexpected-es5-compatible.js src/unexpected-utils.js src/unexpected-equal.js src/unexpected-inspect.js src/unexpected-core.js src/unexpected-assertions.js src/unexpected-module.js
	@echo "Build unexpected for production"
	@echo "(function () {" > lib/unexpected.es5.js

	@cat src/unexpected-license.js \
         src/unexpected-namespace.js \
         src/unexpected-es5-compatible.js \
         src/unexpected-utils.js \
         src/unexpected-equal.js \
         src/unexpected-inspect.js \
         src/unexpected-core.js \
         src/unexpected-assertions.js \
         src/unexpected-module.js | sed -e 's/^/    /' | sed -e 's/^\s*$$//' | sed -e 's/\/\*\(global\|exported\).*//' >> lib/unexpected.es5.js

	@echo "}());" >> lib/unexpected.es5.js

test: lint
	@./node_modules/.bin/mocha-phantomjs test/tests.html

.PHONY: test

test-production: lint lib/unexpected.js lib/unexpected.es5.js
	@./node_modules/.bin/mocha-phantomjs test/tests.production.html
	@./node_modules/.bin/mocha-phantomjs test/tests.production.es5.html

.PHONY: test-production

coverage: lib/unexpected.js
	@rm -rf lib-cov
	@jscoverage lib lib-cov
	@COVERAGE=1 ./node_modules/.bin/mocha \
        --require ./test/common \
        --reporter html-cov > lib-cov/index.html
	@echo "Coverage report has been generated to lib-cov/index.html"

.PHONY: coverage

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

release-patch: git-dirty-check lib/unexpected.js lib/unexpected.es5.js test-production git-commit-lib
	npm version patch
	@echo Patch release ready to be publised to NPM

.PHONY: release-patch

release-minor: git-dirty-check lib/unexpected.js lib/unexpected.es5.js test-production git-commit-lib
	npm version minor
	@echo Minor release ready to be publised to NPM

.PHONY: release-minor

release-major: git-dirty-check lib/unexpected.js lib/unexpected.es5.js test-production git-commit-lib
	npm version major
	@echo Major release ready to be publised to NPM

.PHONY: release-major
