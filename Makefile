coverage:
	rm -rf lib-cov
	jscoverage lib lib-cov
	COVERAGE=1 mocha -R html-cov > lib-cov/index.html

.PHONY: coverage