REPORTER = dot

TARGETS ?= unexpected.js

lint:
	@./node_modules/.bin/jshint --exclude test/documentation.spec.js lib/*.js test/*.js

.PHONY: lint

unexpected.js: lib/*
	(echo '/*!' && <LICENSE sed -e's/^/ * /' | sed -e's/\s+$$//' && echo ' */' && ./node_modules/.bin/browserify -p bundle-collapser/plugin -e lib -s weknowhow.expect) > $@

.PHONY: unexpected.js

test-phantomjs: ${TARGETS}
	@$(eval QUERY=$(shell node -e "console.log(decodeURIComponent(process.argv.pop()).replace(/\s/g, '%20'))" "${grep}")) \
    ./node_modules/.bin/mocha-phantomjs test/tests.html?grep=${QUERY}

test: lint
	mocha

.PHONY: test

coverage: lib/*
	NODE_ENV=development ./node_modules/.bin/istanbul cover \
		-x unexpected.js \
		-x **/vendor/** \
		-x **/site/** \
		-x **/site-build/** \
		-x **/documentation/** \
	--include-all-sources ./node_modules/mocha/bin/_mocha -- --reporter dot

.PHONY: test-browser
test-browser: unexpected.js
	@./node_modules/.bin/serve .

travis: lint test coverage
	-<coverage/lcov.info ./node_modules/coveralls/bin/coveralls.js

.PHONY: git-dirty-check
git-dirty-check:
ifneq ($(shell git describe --always --dirty | grep -- -dirty),)
	$(error Working tree is dirty, please commit or stash your changes, then try again)
endif

.PHONY: deploy-site
deploy-site: git-dirty-check site-build
	git fetch origin site-build
	git checkout -B site-build origin/site-build
	rm `git ls-files | grep -v '^\.gitignore$$'`
	cp -r site-build/* .
	if [ "`git status --porcelain`" != "" ]; then \
		(git add -A . && \
	     git commit -m "Updated site" && \
	     git push origin +site-build:site-build && \
		 git push git@github.com:unexpectedjs/unexpectedjs.github.io.git +site-build:master) ; \
	fi
	git checkout master

.PHONY: commit-unexpected
commit-unexpected: unexpected.js
	git add unexpected.js
	if [ "`git status --porcelain`" != "" ]; then \
		git commit -m "Build unexpected.js" ; \
	fi

.PHONY: release-%
release-%: git-dirty-check lint ${TARGETS} test-phantomjs commit-unexpected deploy-site
	npm version $*
	@echo $* release ready to be publised to NPM
	@echo Remember to push tags

.PHONY: clean
clean:
	-rm -fr ${TARGETS} coverage

.PHONY: site-build
site-build:
	node site/build.js

.PHONY: update-examples
update-examples:
	node site/build.js --update-examples
