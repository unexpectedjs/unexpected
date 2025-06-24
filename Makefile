REPORTER = dot

TARGETS ?= unexpected.js unexpected.js.map unexpected.esm.js unexpected.esm.js.map
.PHONY: unexpected.js unexpected.esm.js
.SECONDARY: unexpected.js.map unexpected.esm.js.map

TEST_SOURCES_MARKDOWN =  $(shell find documentation -name '*.md')

lint:
	npm run lint

.PHONY: lint

build/lib: lib/*
	mkdir -p ./build
	./node_modules/.bin/buble -o build/lib lib

build/test: $(shell find test -type f)
	mkdir -p ./build
	./node_modules/.bin/buble -o build/test test
	cp ./.mocharc.json ./build/test/.mocharc.json
	sed -i -e 's#./test#./build/test#g' ./build/test/.mocharc.json

build/externaltests: externaltests/*
	./node_modules/.bin/buble -o build/externaltests externaltests
	cp ./externaltests/*.json ./build/externaltests/

build: build/lib build/test build/externaltests

build/tests.esm.js: build/test
	./node_modules/.bin/rollup --config rollup.tests.js > build/tests.esm.js

unexpected.js unexpected.js.map: build
	./node_modules/.bin/rollup --config rollup.config.js --sourcemap --format umd --name weknowhow.expect -o unexpected.js build/lib/index.js

unexpected.esm.js unexpected.esm.js.map: build
	ESM_BUILD=yes ./node_modules/.bin/rollup --config rollup.config.js --sourcemap --format esm --name weknowhow.expect -o unexpected.esm.js build/lib/index.js

test-jasmine:
	./node_modules/.bin/jasmine JASMINE_CONFIG_PATH=test/support/jasmine.json

MOCHA_CONFIG = .mocharc.json
TEST_SOURCES = $(shell find test -name '*.spec.js')

.PHONY: test-jest
test-jest:
	./node_modules/.bin/jest

.PHONY: test
test:
	@./node_modules/.bin/mocha --config $(MOCHA_CONFIG) $(TEST_SOURCES)
	make test-docs

.PHONY: test-docs
test-docs:
	@./node_modules/.bin/evaldown --comment-marker unexpected-markdown --require ./bootstrap-unexpected-markdown.js --validate --reporter spec ./documentation

nyc-includes:
NYC_INCLUDES='lib/**'

.PHONY: coverage
coverage: nyc-includes
	@./node_modules/.bin/nyc --include $(NYC_INCLUDES) --reporter=lcov --reporter=text --all -- node_modules/.bin/mocha --config $(MOCHA_CONFIG) $(TEST_SOURCES)
	@echo google-chrome coverage/lcov-report/index.html

 .PHONY: test-browser
test-browser: ${TARGETS}
	@./node_modules/.bin/karma start --browsers=Chrome --debug

.PHONY: test-chrome-headless
test-chrome-headless: ${TARGETS}
	@./node_modules/.bin/karma start --browsers=ChromeHeadlessNoSandbox --single-run

.PHONY: test-plugins
test-plugins: ${TARGETS}
	./node_modules/.bin/fugl --config .fugl.json --reporter html --ci

.PHONY: test-deno
test-deno: ${TARGETS} build/tests.esm.js
	if [ ! -f ~/.deno/bin/deno ]; then \
		curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.30.3; \
	fi;
	~/.deno/bin/deno run --location http://localhost test-deno/deno-test.js

.PHONY: travis-coverage
travis-coverage: clean coverage
	-<coverage/lcov.info ./node_modules/coveralls/bin/coveralls.js

.PHONY: travis
travis: test

.PHONY: git-dirty-check
git-dirty-check:
ifneq ($(shell git describe --always --dirty | grep -- -dirty),)
	$(error Working tree is dirty, please commit or stash your changes, then try again)
endif

.PHONY: deploy-site
deploy-site: site-build
	./node_modules/.bin/gh-pages -d site-build -r git@github.com:unexpectedjs/unexpectedjs.github.io.git -b master

.PHONY: release-%
release-%: git-dirty-check lint ${TARGETS} test-chrome-headless test-jasmine test-jest check-site-links deploy-site
	IS_MAKE_RELEASE=yes npm version $*
	@echo $* release ready to be publised to NPM
	@echo Remember to push master and tags

.PHONY: clean
clean:
	-rm -fr ${TARGETS} coverage build

.PHONY: site-build
site-build:
	npm run generate-site

check-site-links: site-build
	./node_modules/.bin/hyperlink -ri --canonicalroot https://unexpected.js.org --skip content-type-mismatch --skip unexpected.js.org/unexpected- site-build/index.html | ./node_modules/.bin/tap-spot

.PHONY: update-examples
update-examples:
	npm run update-examples
