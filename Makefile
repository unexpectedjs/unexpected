REPORTER = dot

TARGETS ?= unexpected.js unexpected.js.map

CHEWBACCA_THRESHOLD ?= 25

TEST_SOURCES_MARKDOWN =  $(shell find documentation -name '*.md')

NODE_VERSION = $(shell node --version)

lint:
	npm run lint

.PHONY: lint

build/lib: lib/*
	babel --copy-files --out-dir build/lib --quiet lib

build/test: test/*
	babel --copy-files --out-dir build/test --quiet test
	sed -i -e 's#--require ./test#--require ./build/test#g' ./build/test/mocha.opts

build/externaltests: externaltests/*
	babel --copy-files --out-dir build/externaltests --quiet externaltests

build: build/lib build/test build/externaltests

.PHONY: ${TARGETS}
${TARGETS}: build
	./node_modules/.bin/rollup --config --sourcemap --format umd --name weknowhow.expect -o unexpected.js build/lib/index.js

create-html-runners: build/test test/tests.tpl.html test/JasmineRunner.tpl.html
	@for file in tests JasmineRunner ; do \
		(sed '/test files/q' ./build/test/$${file}.tpl.html | sed '$$d' && \
		find test -name '*.spec.js' | sed 's/test/    <script src="./' | sed 's/$$/"><\/script>/' && \
		sed -n '/test files/,$$p' ./build/test/$${file}.tpl.html | sed '1d') > ./build/test/$${file}.html;\
	done

.PHONY: create-html-runners

test-phantomjs: create-html-runners ${TARGETS}
	phantomjs ./node_modules/mocha-phantomjs-core/mocha-phantomjs-core.js build/test/tests.html spec "`node -pe 'JSON.stringify({useColors:true,grep:process.env.grep})'`"

test-jasmine:
	./node_modules/.bin/jasmine JASMINE_CONFIG_PATH=test/support/jasmine.json

test-jasmine-browser: create-html-runners ${TARGETS}
	@echo open http://localhost:5000/build/test/JasmineRunner.html
	@./node_modules/.bin/serve .

test-sources:
ifeq ($(NODE_VERSION), $(shell cat .nvmrc))
MOCHA_OPTS = ./test/mocha.opts
TEST_SOURCES = $(shell find test -name '*.spec.js')
else
	make build
MOCHA_OPTS = ./build/test/mocha.opts
TEST_SOURCES = $(shell find build/test -name '*.spec.js')
endif

.PHONY: test-jest
test-jest:
ifeq ($(NODE_VERSION), $(shell cat .nvmrc))
	./node_modules/.bin/jest
else
	./node_modules/.bin/jest -c test/jest.es5.config.json
endif

test-jest-if-supported-node-version:
ifeq ($(shell node -p -e '/^v[0123]\./.test(process.version)'),true)
	@echo Skipping, jest is unsupported with node $(shell node --version)
else
	make test-jest
endif

.PHONY: test
test: test-sources
	@./node_modules/.bin/mocha --opts $(MOCHA_OPTS) $(TEST_SOURCES) $(TEST_SOURCE_MARKDOWN)

.PHONY: coverage
coverage: test-sources
	@./node_modules/.bin/nyc --reporter=lcov --reporter=text --all -- mocha --opts $(MOCHA_OPTS) $(TEST_SOURCES) $(TEST_SOURCES_MARKDOWN)
	@echo google-chrome coverage/lcov-report/index.html

.PHONY: test-browser
test-browser: create-html-runners ${TARGETS}
	@echo open http://localhost:5000/build/test/tests.html
	@./node_modules/.bin/serve .

.PHONY: travis-secondary
travis-secondary: test test-jest-if-supported-node-version coverage

.PHONY: travis-main
travis-main: clean lint test test-jasmine test-jest coverage
	make site-build
	make test-phantomjs
	-<coverage/lcov.info ./node_modules/coveralls/bin/coveralls.js

travis:
ifeq ($(NODE_VERSION), $(shell cat .nvmrc))
	make travis-main
else
	make travis-secondary
endif

.PHONY: git-dirty-check
git-dirty-check:
ifneq ($(shell git describe --always --dirty | grep -- -dirty),)
	$(error Working tree is dirty, please commit or stash your changes, then try again)
endif

.PHONY: deploy-site
deploy-site: site-build
	./node_modules/.bin/deploy-site.sh site-build && \
    git push git@github.com:unexpectedjs/unexpectedjs.github.io.git +site-build:master

.PHONY: commit-unexpected
commit-unexpected: ${TARGETS}
	git add ${TARGETS}
	if [ "`git status --porcelain`" != "" ]; then \
		git commit -m "Build unexpected.js" ; \
	fi

.PHONY: release-%
release-%: git-dirty-check lint ${TARGETS} test-phantomjs test-jasmine test-jest-if-supported-node-version commit-unexpected deploy-site
	IS_MAKE_RELEASE=yes npm version $*
	@echo $* release ready to be publised to NPM
	@echo Remember to push tags

.PHONY: clean
clean:
	-rm -fr ${TARGETS} coverage

.PHONY: site-build
site-build:
	npm run generate-site

.PHONY: update-examples
update-examples:
	npm run update-examples
