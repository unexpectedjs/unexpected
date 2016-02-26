REPORTER = dot

TARGETS ?= unexpected.js

CHEWBACCA_THRESHOLD ?= 25

lint:
	@./node_modules/.bin/jscs lib/*.js test/*.js test/**/*.js
	@./node_modules/.bin/jshint lib/*.js test/*.js test/**/*.js

.PHONY: lint

unexpected.js: lib/*
	(echo '/*!' && <LICENSE sed -e's/^/ * /' | sed -e's/\s+$$//' && echo ' */' && ./node_modules/.bin/browserify -p bundle-collapser/plugin -e lib -s weknowhow.expect) > $@

.PHONY: unexpected.js

create-html-runners: test/tests.tpl.html test/JasmineRunner.tpl.html
	@for file in tests JasmineRunner ; do \
		(sed '/test files/q' ./test/$${file}.tpl.html | sed '$$d' && \
		find test -name '*.spec.js' | sed 's/test/    <script src="./' | sed 's/$$/"><\/script>/' && \
		sed -n '/test files/,$$p' ./test/$${file}.tpl.html | sed '1d') > ./test/$${file}.html;\
	done

.PHONY: create-html-runners

test-phantomjs: create-html-runners ${TARGETS}
	@$(eval QUERY=$(shell node -e "console.log(decodeURIComponent(process.argv.pop()).replace(/\s/g, '%20'))" "${grep}")) \
    ./node_modules/.bin/mocha-phantomjs $(shell [ "${QUERY}" != "" ] && echo --grep "${grep}") test/tests.html

test-jasmine: ${TARGETS}
	./node_modules/.bin/jasmine JASMINE_CONFIG_PATH=test/support/jasmine.json

test-jasmine-browser: create-html-runners unexpected.js
	@./node_modules/.bin/serve .

TEST_SOURCES = $(shell find test -name '*.spec.js') $(shell find documentation -name '*.md')
.PHONY: test
test: lint
	@mocha $(TEST_SOURCES)

.PHONY: coverage
coverage:
	@NODE_ENV=development ./node_modules/.bin/istanbul cover \
		-x unexpected.js \
		-x **/vendor/** \
		-x **/site/** \
		-x **/site-build/** \
		-x **/documentation/** \
		-x lib/testFrameworkPatch.js \
		-x bootstrap-unexpected-markdown.js \
		--report text \
		--report lcov \
		--include-all-sources ./node_modules/mocha/bin/_mocha -- --reporter dot $(TEST_SOURCES)
	@echo google-chrome coverage/lcov-report/index.html

.PHONY: test-browser
test-browser: create-html-runners unexpected.js
	@./node_modules/.bin/serve .

.PHONY: travis-chewbacca
travis-chewbacca:
	./node_modules/.bin/chewbacca --threshold ${CHEWBACCA_THRESHOLD} `echo ${TRAVIS_COMMIT_RANGE} | sed -e 's/\.\.\..*//;'` -- test/benchmark.spec.js

travis: lint test travis-chewbacca test-phantomjs test-jasmine coverage site-build
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
commit-unexpected: unexpected.js
	git add unexpected.js
	if [ "`git status --porcelain`" != "" ]; then \
		git commit -m "Build unexpected.js" ; \
	fi

.PHONY: release-%
release-%: git-dirty-check lint ${TARGETS} test-phantomjs commit-unexpected deploy-site
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
