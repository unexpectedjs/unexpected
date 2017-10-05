### v10.36.0 (2017-10-05)

- [#422](https://github.com/unexpectedjs/unexpected/pull/422) Generate changelog ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#421](https://github.com/unexpectedjs/unexpected/pull/421) Use ...rest params instead of Array#apply ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.34.2 (2017-09-03)

- [#420](https://github.com/unexpectedjs/unexpected/pull/420) Reintroduce Babel ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#419](https://github.com/unexpectedjs/unexpected/pull/419) Revert "Babel" ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.34.0 (2017-09-03)

- [#418](https://github.com/unexpectedjs/unexpected/pull/418) Babel ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.33.2 (2017-08-14)

- [#415](https://github.com/unexpectedjs/unexpected/pull/415) Don't break when a function has its own custom #toString ([Andreas Lind](mailto://andreas@one.com))
- [#414](https://github.com/unexpectedjs/unexpected/pull/414) to have properties: Allow numerical property names passed as either strings or numbers ([Andreas Lind](mailto://andreas@one.com))

### v10.33.0 (2017-08-01)

- [#409](https://github.com/unexpectedjs/unexpected/pull/409) Replace browserify with rollup, add source map and uglify unexpected.js ([Andreas Lind](mailto://andreas@one.com))
- [#406](https://github.com/unexpectedjs/unexpected/pull/406) Remove the ability for a plugin to specify required dependencies ([Andreas Lind](mailto://andreas@one.com))
- [#410](https://github.com/unexpectedjs/unexpected/pull/410) added: plugin unexpected-date ([Andreas Lind](mailto://andreas@one.com))

### v10.32.1 (2017-07-15)

- [#408](https://github.com/unexpectedjs/unexpected/pull/408) Fix inspection of bound functions (broken in 4485bf622 / 10.30.0) ([Andreas Lind](mailto://andreas@one.com))

### v10.32.0 (2017-07-06)

- [#403](https://github.com/unexpectedjs/unexpected/pull/403) Alias for to be a date ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#402](https://github.com/unexpectedjs/unexpected/pull/402) rename: to-be-one-of.js => to-be-one-of.spec.js ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.31.0 (2017-07-02)

- [#401](https://github.com/unexpectedjs/unexpected/pull/401) added: support for property descriptors ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.30.0 (2017-07-01)

- [#387](https://github.com/unexpectedjs/unexpected/pull/387) Support inspection of arrow functions ([Andreas Lind](mailto://andreas@one.com))
- [#396](https://github.com/unexpectedjs/unexpected/pull/396) Don't allow a compound assertion where (a prefix of) the last half is not an existing assertion ([Andreas Lind](mailto://andreas@one.com))
- [#400](https://github.com/unexpectedjs/unexpected/pull/400) addStyle & installTheme: Return the expect function rather than the magicpen instance (for chaining) ([Andreas Lind](mailto://andreas@one.com))
- [#398](https://github.com/unexpectedjs/unexpected/pull/398) Document will-throw-a assertions for functions that take input ([Andreas Lind](mailto://andreas@one.com))

### v10.29.0 (2017-05-12)

- [#388](https://github.com/unexpectedjs/unexpected/pull/388) Introduce a first class context and use it to avoid serializing expect.it(...).or(...) ([Andreas Lind](mailto://andreas@one.com))

### v10.28.0 (2017-05-08)

- [#397](https://github.com/unexpectedjs/unexpected/pull/397) to be (a|an) <string>: Always die when a non-existent type is specified ([Andreas Lind](mailto://andreas@one.com))
- [#392](https://github.com/unexpectedjs/unexpected/pull/392) Adding the logo to the readme to make medium links show the logo ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#389](https://github.com/unexpectedjs/unexpected/pull/389) Support expect.it(function (value) {...}) ([Andreas Lind](mailto://andreas@one.com))

### v10.27.0 (2017-04-17)

- [#385](https://github.com/unexpectedjs/unexpected/pull/385) Allow plugins to hook into the main expect function ([Andreas Lind](mailto://andreas@one.com))
- [#384](https://github.com/unexpectedjs/unexpected/pull/384) Fix flag forwarding for expect.it ([Andreas Lind](mailto://andreas@one.com))
- [#377](https://github.com/unexpectedjs/unexpected/pull/377) Child expect + exportAssertion ([Andreas Lind](mailto://andreas@one.com))

### v10.26.3 (2017-03-02)

- [#381](https://github.com/unexpectedjs/unexpected/pull/381) Fix the error message when an object is exhaustively satisfied against an object, and some keys are missing ([Andreas Lind](mailto://andreas@one.com))
- [#379](https://github.com/unexpectedjs/unexpected/pull/379) Upgraded Jest to the newest version. ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.26.1 (2017-02-26)

- [#376](https://github.com/unexpectedjs/unexpected/pull/376) Add assertion type signature to error messages relevant to it ([Andreas Lind](mailto://andreas@one.com))

### v10.26.0 (2017-02-16)

- [#372](https://github.com/unexpectedjs/unexpected/pull/372) addAssertion: Fail when the handler takes too many parameters ([Andreas Lind](mailto://andreas@one.com))
- [#371](https://github.com/unexpectedjs/unexpected/pull/371) Fix: `to exhaustively satisfy` doesn't consider a missing property to be identical to a property with a value of undefined (#370) ([Andreas Lind](mailto://andreas@one.com))

### v10.25.0 (2017-02-04)

- [#367](https://github.com/unexpectedjs/unexpected/pull/367) to throw a/an ([Andreas Lind](mailto://andreas@one.com))
- [#368](https://github.com/unexpectedjs/unexpected/pull/368) Consistently use the 'not to be empty' assertion for objects and arrays ([Andreas Lind](mailto://andreas@one.com))

### v10.24.0 (2017-01-26)

- [#366](https://github.com/unexpectedjs/unexpected/pull/366) Normalized line breaks in test output. ([Andreas Lind](mailto://andreas@one.com))

### v10.22.2 (2017-01-20)

- [#363](https://github.com/unexpectedjs/unexpected/pull/363) Jest suite up ([Andreas Lind](mailto://andreas@one.com))

### v10.22.1 (2017-01-19)

- [#361](https://github.com/unexpectedjs/unexpected/pull/361) Jest seems to just print the stack, so we need the error message in the stack ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.21.1 (2016-12-27)

- [#357](https://github.com/unexpectedjs/unexpected/pull/357) Highlight trailing whitespace in added/removed string diff chunks ([Andreas Lind](mailto://andreas@one.com))
- [#353](https://github.com/unexpectedjs/unexpected/pull/353) Remove expect.promise from the docs ([Andreas Lind](mailto://andreas@one.com))
- [#354](https://github.com/unexpectedjs/unexpected/pull/354) Install the promise polyfill in one central place. ([Joel Mukuthu](mailto://joelmukuthu@gmail.com))

### v10.21.0 (2016-12-18)

- [#338](https://github.com/unexpectedjs/unexpected/pull/338) Add <object|array-like> to have (a value|an item) satisfying <any|assertion> ([Andreas Lind](mailto://andreas@one.com))
- [#355](https://github.com/unexpectedjs/unexpected/pull/355) Inspect async functions ([Andreas Lind](mailto://andreas@one.com))

### v10.20.0 (2016-11-27)

- [#340](https://github.com/unexpectedjs/unexpected/pull/340) Add 'to be fulfilled with a value satisfying' and 'to be rejected with error satisfying' ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#348](https://github.com/unexpectedjs/unexpected/pull/348) to have (items|values|keys) satisfying: Only allow one <any> as the value, not <any+> ([Andreas Lind](mailto://andreas@one.com))
- [#349](https://github.com/unexpectedjs/unexpected/pull/349) to have keys satisfying, to have values satisfying: Disallow an empty array ([Andreas Lind](mailto://andreas@one.com))

### v10.19.0 (2016-11-14)

- [#344](https://github.com/unexpectedjs/unexpected/pull/344) Add '[not] to be one of' assertion ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#332](https://github.com/unexpectedjs/unexpected/pull/332) Consistently return the output from the inspect and diff methods of the built-in types ([Andreas Lind](mailto://andreas@one.com))
- [#336](https://github.com/unexpectedjs/unexpected/pull/336) Use eslint-plugin-import (especially import/no-extraneous-dependencies). ([Andreas Lind](mailto://andreas@one.com))

### v10.18.0 (2016-09-26)

- [#333](https://github.com/unexpectedjs/unexpected/pull/333) Render array moves with arrows ([Andreas Lind](mailto://andreas@one.com))

### v10.17.1 (2016-09-14)

- [#335](https://github.com/unexpectedjs/unexpected/pull/335) Upgraded array-changes ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.16.0 (2016-08-22)

- [#323](https://github.com/unexpectedjs/unexpected/pull/323) Preserve the stack of the actual error. ([Andreas Lind](mailto://andreas@one.com))

### v10.15.1 (2016-08-05)

- [#327](https://github.com/unexpectedjs/unexpected/pull/327) Fix subject compaction in nested settings ([Andreas Lind](mailto://andreas@one.com))
- [#326](https://github.com/unexpectedjs/unexpected/pull/326) Avoid some .then(function () {return something}) constructs using promise.tap ([Andreas Lind](mailto://andreas@one.com))

### v10.15.0 (2016-07-15)

- [#321](https://github.com/unexpectedjs/unexpected/pull/321) Allow assertions to succeed without settling all promises ([Andreas Lind](mailto://andreas@one.com))

### v10.14.2 (2016-06-23)

- [#314](https://github.com/unexpectedjs/unexpected/pull/314) Fix/unexpected magicpen ([Andreas Lind](mailto://andreas@one.com))
- [#312](https://github.com/unexpectedjs/unexpected/pull/312) Add 'when sorted' and 'when sorted by' assertions for arrays ([Joel Mukuthu](mailto://joelmukuthu@gmail.com))

### v10.14.0 (2016-06-22)

- [#310](https://github.com/unexpectedjs/unexpected/pull/310) Move the magicpen type into a separate unexpected-magicpen plugin ([Andreas Lind](mailto://andreas@one.com))
- [#313](https://github.com/unexpectedjs/unexpected/pull/313) Fix case where mocha 2.2.0+ sidesteps the footgun detection by suppre… ([Andreas Lind](mailto://andreas@one.com))

### v10.13.3 (2016-05-20)

- [#306](https://github.com/unexpectedjs/unexpected/pull/306) Expose (almost) all of Bluebird's static methods. ([Andreas Lind](mailto://andreas@one.com))
- [#305](https://github.com/unexpectedjs/unexpected/pull/305) Feature/expect with one argument ([Andreas Lind](mailto://andreas@one.com))

### v10.13.1 (2016-04-17)

- [#303](https://github.com/unexpectedjs/unexpected/pull/303) Update plugins page to link to unexpected-react docs ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.13.0 (2016-04-06)

- [#301](https://github.com/unexpectedjs/unexpected/pull/301) Don't inspect args for when called with as an array ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.12.0 (2016-04-05)

- [#300](https://github.com/unexpectedjs/unexpected/pull/300) Feature/cheaper long stack trace ([Andreas Lind](mailto://andreas@one.com))
- [#299](https://github.com/unexpectedjs/unexpected/pull/299) Switch from mocha-phantomjs-papandreou to mocha-phantomjs-core and st… ([Andreas Lind](mailto://andreas@one.com))

### v10.11.0 (2016-03-31)

- [#297](https://github.com/unexpectedjs/unexpected/pull/297) A fix and two new features for expect.promise(function (run) {...}) ([Andreas Lind](mailto://andreas@one.com))
- [#295](https://github.com/unexpectedjs/unexpected/pull/295) Only fail in the afterEach hook if the test was otherwise successful ([Andreas Lind](mailto://andreas@one.com))
- [#296](https://github.com/unexpectedjs/unexpected/pull/296) Update leven to 2.0.0. ([Andreas Lind](mailto://andreas@one.com))
- [#293](https://github.com/unexpectedjs/unexpected/pull/293) Add unexpected-webdriver plugin to docs ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#289](https://github.com/unexpectedjs/unexpected/pull/289) Implement <function> to be (rejected|fulfilled) [with] ([Andreas Lind](mailto://andreas@one.com))
- [#282](https://github.com/unexpectedjs/unexpected/pull/282) make coverage: Replace istanbul with nyc (an istanbul wrapper) ([Andreas Lind](mailto://andreas@one.com))
- [#288](https://github.com/unexpectedjs/unexpected/pull/288) add eslint and use the onelint shared configuration ([Gustav Nikolaj](mailto://gustavnikolaj@gmail.com))

### v10.10.10 (2016-03-17)

- [#284](https://github.com/unexpectedjs/unexpected/pull/284) Fix UNEXPECTED_FULL_TRACE env variable for emulated DOM ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.10.9 (2016-03-17)

- [#281](https://github.com/unexpectedjs/unexpected/pull/281) to exhaustively satisfy: Don't break with non-enumerable properties and allow matching on prototype properties ([Andreas Lind](mailto://andreas@one.com))

### v10.10.8 (2016-03-13)

- [#279](https://github.com/unexpectedjs/unexpected/pull/279) expect.it: Always fail when there's a misspelled assertion ([Andreas Lind](mailto://andreas@one.com))

### v10.10.6 (2016-03-13)

- [#280](https://github.com/unexpectedjs/unexpected/pull/280) Don't consider two different functions equal even if their toString() methods return the same value ([Andreas Lind](mailto://andreas@one.com))

### v10.10.4 (2016-03-09)

- [#277](https://github.com/unexpectedjs/unexpected/pull/277) Make unexpected errors more resilient to weird post processing of the stack ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.10.3 (2016-03-09)

- [#276](https://github.com/unexpectedjs/unexpected/pull/276) Refactor string diff code ([Andreas Lind](mailto://andreas@one.com))

### v10.10.0 (2016-03-04)

- [#275](https://github.com/unexpectedjs/unexpected/pull/275) Disallow expect({...}, 'to satisfy', [...]) ([Andreas Lind](mailto://andreas@one.com))
- [#273](https://github.com/unexpectedjs/unexpected/pull/273) Avoid diff result ([Andreas Lind](mailto://andreas@one.com))
- [#274](https://github.com/unexpectedjs/unexpected/pull/274) Switch to unexpected-bluebird ([Andreas Lind](mailto://andreas@one.com))
- [#271](https://github.com/unexpectedjs/unexpected/pull/271) Always include vertical whitespace between the error message and the diff ([Andreas Lind](mailto://andreas@one.com))
- [#270](https://github.com/unexpectedjs/unexpected/pull/270) WIP: Omit plus and minus in string diffs, except in text mode ([Andreas Lind](mailto://andreas@one.com))

### v10.9.1 (2016-02-27)

- [#269](https://github.com/unexpectedjs/unexpected/pull/269) npm version: Fail unless invoked via make release. ([Andreas Lind](mailto://andreas@one.com))

### v10.9.0 (2016-02-27)

- [#268](https://github.com/unexpectedjs/unexpected/pull/268) Remove all unexpected lines from the stack unless UNEXPECTED_FULL_TRACE is set ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#267](https://github.com/unexpectedjs/unexpected/pull/267) Add unexpected-events to the list of plugins. ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#263](https://github.com/unexpectedjs/unexpected/pull/263) Add support for arrays with non-numerical keys ([Andreas Lind](mailto://andreas@one.com))
- [#265](https://github.com/unexpectedjs/unexpected/pull/265) Add jspm support ([Andreas Lind](mailto://andreas@one.com))
- [#264](https://github.com/unexpectedjs/unexpected/pull/264) Fix broken link to magicpen repo in api/addType.md docs ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#262](https://github.com/unexpectedjs/unexpected/pull/262) Implement Symbol type when the Symbol global is available. ([Andreas Lind](mailto://andreas@one.com))
- [#257](https://github.com/unexpectedjs/unexpected/pull/257) Wip: Replace test framework patch with afterEach hook ([Andreas Lind](mailto://andreas@one.com))

### v10.8.0 (2016-01-25)

- [#258](https://github.com/unexpectedjs/unexpected/pull/258) Implement 'to have (items|values) exhaustively satisfying'. ([Andreas Lind](mailto://andreas@one.com))
- [#256](https://github.com/unexpectedjs/unexpected/pull/256) Fix propagation of a missing assertion error in expect.it(...).or(...) constructs ([Andreas Lind](mailto://andreas@one.com))

### v10.7.0 (2016-01-22)

- [#239](https://github.com/unexpectedjs/unexpected/pull/239) Update bluebird from 2.9.34 to 3.1.1. ([Andreas Lind](mailto://andreas@one.com))

### v10.6.0 (2016-01-22)

- [#250](https://github.com/unexpectedjs/unexpected/pull/250) Allow subtypes of object and array-like more fine-grained control over newlines and indentation ([Andreas Lind](mailto://andreas@one.com))
- [#247](https://github.com/unexpectedjs/unexpected/pull/247) Added '<object> not to have keys' assertion ([Andreas Lind](mailto://andreas@one.com))

### v10.5.1 (2016-01-08)

- [#242](https://github.com/unexpectedjs/unexpected/pull/242) Generate the html runners so we don't have to maintain them ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.5.0 (2015-12-23)

- [#240](https://github.com/unexpectedjs/unexpected/pull/240) Spike/compound assertion ([Andreas Lind](mailto://andreas@one.com))
- [#241](https://github.com/unexpectedjs/unexpected/pull/241) Implement expect(fn, 'when called', ...); ([Andreas Lind](mailto://andreas@one.com))
- [#237](https://github.com/unexpectedjs/unexpected/pull/237) Fixed our test setup and extracted the first test into another file ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#236](https://github.com/unexpectedjs/unexpected/pull/236) Feature/unexpected markdown upgrade ([Andreas Lind](mailto://andreas@one.com))
- [#235](https://github.com/unexpectedjs/unexpected/pull/235) to only have keys: Implemented diff ([Andreas Lind](mailto://andreas@one.com))

### v10.3.0 (2015-11-22)

- [#230](https://github.com/unexpectedjs/unexpected/pull/230) Improve the appearance of missing properties in object diffs and to satisfy diffs ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v10.0.2 (2015-10-23)

- [#218](https://github.com/unexpectedjs/unexpected/pull/218) oathbreaker: Don't recapture the stack of non-Unexpected errors. ([Andreas Lind](mailto://andreas@one.com))

### v10.0.0 (2015-10-08)

- [#220](https://github.com/unexpectedjs/unexpected/pull/220) Spike/v10 duck typing ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#219](https://github.com/unexpectedjs/unexpected/pull/219) Feature/v10 shift ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v9.12.0 (2015-09-16)

- [#211](https://github.com/unexpectedjs/unexpected/pull/211) Put annotation on next line in to satisfy when lines gets too long ([Andreas Lind](mailto://andreas@one.com))
- [#210](https://github.com/unexpectedjs/unexpected/pull/210) Add gitter chat badge to README ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#209](https://github.com/unexpectedjs/unexpected/pull/209) Remove the Assertion class, refactor and optimize the creation of the wrapped expect function ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v9.11.1 (2015-09-13)

- [#208](https://github.com/unexpectedjs/unexpected/pull/208) Add unexpected-react-shallow plugin to docs ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v9.9.0 (2015-09-07)

- [#207](https://github.com/unexpectedjs/unexpected/pull/207) Omit subject for expect.it as well ([Andreas Lind](mailto://andreas@one.com))

### v9.5.2 (2015-08-18)

- [#205](https://github.com/unexpectedjs/unexpected/pull/205) Fix patching of the test framework's 'it' function in test suites spanning multiple files ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v9.5.1 (2015-08-18)

- [#202](https://github.com/unexpectedjs/unexpected/pull/202) Add a "Plugins" page to the documentation ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v9.5.0 (2015-08-08)

- [#198](https://github.com/unexpectedjs/unexpected/pull/198) Fix error message of 'when fulfilled' with expect.it ([Andreas Lind](mailto://andreas@one.com))
- [#201](https://github.com/unexpectedjs/unexpected/pull/201) Allow plugins to have a version property. ([Andreas Lind](mailto://andreas@one.com))
- [#200](https://github.com/unexpectedjs/unexpected/pull/200) Inspect magicpen instances as a series of function calls ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#183](https://github.com/unexpectedjs/unexpected/pull/183) String assertions 'to begin with' + 'to end with' ([Andreas Lind](mailto://andreas@one.com))
- [#195](https://github.com/unexpectedjs/unexpected/pull/195) Add some docs about the expect function. ([Andreas Lind](mailto://andreas@one.com))
- [#196](https://github.com/unexpectedjs/unexpected/pull/196) to have property: Improve the error output when an expected value is given ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v9.4.0 (2015-07-27)

- [#197](https://github.com/unexpectedjs/unexpected/pull/197) Fix stack trace of errors that has been thrown when the work queue has been drained ([Andreas Lind](mailto://andreas@one.com))
- [#193](https://github.com/unexpectedjs/unexpected/pull/193) installPlugin => use, allow functions as plugins ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#192](https://github.com/unexpectedjs/unexpected/pull/192) installPlugin: Error out if an already installed plugin has the same … ([Andreas Lind](mailto://andreas@one.com))

### v9.3.0 (2015-07-21)

- [#190](https://github.com/unexpectedjs/unexpected/pull/190) expect: Always return a thenable ([Andreas Lind](mailto://andreas@one.com))

### v9.0.0 (2015-07-03)

- [#182](https://github.com/unexpectedjs/unexpected/pull/182) Added .editorconfig ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#180](https://github.com/unexpectedjs/unexpected/pull/180) Error to have message: Allow specifying the desired representation of the error (html/ansi/text). ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v8.5.0 (2015-06-24)

- [#179](https://github.com/unexpectedjs/unexpected/pull/179) to call the callback: Resolve the promise with an array containing th… ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#176](https://github.com/unexpectedjs/unexpected/pull/176) Implemented "to call the callback with [no] error" assertion. ([Andreas Lind](mailto://andreas@one.com))
- [#177](https://github.com/unexpectedjs/unexpected/pull/177) Pull the unexpected-promise plugin into core. ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v8.4.0 (2015-06-21)

- [#174](https://github.com/unexpectedjs/unexpected/pull/174) expect.fail with an object: Set all properties on the UnexpectedError. ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v8.3.0 (2015-06-16)

- [#172](https://github.com/unexpectedjs/unexpected/pull/172) Add inspect method to promises ([Andreas Lind](mailto://andreas@one.com))
- [#171](https://github.com/unexpectedjs/unexpected/pull/171) Added custom inspect function for UnexpectedError. ([Andreas Lind](mailto://andreas@one.com))
- [#169](https://github.com/unexpectedjs/unexpected/pull/169) Stop truncating the stack of thrown errors ([Andreas Lind](mailto://andreas@one.com))

### v8.1.0 (2015-06-12)

- [#168](https://github.com/unexpectedjs/unexpected/pull/168) Improve output of "to have items/values/keys satisfying" ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v8.0.0 (2015-06-10)

- [#164](https://github.com/unexpectedjs/unexpected/pull/164) Feature/to error ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v7.4.0 (2015-05-18)

- [#155](https://github.com/unexpectedjs/unexpected/pull/155) Use type system in to satisfy ([Andreas Lind](mailto://andreas@one.com))
- [#154](https://github.com/unexpectedjs/unexpected/pull/154) expect.it: Indicate success/failure for all clauses. ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v7.0.0 (2015-04-17)

- [#140](https://github.com/unexpectedjs/unexpected/pull/140) Error to have message ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#141](https://github.com/unexpectedjs/unexpected/pull/141) when passed as parameters to: Implement 'async' flag. ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#139](https://github.com/unexpectedjs/unexpected/pull/139) Fix #132 ([Andreas Lind](mailto://andreas@one.com))

### v6.0.6 (2015-03-05)

- [#125](https://github.com/unexpectedjs/unexpected/pull/125) Change alias to use relative url ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v6.0.0 (2015-03-03)

- [#120](https://github.com/unexpectedjs/unexpected/pull/120) Use Object.is when testing for equality where the === operator was previously used ([Andreas Lind](mailto://andreas@one.com))
- [#93](https://github.com/unexpectedjs/unexpected/pull/93) Added missing metalsmith-static dev-dependency ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v5.10.0 (2015-02-27)

- [#123](https://github.com/unexpectedjs/unexpected/pull/123) should be => should equal when comparisons use equal semantics. ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v5.6.5 (2015-01-22)

- [#119](https://github.com/unexpectedjs/unexpected/pull/119) Speed up travis CI runs by using new docker infrastructure and caching n... ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v5.4.0 (2015-01-15)

- [#113](https://github.com/unexpectedjs/unexpected/pull/113) Introduce a NaN type so the number assertions can refuse to work on it ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v5.3.0 (2015-01-14)

- [#109](https://github.com/unexpectedjs/unexpected/pull/109) Inspect Date instances in a JavaScript-compatible syntax ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#108](https://github.com/unexpectedjs/unexpected/pull/108) Inspect getters and setters ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v5.2.0 (2015-01-12)

- [#102](https://github.com/unexpectedjs/unexpected/pull/102) 'when called with' and 'when passed as parameters to': Set the errorMode to 'nested' ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v5.1.2 (2015-01-05)

- [#94](https://github.com/unexpectedjs/unexpected/pull/94) Improved missing assertion error ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v5.0.0 (2014-12-22)

- [#80](https://github.com/unexpectedjs/unexpected/pull/80) Inspect arguments differently from array ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#73](https://github.com/unexpectedjs/unexpected/pull/73) Include diffs in the "not to contain" and "not to match" error messages ([Andreas Lind](mailto://andreas@one.com))
- [#64](https://github.com/unexpectedjs/unexpected/pull/64) Improve the output for the standard error message ([Andreas Lind](mailto://andreas@one.com))
- [#62](https://github.com/unexpectedjs/unexpected/pull/62) Implement to be (a|an) [non-empty] (map|hash|object) whose properties satisfy ([Andreas Lind](mailto://andreas@one.com))

### v4.1.6 (2014-08-26)

- [#52](https://github.com/unexpectedjs/unexpected/pull/52) Show the type name when doing a console log on a type ([Andreas Lind](mailto://andreas@one.com))

### v3.2.4 (2014-08-12)

- [#46](https://github.com/unexpectedjs/unexpected/pull/46) Implemented 'to be close to' assertion ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#45](https://github.com/unexpectedjs/unexpected/pull/45) Implemented 'to be canonical' assertion ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#44](https://github.com/unexpectedjs/unexpected/pull/44) Consider Error instances different when their 'message' properties differ ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#43](https://github.com/unexpectedjs/unexpected/pull/43) Throw if an assertion is redefined. ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v3.2.0 (2014-05-15)

- [#41](https://github.com/unexpectedjs/unexpected/pull/41) Use custom types for all types ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v3.1.5 (2014-04-22)

- [#37](https://github.com/unexpectedjs/unexpected/pull/37) to not only have keys should expect the given keys to be present ([Andreas Lind Petersen](mailto://andreas@one.com))

### v3.1.2 (2014-04-08)

- [#34](https://github.com/unexpectedjs/unexpected/pull/34) Do a hex dump of Buffer instances to make them more diffable. ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#33](https://github.com/unexpectedjs/unexpected/pull/33) Inline equal and guard against circular structures ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v3.1.0 (2014-04-05)

- [#32](https://github.com/unexpectedjs/unexpected/pull/32) Adding support for custom types ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v3.0.0 (2014-03-21)

- [#30](https://github.com/unexpectedjs/unexpected/pull/30) Eliminate build step for node js and mocha ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v2.0.0 (2013-12-20)

- [#26](https://github.com/unexpectedjs/unexpected/pull/26) Added 'to have properties' assertion ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v1.0.8 (2013-11-15)

- [#17](https://github.com/unexpectedjs/unexpected/pull/17) Added 'to be an array whose items satisfy' assertion ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v1.0.6 (2013-11-13)

- [#16](https://github.com/unexpectedjs/unexpected/pull/16) Corrected a spelling mistake in an usage example ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v1.0.4 (2013-11-12)

- [#14](https://github.com/unexpectedjs/unexpected/pull/14) Implemented 'to be true' and 'to be false' shorthands. ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v1.0.1 (2013-09-17)

- [#11](https://github.com/unexpectedjs/unexpected/pull/11) Implemented 'to be finite' and 'to be infinite' assertions. ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#9](https://github.com/unexpectedjs/unexpected/pull/9) Added 'to be null' and 'to be undefined' assertions ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v1.0.0 (2013-09-16)

- [#7](https://github.com/unexpectedjs/unexpected/pull/7) Include 'expected' and 'actual' properties on the exception object ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#8](https://github.com/unexpectedjs/unexpected/pull/8) 'to be' and 'to equal': Added tests for Buffer instances. ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v0.1.1 (2013-09-11)

- [#4](https://github.com/unexpectedjs/unexpected/pull/4) Remove unexpected's entries from the stack traces of the thrown error objectsThis is really nice - thank very much! ([Sune Simonsen](mailto://sune@we-knowhow.dk))
- [#3](https://github.com/unexpectedjs/unexpected/pull/3) Fixed regular expression assertions and added shorthands ([Sune Simonsen](mailto://sune@we-knowhow.dk))

### v0.1.0 (2013-09-03)

- [#2](https://github.com/unexpectedjs/unexpected/pull/2) Fixed grammar: (less|greater) than or equal{s =>} ([Sune Simonsen](mailto://sune@we-knowhow.dk))

