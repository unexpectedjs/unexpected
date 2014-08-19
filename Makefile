REPORTER = dot

TARGETS ?= unexpected.js unexpected.es5.js

lint:
	@./node_modules/.bin/jshint lib/*.js test/*.js

.PHONY: lint

unexpected.js: lint lib/*
	(echo '/*!' && <LICENSE sed -e's/^/ * /' | sed -e's/\s+$$//' && echo ' */' && ./node_modules/.bin/browserify -p bundle-collapser/plugin -e lib -s weknowhow.expect) > $@

unexpected.es5.js: lint lib/*
	(echo '/*!' && <LICENSE sed -e's/^/ * /' | sed -e's/\s+$$//' && echo ' */' && ./node_modules/.bin/browserify -p bundle-collapser/plugin -e lib -s weknowhow.expect -u lib/shim-es4.js) > $@

test-phantomjs: lint unexpected.js
	@$(eval QUERY=$(shell node -e "console.log(decodeURIComponent(process.argv.pop()))" "${grep}")) \
    ./node_modules/.bin/mocha-phantomjs test/tests.html?grep=${QUERY}

test:
	mocha -R spec

.PHONY: test

test-production: lint ${TARGETS}
	@./node_modules/.bin/mocha-phantomjs test/tests.production.html
	@./node_modules/.bin/mocha-phantomjs test/tests.production.es5.html

.PHONY: test-production

coverage: lib/*
	NODE_ENV=development ./node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha -- --reporter dot

.PHONY: test-browser
test-browser: unexpected.js
	@./node_modules/.bin/serve .

travis: lint test test-production coverage
	<coverage/lcov.info ./node_modules/coveralls/bin/coveralls.js

.PHONY: git-dirty-check
git-dirty-check:
ifneq ($(shell git describe --always --dirty | grep -- -dirty),)
	$(error Working tree is dirty, please commit or stash your changes, then try again)
endif

.PHONY: release-%
release-%: git-dirty-check ${TARGETS} test-production
	npm version $*
	@echo $* release ready to be publised to NPM
	@echo Remember to push tags

.PHONY: clean
clean:
	-rm -fr ${TARGETS} coverage
