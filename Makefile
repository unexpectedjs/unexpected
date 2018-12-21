REPORTER = dot

TARGETS ?= unexpected.js unexpected.js.map

CHEWBACCA_THRESHOLD ?= 25

TEST_SOURCES_MARKDOWN =  $(shell find documentation -name '*.md')

MODERN_NODE = $(shell node -p -e 'require("node-version-check").gte(require("fs").readFileSync(".nvmrc", "utf8").trim())')

lint:
	npm run lint

.PHONY: lint

build/lib: lib/*
	./node_modules/.bin/babel --copy-files --out-dir build/lib --quiet lib

build/test: $(shell find test -type f)
	BABEL_ENV=test ./node_modules/.bin/babel --copy-files --out-dir build/test --quiet test
	sed -i -e 's#--require ./test#--require ./build/test#g' ./build/test/mocha.opts

build/externaltests: externaltests/*
	./node_modules/.bin/babel --copy-files --out-dir build/externaltests --quiet externaltests

build: build/lib build/test build/externaltests

.PHONY: ${TARGETS}
${TARGETS}: build
	./node_modules/.bin/rollup --config rollup.config.js --sourcemap --format umd --name weknowhow.expect -o unexpected.js build/lib/index.js

test-jasmine:
	./node_modules/.bin/jasmine JASMINE_CONFIG_PATH=test/support/jasmine.json

ifeq ($(MODERN_NODE), true)
MOCHA_OPTS = ./test/mocha.opts
TEST_SOURCES = $(shell find test -name '*.spec.js')
else
MOCHA_OPTS = ./build/test/mocha.opts
TEST_SOURCES = $(shell find build/test -name '*.spec.js')
endif

test-sources:
ifneq ($(MODERN_NODE), true)
	make build
endif

.PHONY: test-jest
test-jest:
ifeq ($(MODERN_NODE), true)
	./node_modules/.bin/jest
else
	./node_modules/.bin/jest -c test/jest.es5.config.json
endif

test-jest-if-supported-node-version:
	@node-version-gte-6 && make test-jest || echo Skipping, jest is unsupported with node $(shell node --version)

.PHONY: test
test: test-sources
	@./node_modules/.bin/mocha --opts $(MOCHA_OPTS) $(TEST_SOURCES) $(TEST_SOURCE_MARKDOWN)

nyc-includes:
ifeq ($(MODERN_NODE), true)
NYC_INCLUDES='lib/**'
else
NYC_INCLUDES='build/lib/**'
endif

.PHONY: coverage
coverage: nyc-includes test-sources
	@./node_modules/.bin/nyc --include $(NYC_INCLUDES) --reporter=lcov --reporter=text --all -- mocha --opts $(MOCHA_OPTS) $(TEST_SOURCES) $(TEST_SOURCES_MARKDOWN)
	@echo google-chrome coverage/lcov-report/index.html

 .PHONY: test-browser
test-browser: ${TARGETS}
	@./node_modules/.bin/karma start --browsers=Chrome --debug

.PHONY: test-chrome-headless
test-chrome-headless: ${TARGETS}
	@./node_modules/.bin/karma start --single-run

.PHONY: test-browserstack
test-browserstack-%: ${TARGETS}
	@./node_modules/.bin/karma start --browsers=$* --single-run

.PHONY: travis-main
travis-main: clean lint test test-jasmine test-jest coverage
	-<coverage/lcov.info ./node_modules/coveralls/bin/coveralls.js

.PHONY: travis
travis: test test-jest-if-supported-node-version

.PHONY: git-dirty-check
git-dirty-check:
ifneq ($(shell git describe --always --dirty | grep -- -dirty),)
	$(error Working tree is dirty, please commit or stash your changes, then try again)
endif

.PHONY: deploy-site
deploy-site: site-build
	./node_modules/.bin/gh-pages -d site-build -r git@github.com:unexpectedjs/unexpectedjs.github.io.git -b master

.PHONY: commit-unexpected
commit-unexpected: ${TARGETS}
	git add ${TARGETS}
	if [ "`git status --porcelain`" != "" ]; then \
		git commit -m "Build unexpected.js" ; \
	fi

.PHONY: changelog
changelog: git-dirty-check
	@./node_modules/.bin/offline-github-changelog > CHANGELOG.md
	@git add CHANGELOG.md
	@if [ "`git status --porcelain`" != "" ]; then \
		git commit -m "Updated the changelog" ; \
	fi

.PHONY: release-%
release-%: git-dirty-check lint ${TARGETS} test-chrome-headless test-jasmine test-jest-if-supported-node-version commit-unexpected deploy-site
	IS_MAKE_RELEASE=yes npm version $*
	make changelog
	@echo $* release ready to be publised to NPM
	@echo Remember to push master and tags

.PHONY: clean
clean:
	-rm -fr ${TARGETS} coverage build

.PHONY: site-build
site-build:
	npm run generate-site

.PHONY: update-examples
update-examples:
	npm run update-examples
