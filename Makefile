REPORTER = dot

TARGETS ?= unexpected.js unexpected.js.map

CHEWBACCA_THRESHOLD ?= 25

lint:
	npm run lint

.PHONY: lint

.PHONY: ${TARGETS}
${TARGETS}: lib/*
	./node_modules/.bin/rollup --config --sourcemap --format umd --name weknowhow.expect -o unexpected.js lib/index.js

create-html-runners: test/tests.tpl.html test/JasmineRunner.tpl.html
	@for file in tests JasmineRunner ; do \
		(sed '/test files/q' ./test/$${file}.tpl.html | sed '$$d' && \
		find test -name '*.spec.js' | sed 's/test/    <script src="./' | sed 's/$$/"><\/script>/' && \
		sed -n '/test files/,$$p' ./test/$${file}.tpl.html | sed '1d') > ./test/$${file}.html;\
	done

.PHONY: create-html-runners

test-phantomjs: create-html-runners ${TARGETS}
	phantomjs ./node_modules/mocha-phantomjs-core/mocha-phantomjs-core.js test/tests.html spec "`node -pe 'JSON.stringify({useColors:true,grep:process.env.grep})'`"

test-jest-if-supported-node-version:
ifeq ($(shell node --version | grep -vP '^v[0123]\.'),)
	@echo Skipping, jest is unsupported with node $(shell node --version)
else
	./node_modules/.bin/jest
endif

test-jasmine:
	./node_modules/.bin/jasmine JASMINE_CONFIG_PATH=test/support/jasmine.json

test-jasmine-browser: create-html-runners ${TARGETS}
	@./node_modules/.bin/serve .

.PHONY: test
TEST_SOURCES = $(shell find test -name '*.spec.js') $(shell find documentation -name '*.md')
test: lint
	@./node_modules/.bin/mocha $(TEST_SOURCES)

.PHONY: coverage
coverage:
	@./node_modules/.bin/nyc --reporter=lcov --reporter=text --all -- mocha --compilers md:unexpected-markdown test/*.js $(TEST_SOURCES)
	@echo google-chrome coverage/lcov-report/index.html

.PHONY: test-browser
test-browser: create-html-runners ${TARGETS}
	@./node_modules/.bin/serve .

.PHONY: travis-chewbacca
travis-chewbacca:
	./node_modules/.bin/chewbacca --threshold ${CHEWBACCA_THRESHOLD} `echo ${TRAVIS_COMMIT_RANGE} | sed -e 's/\.\.\..*//;'` -- test/benchmark.spec.js

travis: clean lint test travis-chewbacca test-jasmine test-jest-if-supported-node-version coverage
ifneq ($(shell node --version | grep -vP '^v[0123]\.'),)
	make site-build
	make test-phantomjs
endif
	-<coverage/lcov.info ./node_modules/coveralls/bin/coveralls.js

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
	./node_modules/.bin/chewbacca --threshold ${CHEWBACCA_THRESHOLD} `git describe --abbrev=0 --tags --match 'v*'` -- test/benchmark.spec.js
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

.PHONY: benchmark
benchmark:
	./node_modules/.bin/mocha --no-timeouts --ui chewbacca/mocha-benchmark-ui --reporter chewbacca/mocha-benchmark-reporter test/benchmark.spec.js
