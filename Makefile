REPORTER = dot

test:
	@./node_modules/.bin/mocha \
		--require ./test/common \
		--reporter $(REPORTER) \
		test/unexpected.spec.js

.PHONY: test

coverage:
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