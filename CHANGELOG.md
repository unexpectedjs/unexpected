### v11.14.0 (2020-03-24)

- [#705](https://github.com/unexpectedjs/unexpected/pull/705) Add support for &lt;object&gt; to have \(unconfigurable|unenumerable|unwritable|readonly|read-only\) property &lt;string|Symbol&gt; ([Andreas Lind](mailto:andreas.lind@peakon.com), [Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#701](https://github.com/unexpectedjs/unexpected/pull/701) Upgrade rollup to version 2.0.3 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))

### v11.13.0 (2020-02-13)

#### Pull requests

- [#696](https://github.com/unexpectedjs/unexpected/pull/696) Add support for symbols in &lt;object&gt; to have property\/properties... ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#695](https://github.com/unexpectedjs/unexpected/pull/695) Remove support for: not to have \(configurable|enumerable|writable\) property ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#697](https://github.com/unexpectedjs/unexpected/pull/697) utils.isArray: Use Array.isArray if available ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#698](https://github.com/unexpectedjs/unexpected/pull/698) Rewrite calculateLimits ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#691](https://github.com/unexpectedjs/unexpected/pull/691) Upgrade diff to version 4.0.2 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#684](https://github.com/unexpectedjs/unexpected/pull/684) Bring in unexpected-markdown 5 and reconfigure test setup to match. ([Alex J Burke](mailto:alex@alexjeffburke.com))

#### Commits to master

- [Revert "Temporarily pin deno to v0.27.0 due to an openssl linking issue."](https://github.com/unexpectedjs/unexpected/commit/94728c20dcfab663b508270a5cbd76d04cd94d97) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Temporarily pin deno to v0.27.0 due to an openssl linking issue.](https://github.com/unexpectedjs/unexpected/commit/53c168fe5950da95a6220b1484f355c4e9cfe0f2) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Don't try to run hyperlink after updating examples](https://github.com/unexpectedjs/unexpected/commit/bbf153adb5e66acbb0276b7f0c92e942c5c91c78) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

### v11.12.1 (2019-12-31)

#### Pull requests

- [#683](https://github.com/unexpectedjs/unexpected/pull/683) Clone aware magic pen themes ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [#682](https://github.com/unexpectedjs/unexpected/pull/682) Upgrade eslint-plugin-node to version 11.0.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))

#### Commits to master

- [Fix path to bin in Makefile after 56194bc.](https://github.com/unexpectedjs/unexpected/commit/d8aee944feaf8fc3fd165d8fab478b64174660c1) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Only run hyperlink on release so "npm run generate-site" doesn't become too slow](https://github.com/unexpectedjs/unexpected/commit/56194bc75948c125d7ed6fc8a44b27c2dad32efd) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

### v11.12.0 (2019-12-26)

- [#679](https://github.com/unexpectedjs/unexpected/pull/679) Replace leven with ukkonen ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#677](https://github.com/unexpectedjs/unexpected/pull/677) Upgrade nyc to version 15.0.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))

### v11.11.0 (2019-12-19)

#### Pull requests

- [#675](https://github.com/unexpectedjs/unexpected/pull/675) Always define Symbol and Buffer, even if the runtime doesn't support them ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

#### Commits to master

- [Revert "Pin deno to v0.25.0 until a timers issue in v0.26.0 is resolved."](https://github.com/unexpectedjs/unexpected/commit/73514bde8fb861474b40aeef9e9dadad64479e5e) ([Alex J Burke](mailto:alex@alexjeffburke.com))

### v11.10.0 (2019-12-18)

#### Pull requests

- [#674](https://github.com/unexpectedjs/unexpected/pull/674) Add support for BigInt ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

#### Commits to master

- [Fix typos in test descriptions](https://github.com/unexpectedjs/unexpected/commit/2969dfd38f5ba2eda5f717b9fe0019a49ba190b8) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Remove duplicated function name that confuses the TS compiler.](https://github.com/unexpectedjs/unexpected/commit/9b6ac24aaee1e29cad3c39b3920659f51dba767c) ([Alex J Burke](mailto:alex@alexjeffburke.com))

### v11.9.0 (2019-12-15)

#### Pull requests

- [#671](https://github.com/unexpectedjs/unexpected/pull/671) Support an "only" flag in the "to have properties" assertion. ([Alex J Burke](mailto:alex@alexjeffburke.com), [Andreas Lind](mailto:andreaslindpetersen@gmail.com))

#### Commits to master

- [Build with node 8.16.2 instead of 8.7.0](https://github.com/unexpectedjs/unexpected/commit/cd4c62faa74e3de230b6a295b2d9f129a22869c0) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Pin deno to v0.25.0 until a timers issue in v0.26.0 is resolved.](https://github.com/unexpectedjs/unexpected/commit/f77eadbff74bc63ec92faf0286fe628dc4c80a1d) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Catch up with deno install script default path change.](https://github.com/unexpectedjs/unexpected/commit/8ab57331f05b567bb3b83fe0b0043e0525109403) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Rename variable "unexpected" =&gt; "expect" in top-level creation code.](https://github.com/unexpectedjs/unexpected/commit/bf643675ce816ba2997466dd5e14922db5b1f7a3) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [docs\(addAssertion\): document alternations, flags and optional values \(\#668\)](https://github.com/unexpectedjs/unexpected/commit/9c35e90a2b10aea1892cbbeea6196ede610447a0) ([Joel Mukuthu](mailto:joelmukuthu@gmail.com))

### v11.8.1 (2019-11-12)

- [#667](https://github.com/unexpectedjs/unexpected/pull/667) Upgrade prettier to version 1.19.1 ([Andreas Lind](mailto:andreaslindpetersen@gmail.com), [depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#666](https://github.com/unexpectedjs/unexpected/pull/666) Upgrade karma to version 4.4.1 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#664](https://github.com/unexpectedjs/unexpected/pull/664) Upgrade jasmine to version 3.5.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#663](https://github.com/unexpectedjs/unexpected/pull/663) Upgrade eslint-plugin-node to version 10.0.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#658](https://github.com/unexpectedjs/unexpected/pull/658) Upgrade karma-chrome-launcher to version 3.1.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#662](https://github.com/unexpectedjs/unexpected/pull/662) Check documentation link integrity when building docs ([Peter Müller](mailto:munter@fumle.dk))
- [#661](https://github.com/unexpectedjs/unexpected/pull/661) Upgrade karma to version 4.3.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))

### v11.8.0 (2019-08-28)

#### Pull requests

- [#657](https://github.com/unexpectedjs/unexpected/pull/657) ESM build with Deno support ([Alex J Burke](mailto:alex@alexjeffburke.com), [Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#656](https://github.com/unexpectedjs/unexpected/pull/656) Upgrade eslint-plugin-mocha to version 6.0.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#654](https://github.com/unexpectedjs/unexpected/pull/654) docs: use correct writing form for Node.js ([Liran Tal](mailto:liran.tal@gmail.com))
- [#655](https://github.com/unexpectedjs/unexpected/pull/655) Try to fix the build ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#653](https://github.com/unexpectedjs/unexpected/pull/653) Upgrade karma to version 4.2.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))

#### Commits to master

- [Update eslint-config-standard to version 14.0.0 \(\#660\)](https://github.com/unexpectedjs/unexpected/commit/b5b5b78a4013992b4bf0f2c8e1b49c83159f5e7e) ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))

### v11.7.0 (2019-07-14)

#### Pull requests

- [#651](https://github.com/unexpectedjs/unexpected/pull/651) Allow "not to be defined" to check for undefined. ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [#652](https://github.com/unexpectedjs/unexpected/pull/652) Upgrade karma-chrome-launcher to version 3.0.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#650](https://github.com/unexpectedjs/unexpected/pull/650) Upgrade eslint-config-standard to version 13.0.1 ([Andreas Lind](mailto:andreaslindpetersen@gmail.com), [depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#648](https://github.com/unexpectedjs/unexpected/pull/648) Upgrade eslint-config-prettier to version 6.0.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#646](https://github.com/unexpectedjs/unexpected/pull/646) Upgrade unexpected-markdown to version 4.0.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#647](https://github.com/unexpectedjs/unexpected/pull/647) Upgrade unexpected-magicpen to version 2.0.0 ([depfu[bot]](mailto:23717796+depfu[bot]@users.noreply.github.com))
- [#644](https://github.com/unexpectedjs/unexpected/pull/644) Rework "to satisfy" documentation to clarify the semantics. ([Alex J Burke](mailto:alex@alexjeffburke.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#643](https://github.com/unexpectedjs/unexpected/pull/643) Upgrade eslint-config-prettier to version 5.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))

#### Commits to master

- [Actually add the new unexpected-rxjs to the plugin docs](https://github.com/unexpectedjs/unexpected/commit/3b08c7db861430796cf59cf24dc46401255aa71b) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fix lint](https://github.com/unexpectedjs/unexpected/commit/33209a92a89c1852e8d9e64c6e9b13d963280534) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Remove no longer used rollup-plugin-uglify](https://github.com/unexpectedjs/unexpected/commit/f9102bc737723bc50c0b07f6fc0f1ad772915991) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Fix complex specifications link target.](https://github.com/unexpectedjs/unexpected/commit/039e123594f235fb1357ad5f89b98e84c943cb2f) ([Alex J Burke](mailto:alex@alexjeffburke.com))

### v11.6.1 (2019-06-13)

#### Pull requests

- [#642](https://github.com/unexpectedjs/unexpected/pull/642) Fix context reset for child expect's ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#641](https://github.com/unexpectedjs/unexpected/pull/641) Upgrade prettier to version 1.18.2 ([Andreas Lind](mailto:andreaslindpetersen@gmail.com), [depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#639](https://github.com/unexpectedjs/unexpected/pull/639) Upgrade rollup-plugin-terser to version 5.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#638](https://github.com/unexpectedjs/unexpected/pull/638) Replace uglify-js with terser ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

#### Commits to master

- [Update rollup-plugin-node-resolve to version 5.0.0](https://github.com/unexpectedjs/unexpected/commit/284a61f20b68e8c6ae761816d4ff198979b4ff42) ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))

### v11.6.0 (2019-05-20)

#### Pull requests

- [#555](https://github.com/unexpectedjs/unexpected/pull/555) expect.it: Forward flags to assertions further down the parameter list ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#636](https://github.com/unexpectedjs/unexpected/pull/636) Upgrade rollup-plugin-commonjs to version 10.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))

#### Commits to master

- [Hardwire uglify-js at 3.5.12 in an attempt to fix the build](https://github.com/unexpectedjs/unexpected/commit/54e492df7625627d80bdca009468dadc7e64e77a) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Revert "Revert "Merge pull request \#636 from unexpectedjs\/depfu\/update\/npm\/rollup-plugin-commonjs-10.0.0""](https://github.com/unexpectedjs/unexpected/commit/e3894ac4451dc46e67a11411830bae679d4307fe) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Revert "Merge pull request \#636 from unexpectedjs\/depfu\/update\/npm\/rollup-plugin-commonjs-10.0.0"](https://github.com/unexpectedjs/unexpected/commit/f710d0ade735b2dac8fff425d5b366ca0f6a26dc) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

### v11.5.1 (2019-05-12)

- [#633](https://github.com/unexpectedjs/unexpected/pull/633) Fix compatibility with the esm module loader ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

### v11.5.0 (2019-05-10)

- [#632](https://github.com/unexpectedjs/unexpected/pull/632) Inspect Buffers with Buffer.from\(\[0x00, ...\]\) instead of Buffer\(\[0x00, ...\]\) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#630](https://github.com/unexpectedjs/unexpected/pull/630) Upgrade eslint-plugin-node to version 9.0.1 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))

### v11.4.1 (2019-05-02)

- [#627](https://github.com/unexpectedjs/unexpected/pull/627) Always omit at least two lines in string diffs ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#628](https://github.com/unexpectedjs/unexpected/pull/628) Fix highlighting of diffing trailing whitespace in the last line ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#626](https://github.com/unexpectedjs/unexpected/pull/626) Wire a plugins build canary target into the Travis build matrix. ([Alex J Burke](mailto:alex@alexjeffburke.com))

### v11.4.0 (2019-04-25)

- [#625](https://github.com/unexpectedjs/unexpected/pull/625) Do not highlight "trailing" whitespace in diff chunks that aren't the end of the line ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#610](https://github.com/unexpectedjs/unexpected/pull/610) exportStyle: Pass on the allowRedefinition parameter to the parent's addStyle ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

### v11.3.0 (2019-04-24)

#### Pull requests

- [#624](https://github.com/unexpectedjs/unexpected/pull/624) Truncate large consecutive blocks of unchanged text in the string diff ([Andreas Lind](mailto:andreaslindpetersen@gmail.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#622](https://github.com/unexpectedjs/unexpected/pull/622) Don't trigger the footgun protection when a promise is .then\(\)ed but not fully awaited ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#621](https://github.com/unexpectedjs/unexpected/pull/621) Disallow .hook\(\) on a frozen expect ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#620](https://github.com/unexpectedjs/unexpected/pull/620) Upgrade nyc to version 14.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#618](https://github.com/unexpectedjs/unexpected/pull/618) Upgrade prettier to version 1.17.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#619](https://github.com/unexpectedjs/unexpected/pull/619) Upgrade karma to version 4.1.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#616](https://github.com/unexpectedjs/unexpected/pull/616) Upgrade mocha to version 6.1.2 ([Andreas Lind](mailto:andreaslindpetersen@gmail.com), [depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#614](https://github.com/unexpectedjs/unexpected/pull/614) Upgrade jasmine to version 3.4.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#613](https://github.com/unexpectedjs/unexpected/pull/613) Update the changelog in the preversion hook, avoiding an extra commit ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#609](https://github.com/unexpectedjs/unexpected/pull/609) No need for the BABEL\_ENV anymore ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Only run the external tests through Mocha](https://github.com/unexpectedjs/unexpected/commit/168588c8554b9cb5bc40ddb6fc72407bc0fa1545) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed jest warning](https://github.com/unexpectedjs/unexpected/commit/fc74f69119f0d36f1f06637efa789a23344ff5c9) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Update offline-github-changelog to ^1.6.1](https://github.com/unexpectedjs/unexpected/commit/cbf209ac644a41cd20f4083ffc733625610dd054) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Use the version hook instead of preversion](https://github.com/unexpectedjs/unexpected/commit/d21792db4cd1e34cc890bda360d51afd42df5f88) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Update karma-browserstack-launcher to 1.5.1](https://github.com/unexpectedjs/unexpected/commit/5cff4cd5af2074c3dc1089dd5cb1b37bd2125904) ([Andreas Lind](mailto:andreas.lind@peakon.com))
- [+2 more](https://github.com/unexpectedjs/unexpected/compare/v11.2.0...v11.3.0)

### v11.2.0 (2019-03-13)

#### Pull requests

- [#604](https://github.com/unexpectedjs/unexpected/pull/604) Upgrade jest to version 24.4.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#608](https://github.com/unexpectedjs/unexpected/pull/608) Replace babel with buble ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/a3d1f22c7a5dc108b4bbeb697c4fce9597bc90c8) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v11.1.2 (2019-03-13)

#### Pull requests

- [#607](https://github.com/unexpectedjs/unexpected/pull/607) Upgrade magicpen to version 6.0.2 ([Sune Simonsen](mailto:sune@we-knowhow.dk), [depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#602](https://github.com/unexpectedjs/unexpected/pull/602) From v11 function inherits object, so there is no need to state both in assertions ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#600](https://github.com/unexpectedjs/unexpected/pull/600) Remove shim and sham ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#601](https://github.com/unexpectedjs/unexpected/pull/601) Add highlights from the remaining major releases to the releases page ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#565](https://github.com/unexpectedjs/unexpected/pull/565) Merge the Unexpected instance with the expect function, and make wrapped\/nested expects have the parent as the prototype ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

#### Commits to master

- [Remove unexpected.js and unexpected.js.map from version control](https://github.com/unexpectedjs/unexpected/commit/9bb0bc14b3a86fbe6c8f232953d91b105614f1af) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/1a85b1dcb1aa55d77bc306b4ea463f45792dd95d) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

### v11.1.1 (2019-03-01)

#### Pull requests

- [#599](https://github.com/unexpectedjs/unexpected/pull/599) Make UnexpectedError\#expect non-enumerable ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#598](https://github.com/unexpectedjs/unexpected/pull/598) Upgrade karma to version 4.0.1 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#597](https://github.com/unexpectedjs/unexpected/pull/597) Split the plugin list into maintained by us and 3rdparty plugins ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/c734e230cbbee0c4a851718fedec453358acd923) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/8d60942461555e4ee492a64114498363c0f33612) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

### v11.1.0 (2019-02-25)

#### Pull requests

- [#595](https://github.com/unexpectedjs/unexpected/pull/595) to throw an: fulfill the promise with the error ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#592](https://github.com/unexpectedjs/unexpected/pull/592) Upgrade find-node-modules to version 2.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#588](https://github.com/unexpectedjs/unexpected/pull/588) Upgrade eslint-config-prettier to version 4.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#586](https://github.com/unexpectedjs/unexpected/pull/586) Upgrade karma to version 4.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#480](https://github.com/unexpectedjs/unexpected/pull/480) Lint JavaScript snippets in the documentation ([Andreas Lind](mailto:andreas.lind@peakon.com), [Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#581](https://github.com/unexpectedjs/unexpected/pull/581) Deprecate legacy typeless addAssertion ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#583](https://github.com/unexpectedjs/unexpected/pull/583) Upgrade prettier to version 1.16.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#580](https://github.com/unexpectedjs/unexpected/pull/580) Upgrade unexpected-documentation-site-generator to version 6.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#579](https://github.com/unexpectedjs/unexpected/pull/579) Upgrade unexpected-markdown to version 3.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/457508cd9bb22d57f0ca6f03b6095954d99dc20f) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Fix legacy typeless addAssertion in documentation](https://github.com/unexpectedjs/unexpected/commit/82686d35514d014ec2241c3610b9782e358139e3) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [.eslintrc.js: Remove unnecessary parserOptions](https://github.com/unexpectedjs/unexpected/commit/a9075c4280f1d32e4b51af9e8d7bcaa6a52db8c0) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/bcec979c948422ace8167ef108d878b520e424e5) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

### v11.0.1 (2019-01-15)

#### Pull requests

- [#577](https://github.com/unexpectedjs/unexpected/pull/577) Avoid deprecation warnings in node.js 10 because we have methods called inspect ([Andreas Lind](mailto:andreas.lind@peakon.com), [Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#578](https://github.com/unexpectedjs/unexpected/pull/578) Replace eslint-config-pretty-standard with eslint-config-{prettier,standard} ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#576](https://github.com/unexpectedjs/unexpected/pull/576) function type: Support inspection of classes and generators ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#575](https://github.com/unexpectedjs/unexpected/pull/575) Link to 'to satisfy' from the 'to have property' docs ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#571](https://github.com/unexpectedjs/unexpected/pull/571) removedHighlight style: Render newlines as \n ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#493](https://github.com/unexpectedjs/unexpected/pull/493) Clarify the function call in "to throw" documentation. ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [#573](https://github.com/unexpectedjs/unexpected/pull/573) Upgrade karma-browserstack-launcher to version 1.4.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#572](https://github.com/unexpectedjs/unexpected/pull/572) Upgrade diff to version 4.0.1 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#447](https://github.com/unexpectedjs/unexpected/pull/447) Upgrade diff to version 3.5.0 ([Andreas Lind](mailto:andreaslindpetersen@gmail.com), [depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#569](https://github.com/unexpectedjs/unexpected/pull/569) Make a separate BrowserStack project for separate branches ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/0920d7d13e02c00a5487ce3203c0a90043d3e334) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Use the unexpected-dev project on browserstack for Travis "PR" builds](https://github.com/unexpectedjs/unexpected/commit/72b1397b269ca3dd62d2ae4a0b617c413a450077) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Empty commit to get the browser test back to a successful state](https://github.com/unexpectedjs/unexpected/commit/1f39b3b1c6d72e288312f94ecdcfdcfbc26993bc) ([Andreas Lind](mailto:andreas.lind@peakon.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/28caa56e58838b304049b8e14ccf59e5c66ce2f1) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

### v11.0.0 (2019-01-06)

#### Pull requests

- [#509](https://github.com/unexpectedjs/unexpected/pull/509) V11 \(Major\) ([Alex J Burke](mailto:alex@alexjeffburke.com), [Andreas Lind](mailto:andreas.lind@peakon.com), [Andreas Lind](mailto:andreas@one.com), [Andreas Lind](mailto:andreaslindpetersen@gmail.com), [Sune Simonsen](mailto:sune@we-knowhow.dk), [depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#567](https://github.com/unexpectedjs/unexpected/pull/567) Remove long-deprecated support for this.subject etc. in assertion handlers ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#566](https://github.com/unexpectedjs/unexpected/pull/566) Remove support for expect.async ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#564](https://github.com/unexpectedjs/unexpected/pull/564) Upgrade unexpected-documentation-site-generator to version 5.1.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#563](https://github.com/unexpectedjs/unexpected/pull/563) Upgrade rollup to version 1.0.1 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#546](https://github.com/unexpectedjs/unexpected/pull/546) Fix test script to execute headless browser in place of phantomjs. ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [#556](https://github.com/unexpectedjs/unexpected/pull/556) Simplify the "to be rejected with" and "to call the callback with error" assertions ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#559](https://github.com/unexpectedjs/unexpected/pull/559) Don't let changes to expect.output.preferredWidth propagate into existing clones ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#561](https://github.com/unexpectedjs/unexpected/pull/561) Made all internal doc URL's relative and with a trailing slash ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#562](https://github.com/unexpectedjs/unexpected/pull/562) Avoid http redirects in assets linked from the frontpage ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#550](https://github.com/unexpectedjs/unexpected/pull/550) Address a number of issues with array-like "to satisfy". ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [#547](https://github.com/unexpectedjs/unexpected/pull/547) Fix unexpected messy missing diff ([Alex J Burke](mailto:alex@alexjeffburke.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#543](https://github.com/unexpectedjs/unexpected/pull/543) &lt;object&gt; to satisfy &lt;object&gt;: Do not dereference properties that aren't needed for the assertion ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#448](https://github.com/unexpectedjs/unexpected/pull/448) Make the &lt;function&gt; type a subtype of &lt;object&gt; ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#542](https://github.com/unexpectedjs/unexpected/pull/542) Feature\/unsupport to have items with function ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#328](https://github.com/unexpectedjs/unexpected/pull/328) to satisfy: compare functions by value ([Andreas Lind](mailto:andreas.lind@peakon.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#517](https://github.com/unexpectedjs/unexpected/pull/517) Freeze the top-level expect ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#407](https://github.com/unexpectedjs/unexpected/pull/407) Drop compatibility with pre-10.10.0 type.diff return values ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/41abbe34a7167a0ce2bbcf165e0207fbb226d0a9) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Revert "REVERT once v11 is out of beta: Specify tag:beta in package.json"](https://github.com/unexpectedjs/unexpected/commit/0e6a87c8962b402866146f90310204a88823b65a) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Revert "REVERT ME when merging v11 to master: Don't deploy the documentation site when doing releases"](https://github.com/unexpectedjs/unexpected/commit/e256d8397082dd2da18ac77069c10ae680495acd) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Docs: Use https urls on the plugin page, fix a dead link](https://github.com/unexpectedjs/unexpected/commit/1d223cd8fff1b328f69d5a6783c509bcafb1f285) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Docs: List unexpected-preact on the plugins page](https://github.com/unexpectedjs/unexpected/commit/9313d44524fdf0aab8cf22caf835e075731df379) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [+1 more](https://github.com/unexpectedjs/unexpected/compare/v10.40.2...v11.0.0)

### v10.40.2 (2019-01-02)

#### Pull requests

- [#554](https://github.com/unexpectedjs/unexpected/pull/554) mocha: Use --require unexpected-markdown instead of --compilers ... ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b23c69b5243493e34d2c15adfca92265176a9063) ([Andreas Lind](mailto:andreas.lind@peakon.com))
- [function type: Fix reindentation of single line arrow functions](https://github.com/unexpectedjs/unexpected/commit/0d9dde1eed26d7c6151f72b3ca165e4bb46c7cde) ([Andreas Lind](mailto:andreas.lind@peakon.com))
- [Documentation: Fix link to unexpected-webdriver](https://github.com/unexpectedjs/unexpected/commit/82da4f0a21357ea16e1d62ce577a51fc32bb247a) ([Andreas Lind](mailto:andreas.lind@peakon.com))
- [Karma: Bump the mocha timeout to one minute to match v11](https://github.com/unexpectedjs/unexpected/commit/385236ba77f623a88514510bd5e8d28b1548eb76) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Fix typo in test descriptions](https://github.com/unexpectedjs/unexpected/commit/8f44fb456f45f81f18511f9248ba1415e52e5222) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [+7 more](https://github.com/unexpectedjs/unexpected/compare/v10.40.1...v10.40.2)

### v10.40.1 (2018-12-31)

#### Pull requests

- [#553](https://github.com/unexpectedjs/unexpected/pull/553) Fix inspection of single line arrow functions that have a linebreak right after the arrow ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/aeea51c625b96c338358f8bc104238ea5574bc4c) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/1248cb8d5cb504ba5187a10528572544fefc0c9e) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.40.0 (2018-12-26)

#### Pull requests

- [#540](https://github.com/unexpectedjs/unexpected/pull/540) Added karma, mocha, chrome headless setup ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#539](https://github.com/unexpectedjs/unexpected/pull/539) Upgrade rollup-plugin-node-resolve to version 4.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#538](https://github.com/unexpectedjs/unexpected/pull/538) Fix special casing of UnexpectedError in &lt;function&gt; to error\/throw ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/1bb4f261fb2cb378034e0f8b129000f01bd0f772) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Update rollup to version 0.68.1](https://github.com/unexpectedjs/unexpected/commit/5d0457a358312dff6e9b8de7361a0da15137adf0) ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/9b30831c8365a531dce26af401ca5ebdc5d5fb7c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.39.2 (2018-11-18)

#### Pull requests

- [#534](https://github.com/unexpectedjs/unexpected/pull/534) Fix the output to make the unexpected-dom test suite pass ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#527](https://github.com/unexpectedjs/unexpected/pull/527) Upgrade gh-pages to version 2.0.1 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/1c486b1e90390437a227a64fec212c5484a184ae) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Lock jasmine down to ~3.2.0](https://github.com/unexpectedjs/unexpected/commit/63ce9895eab937b8418879dde1086642c1c98c4c) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [eslint --fix .](https://github.com/unexpectedjs/unexpected/commit/c39040be29e9e58c9d31c462c3fa248c24caf477) ([Andreas Lind](mailto:andreas.lind@peakon.com))
- [Update prettier to version 1.15.1](https://github.com/unexpectedjs/unexpected/commit/a7fb0c5d129430fd7a4b9552eb905d725432bc76) ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/2addd3a630728e3da283b5d2bc46a887c1578699) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.39.1 (2018-09-30)

#### Pull requests

- [#522](https://github.com/unexpectedjs/unexpected/pull/522) Use arrow functions when possible ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#521](https://github.com/unexpectedjs/unexpected/pull/521) Add and configure eslint-plugin-mocha ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#519](https://github.com/unexpectedjs/unexpected/pull/519) Fix\/hack inspection of arrow functions with leading newline \(prettier-ism\) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#518](https://github.com/unexpectedjs/unexpected/pull/518) Link to the documentation site using https ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#516](https://github.com/unexpectedjs/unexpected/pull/516) Upgrade rollup to version 0.66.1 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#511](https://github.com/unexpectedjs/unexpected/pull/511) Upgrade rollup to version 0.65.2 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/26e731a05126059038708dbf39b74d2c40bea36d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Docs, plugins page: Update the unexpected-dom url](https://github.com/unexpectedjs/unexpected/commit/0b5453ae192a61b3be2bae26004f63a135930e44) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/1517e387fed174992c7ee390cae408e2528bc7d5) ([Alex J Burke](mailto:alex@alexjeffburke.com))

### v10.39.0 (2018-09-06)

#### Pull requests

- [#504](https://github.com/unexpectedjs/unexpected/pull/504) Truncate subject in begin and end with assertions ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [#492](https://github.com/unexpectedjs/unexpected/pull/492) Add "to start with" as an alias for "to begin with". ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [#508](https://github.com/unexpectedjs/unexpected/pull/508) Revert "Merge pull request \#482 from alexjeffburke\/feature\/includeNonEnumerableProperties" ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#495](https://github.com/unexpectedjs/unexpected/pull/495) Upgrade rollup to version 0.63.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#482](https://github.com/unexpectedjs/unexpected/pull/482) Include non-enumerable properties ([Alex J Burke](mailto:alex@alexjeffburke.com), [Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#490](https://github.com/unexpectedjs/unexpected/pull/490) Upgrade rollup to version 0.62.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#487](https://github.com/unexpectedjs/unexpected/pull/487) Upgrade unexpected-magicpen to version 1.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#485](https://github.com/unexpectedjs/unexpected/pull/485) Upgrade rollup to version 0.61.1 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#484](https://github.com/unexpectedjs/unexpected/pull/484) Upgrade rollup to version 0.60.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#479](https://github.com/unexpectedjs/unexpected/pull/479) Reformat code snippets in the documentation ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#478](https://github.com/unexpectedjs/unexpected/pull/478) Document some more methods ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#477](https://github.com/unexpectedjs/unexpected/pull/477) Upgrade jest to version 23.0.0 ([depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/a6716bab22fe82edb8ebe6b8f3913a9d2a39d296) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Use gh-pages from node modules directory.](https://github.com/unexpectedjs/unexpected/commit/fb78c8bb296a2ec39ed248eace5d0683ea03b36e) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Fix jest\/jsdom interop in external tests](https://github.com/unexpectedjs/unexpected/commit/75f818d8eba733f31df938897c4c0af6f097096a) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Fix jest\/jsdom interop](https://github.com/unexpectedjs/unexpected/commit/d02ca51a589c992567f83ab06053ba4c1af42ab7) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [eslint --fix .](https://github.com/unexpectedjs/unexpected/commit/0da1e8ae09d6dcd74d271554b4d412cfa0eaca34) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [+10 more](https://github.com/unexpectedjs/unexpected/compare/v10.38.0...v10.39.0)

### v10.38.0 (2018-05-22)

#### Pull requests

- [#476](https://github.com/unexpectedjs/unexpected/pull/476) Implement Unexpected\#freeze \/ expect.freeze ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#467](https://github.com/unexpectedjs/unexpected/pull/467) add: negated assertions for 'to have an item satisfying' and 'to have… ([Jan Aagaard Meier](mailto:janzeh@gmail.com))
- [#475](https://github.com/unexpectedjs/unexpected/pull/475) Upgrade rollup-plugin-uglify to version 4.0.0 ([Andreas Lind](mailto:andreaslindpetersen@gmail.com), [depfu[bot]](mailto:depfu[bot]@users.noreply.github.com))
- [#472](https://github.com/unexpectedjs/unexpected/pull/472) Upgrade rollup to version 0.59.0 ([depfu[bot]](mailto:bot@depfu.com))
- [#471](https://github.com/unexpectedjs/unexpected/pull/471) Added link to the unexpected-reaction plugin ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#441](https://github.com/unexpectedjs/unexpected/pull/441) Only compact the subject when there is a diff ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/66e7fa4f78b9e8fb3b3c546c1b30ad7065f2de5c) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Avoid rollup deprecation warning by moving the banner config into output: {}](https://github.com/unexpectedjs/unexpected/commit/c85cab978f8dd316cb70652a19f19ac3a6c8723b) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [package.json: Fix weird empty object literal introduced by depfu](https://github.com/unexpectedjs/unexpected/commit/bb56e06e24689c3a1da774485b3aff9d95251222) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/a49d6c4d8a136c0406659b7470c91b5a72ed82b1) ([Alex J Burke](mailto:alex@alexjeffburke.com))

### v10.37.7 (2018-05-05)

#### Pull requests

- [#465](https://github.com/unexpectedjs/unexpected/pull/465) Fix key in value check that were not converted to type.hasKey\(\). ([Alex J Burke](mailto:alex@alexjeffburke.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/d1f9fba0fef5b05dc3a079a4bb281e581cb113ee) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/2ee634486eec5f023bbf09ee5829db1eb749f4c8) ([Andreas Lind](mailto:andreas.lind@peakon.com))

### v10.37.6 (2018-05-02)

#### Pull requests

- [#464](https://github.com/unexpectedjs/unexpected/pull/464) Add support for node.js 10 ([Andreas Lind](mailto:andreas.lind@peakon.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/c50e9ecfc59451000915eef000f0af36d3efa12c) ([Andreas Lind](mailto:andreas.lind@peakon.com))
- [Revert "Travis: Build with node.js 10"](https://github.com/unexpectedjs/unexpected/commit/c2d47327a5153c28be559e2871af69791a72ee4f) ([Andreas Lind](mailto:andreas.lind@peakon.com))
- [Travis: Build with node.js 10](https://github.com/unexpectedjs/unexpected/commit/c528aef8bba894b26c0c0d6b1a3e71ef3bdb408a) ([Andreas Lind](mailto:andreas.lind@peakon.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/319f4ec84c8246bcb5b8699294afcbc5bfa15ed4) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.37.5 (2018-04-18)

#### Pull requests

- [#457](https://github.com/unexpectedjs/unexpected/pull/457)  Fixed wrong error message seen in unexpected-dom ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#451](https://github.com/unexpectedjs/unexpected/pull/451) Upgrade jest to version 22.4.3 ([Andreas Lind](mailto:andreaslindpetersen@gmail.com), [depfu[bot]](mailto:bot@depfu.com))
- [#456](https://github.com/unexpectedjs/unexpected/pull/456) Upgrade rollup-plugin-uglify to version 3.0.0 ([depfu[bot]](mailto:bot@depfu.com))
- [#455](https://github.com/unexpectedjs/unexpected/pull/455) Upgrade rollup-plugin-commonjs to version 9.1.0 ([depfu[bot]](mailto:bot@depfu.com))
- [#454](https://github.com/unexpectedjs/unexpected/pull/454) Upgrade rollup to version 0.58.0 ([depfu[bot]](mailto:bot@depfu.com))
- [#450](https://github.com/unexpectedjs/unexpected/pull/450) Upgrade jasmine-core to version 3.1.0 ([depfu[bot]](mailto:bot@depfu.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/62c0814ec4ad63a76efe163c113586353b63a49f) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed jest setup](https://github.com/unexpectedjs/unexpected/commit/dfb5d5d2757948a9ee00b49db65fbc5e54a0f051) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Use ^ deps](https://github.com/unexpectedjs/unexpected/commit/c738697a814eb9d1831f6b49b08ceec5262709d4) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/c4d6e302547b117e10b7f40173067230e96375fb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.37.4 (2018-04-10)

#### Pull requests

- [#444](https://github.com/unexpectedjs/unexpected/pull/444) Fixed IE11+ browser support ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/c6343518f7e611db6a2958b71b1b16e765e96599) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/452caa293b0996c91c5ab131731a496e22eadf23) ([Andreas Lind](mailto:andreas.lind@peakon.com))

### v10.37.3 (2018-04-09)

#### Pull requests

- [#443](https://github.com/unexpectedjs/unexpected/pull/443) Trim stack traces with windows paths ([Peter Müller](mailto:munter@fumle.dk))
- [#442](https://github.com/unexpectedjs/unexpected/pull/442) Update offline GitHub changelog to credit PR authors ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#423](https://github.com/unexpectedjs/unexpected/pull/423) Additional object type overrides ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [#437](https://github.com/unexpectedjs/unexpected/pull/437) Only use eslint-plugin-prettier in a TTY ([Gustav Nikolaj Olsen](mailto:gno@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/448ee4bb293f1aa31e5ba36588fc216ecc150a2a) ([Andreas Lind](mailto:andreas.lind@peakon.com))
- [Point to the unexpected-dom documentation site](https://github.com/unexpectedjs/unexpected/commit/7f7d8c08a4fbac16b7b7fad10e7fb1fe6efac3cb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Do not require a global babel install in the Makefile.](https://github.com/unexpectedjs/unexpected/commit/9d4a82cbb0a1db304fdb4269427d472aebe4c310) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Travis: Build with node.js 9](https://github.com/unexpectedjs/unexpected/commit/a40ec480bbc3259a20c0cdcb5df05b2b6baac83e) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/75a582b710d83d7e77366863ff19e2edaa1348f6) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))

### v10.37.2 (2018-02-12)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/a06a40ded58beac1854838895eca2b498fbdcce5) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Skip test in Phantom.js](https://github.com/unexpectedjs/unexpected/commit/71ede5f926b39d7bec66b0f8f05b75b9cd3d613d) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Fix lint](https://github.com/unexpectedjs/unexpected/commit/b59264c61cc3d4c8cf9d9199eb2cc7bf713a5e21) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [UnexpectedError\#stack: Don't mess up when the error message contains $&](https://github.com/unexpectedjs/unexpected/commit/a35011602b7a03ebc7adb15dd5355ca20c01a09d) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/5066b563c13d7785de9c4fcebe56b63084da091e) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.37.1 (2018-02-11)

#### Pull requests

- [#436](https://github.com/unexpectedjs/unexpected/pull/436) Add prettier setup, run lebab, switch to 2 space indent ([Andreas Lind](mailto:andreas.lind@peakon.com), [Andreas Lind](mailto:andreaslindpetersen@gmail.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/89a616d51a7b152eb503875e49f771b9fd7733b9) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [UnexpectedError\#serializeMessage: Make regexp group non-capturing](https://github.com/unexpectedjs/unexpected/commit/54c0c6e029117fea710a1a1538cda5cb6d7cdbf4) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/5a0bf89d7c80a4c3d3c0ff94ac98f9ead9e71dbe) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.37.0 (2018-02-01)

#### Pull requests

- [#434](https://github.com/unexpectedjs/unexpected/pull/434) Remove user defined addAssertion handlers from stack ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#435](https://github.com/unexpectedjs/unexpected/pull/435) add unexpected-eventemitter to plugin list ([Christopher Hiller](mailto:boneskull@boneskull.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/3733b223300324b63e19ac4eed2ea583005ccfa3) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/cc66bf24d75d9cd8f786b1ecb9dc15d8a477bfee) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.36.3 (2018-01-19)

#### Pull requests

- [#433](https://github.com/unexpectedjs/unexpected/pull/433) Adding a failing test for expect.child not honoring type order ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#431](https://github.com/unexpectedjs/unexpected/pull/431) Update all dependencies that don't break with node 8 ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [#432](https://github.com/unexpectedjs/unexpected/pull/432) Add unexpected-generator to plugin list ([Gert Sønderby](mailto:gert.sonderby@gmail.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/27dbf26d49b4875d7207a6b2b375f7f1dda442a3) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Restructure Makefile slightly to avoid tripping up GNU make](https://github.com/unexpectedjs/unexpected/commit/a20ace0feb325db10456cfc0d4809ab5ea2dcfda) ([Andreas Lind](mailto:andreaslindpetersen@gmail.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/c39f5153acd089baa80a0df0cc1db57401a07526) ([Alex J Burke](mailto:alex@alexjeffburke.com))

### v10.36.2 (2017-11-20)

#### Pull requests

- [#428](https://github.com/unexpectedjs/unexpected/pull/428) Fix error on promise .and\(\) ([Alex J Burke](mailto:alex@alexjeffburke.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/58d30660be7612d0cca0e057abd5b10b96a365c0) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/bf22cdeba4d6d833632337f964895fac13e70f00) ([Alex J Burke](mailto:alex@alexjeffburke.com))

### v10.36.1 (2017-11-12)

#### Pull requests

- [#426](https://github.com/unexpectedjs/unexpected/pull/426) Fix array-like undefined non numerical keys and add Symbol support. ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [#425](https://github.com/unexpectedjs/unexpected/pull/425) Upgrade to array-changes 3.0.0. ([Alex J Burke](mailto:alex@alexjeffburke.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/f48cb51ebfac260d5ccda92d5727a3e9837caa43) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Avoid git commit alias in the Makefile.](https://github.com/unexpectedjs/unexpected/commit/3e1b2d4683d0a9f7f7898690721c132f8d9a24a9) ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [Spice up the main example](https://github.com/unexpectedjs/unexpected/commit/bd49685cdf5272e0d3e788824df788a01982d593) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated the changelog](https://github.com/unexpectedjs/unexpected/commit/a158d4e6df91a08c21897ff42bc3d87c921392b3) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fix changelog link from doc site](https://github.com/unexpectedjs/unexpected/commit/2386fc8a295964eba5d8909a5b1ebba817f43fef) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+1 more](https://github.com/unexpectedjs/unexpected/compare/v10.36.0...v10.36.1)

### v10.36.0 (2017-10-05)

#### Pull requests

- [#422](https://github.com/unexpectedjs/unexpected/pull/422) Generate changelog ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#421](https://github.com/unexpectedjs/unexpected/pull/421) Use ...rest params instead of Array\#apply ([Andreas Lind](mailto:andreas@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/7373e055e5d4461e98c77635dc4700bb512a737c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Only commit changelog if it is changed](https://github.com/unexpectedjs/unexpected/commit/f4cb4752aae5364ff6b1f21d53245d4977fbcfa1) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.34.5 (2017-09-03)

- [Use gh-pages instead of deploy-site](https://github.com/unexpectedjs/unexpected/commit/e4ea871487f52b5c634dfb059ed6e7c4f9b5894a) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.34.4 (2017-09-03)

- [Make sure we have an updated build folder after push the site gh-pages](https://github.com/unexpectedjs/unexpected/commit/4dac6d1b98f868238cb80c32050b044269a8663b) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.34.3 (2017-09-03)

- [Clean before a secondary build on travis](https://github.com/unexpectedjs/unexpected/commit/c0093da57b6780c71b83004d0341bf709007233c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Try a whitelist instead of .npmignore](https://github.com/unexpectedjs/unexpected/commit/f4952122ad72c707b79417ea8d1f6f44b1337621) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.34.2 (2017-09-03)

- [#420](https://github.com/unexpectedjs/unexpected/pull/420) Reintroduce Babel ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#419](https://github.com/unexpectedjs/unexpected/pull/419) Revert "Babel" ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.34.0 (2017-09-03)

#### Pull requests

- [#418](https://github.com/unexpectedjs/unexpected/pull/418) Babel ([Andreas Lind](mailto:andreas@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/42af56a000430bfe0acff53e0c342177eb72e889) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Remove the build folder as part of the clean target](https://github.com/unexpectedjs/unexpected/commit/2d173fde7e1d87b2d3583dd05df395c0c3104d70) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Update nyc to 11.1.0](https://github.com/unexpectedjs/unexpected/commit/9a467688980da430ab6aebf7ba7ca65b988cf7b5) ([Andreas Lind](mailto:andreas@one.com))

### v10.33.2 (2017-08-14)

#### Pull requests

- [#415](https://github.com/unexpectedjs/unexpected/pull/415) Don't break when a function has its own custom \#toString ([Andreas Lind](mailto:andreas@one.com))
- [#414](https://github.com/unexpectedjs/unexpected/pull/414) to have properties: Allow numerical property names passed as either strings or numbers ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/6836d05890ced6e0b6c680a129ef4a9624aad442) ([Andreas Lind](mailto:andreas@one.com))

### v10.33.1 (2017-08-05)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/3e0c09d7555b733bcd02ee5fdce7f85a2fc9b2f4) ([Gustav Nikolaj Olsen](mailto:gno@one.com))
- [implicit return multiline arrow function inspection \(\#412\)](https://github.com/unexpectedjs/unexpected/commit/7d84ccddeda40b9653dd3a70cddfe7ac7c86f7a8) ([Gustav Nikolaj](mailto:gustavnikolaj@gmail.com))
- [Fix dead link to the documentation of the SameValue algorithm](https://github.com/unexpectedjs/unexpected/commit/938b9da07ce8f81afe866a15333e285f7a1e6a0b) ([Andreas Lind](mailto:andreas@one.com))

### v10.33.0 (2017-08-01)

#### Pull requests

- [#409](https://github.com/unexpectedjs/unexpected/pull/409) Replace browserify with rollup, add source map and uglify unexpected.js ([Andreas Lind](mailto:andreas@one.com))
- [#406](https://github.com/unexpectedjs/unexpected/pull/406) Remove the ability for a plugin to specify required dependencies ([Andreas Lind](mailto:andreas@one.com))
- [#410](https://github.com/unexpectedjs/unexpected/pull/410) added: plugin unexpected-date ([Sushant](mailto:sushantdhiman@outlook.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/057934062e6f1f46606681e7ad150f6c7d1dcc3f) ([Andreas Lind](mailto:andreas@one.com))

### v10.32.1 (2017-07-15)

#### Pull requests

- [#408](https://github.com/unexpectedjs/unexpected/pull/408) Fix inspection of bound functions \(broken in 4485bf622 \/ 10.30.0\) ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/27df20c401f2d94cc5e0aaa7b5f80c883590cf4f) ([Andreas Lind](mailto:andreas@one.com))

### v10.32.0 (2017-07-06)

#### Pull requests

- [#403](https://github.com/unexpectedjs/unexpected/pull/403) Alias for to be a date ([Sushant](mailto:sushantdhiman@outlook.com))
- [#402](https://github.com/unexpectedjs/unexpected/pull/402) rename: to-be-one-of.js =&gt; to-be-one-of.spec.js ([Sushant](mailto:sushantdhiman@outlook.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b8ad073ec94975209d3492d7cf2bc3fc267130f5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.31.0 (2017-07-02)

#### Pull requests

- [#401](https://github.com/unexpectedjs/unexpected/pull/401) added: support for property descriptors ([Sushant](mailto:sushantdhiman@outlook.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b66acff5cadbdfb84b95bc763154a376433dafb7) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.30.0 (2017-07-01)

#### Pull requests

- [#387](https://github.com/unexpectedjs/unexpected/pull/387) Support inspection of arrow functions ([Andreas Lind](mailto:andreas@one.com))
- [#396](https://github.com/unexpectedjs/unexpected/pull/396) Don't allow a compound assertion where \(a prefix of\) the last half is not an existing assertion ([Andreas Lind](mailto:andreas@one.com))
- [#400](https://github.com/unexpectedjs/unexpected/pull/400) addStyle & installTheme: Return the expect function rather than the magicpen instance \(for chaining\) ([Andreas Lind](mailto:andreas@one.com))
- [#398](https://github.com/unexpectedjs/unexpected/pull/398) Document will-throw-a assertions for functions that take input ([Nicklas Laine Overgaard](mailto:nicklas@skarp.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/bc4c2ad4c52143f589fff44c5e215ef4e542340c) ([Andreas Lind](mailto:andreas@one.com))
- [Travis: Build with node.js 8](https://github.com/unexpectedjs/unexpected/commit/087344805e021c791099f5a07e6561784f693d22) ([Andreas Lind](mailto:andreas@one.com))
- [Copy the new example to the 'to throw' documentation, too.](https://github.com/unexpectedjs/unexpected/commit/321fb8ed188b1875044e27e8552ce658e989597f) ([Andreas Lind](mailto:andreas@one.com))

### v10.29.0 (2017-05-12)

#### Pull requests

- [#388](https://github.com/unexpectedjs/unexpected/pull/388) Introduce a first class context and use it to avoid serializing expect.it\(...\).or\(...\) ([Andreas Lind](mailto:andreas@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b86f3ecb4d0faa4ce2fd87e02ba7fe379db49e3d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Remove the logo from the readme as it seems to confuse package search](https://github.com/unexpectedjs/unexpected/commit/a9193705be39a9641a2f75357fa06a07fe048e05) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.28.0 (2017-05-08)

#### Pull requests

- [#397](https://github.com/unexpectedjs/unexpected/pull/397) to be \(a|an\) &lt;string&gt;: Always die when a non-existent type is specified ([Andreas Lind](mailto:andreas@one.com))
- [#392](https://github.com/unexpectedjs/unexpected/pull/392) Adding the logo to the readme to make medium links show the logo ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#389](https://github.com/unexpectedjs/unexpected/pull/389) Support expect.it\(function \(value\) {...}\) ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/5d88c6610171930e89db6e565a4dfdcf2992e841) ([Andreas Lind](mailto:andreas@one.com))
- [Using PNG logo from readme](https://github.com/unexpectedjs/unexpected/commit/ac3e9d39d5417655a691836be33ba6eac9b48fc0) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added PNG logo](https://github.com/unexpectedjs/unexpected/commit/ddbc2c33d4363731a3ca0491fcc8e06f8f29cf61) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Second attempt to trick Medium into showing our logo](https://github.com/unexpectedjs/unexpected/commit/af93fbe6aeabe727e822b57270806d12f74abb11) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added top-level logo to doc site](https://github.com/unexpectedjs/unexpected/commit/08145b82c1d67c1dbd75d6dcd29303afd7474d6c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+6 more](https://github.com/unexpectedjs/unexpected/compare/v10.27.0...v10.28.0)

### v10.27.0 (2017-04-17)

#### Pull requests

- [#385](https://github.com/unexpectedjs/unexpected/pull/385) Allow plugins to hook into the main expect function ([Andreas Lind](mailto:andreas@one.com))
- [#384](https://github.com/unexpectedjs/unexpected/pull/384) Fix flag forwarding for expect.it ([Andreas Lind](mailto:andreas@one.com))
- [#377](https://github.com/unexpectedjs/unexpected/pull/377) Child expect + exportAssertion ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/e0fb6f58dfbd8922472a20f759221247049121d7) ([Andreas Lind](mailto:andreas@one.com))
- [Update mocha to 3.2.0, switch to ^ version range.](https://github.com/unexpectedjs/unexpected/commit/b2e122f0196d1a9a50e28d46ddef7f75d6a9abeb) ([Andreas Lind](mailto:andreas@one.com))
- [Updated the to satisfy documentation sligtly](https://github.com/unexpectedjs/unexpected/commit/3fd69e66eb71281940da4122bf915f1677f63573) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.26.3 (2017-03-02)

#### Pull requests

- [#381](https://github.com/unexpectedjs/unexpected/pull/381) Fix the error message when an object is exhaustively satisfied against an object, and some keys are missing ([Andreas Lind](mailto:andreas@one.com))
- [#379](https://github.com/unexpectedjs/unexpected/pull/379) Upgraded Jest to the newest version. ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/61af9d2edeb298ed00d516bef48d3e09efc9f459) ([Andreas Lind](mailto:andreas@one.com))

### v10.26.2 (2017-02-27)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/70ab40f0b426161ee65ad1b060342ed7857cc5b8) ([Andreas Lind](mailto:andreas@one.com))
- [to satisfy: Don't break when the assertion fails and the subject has a property that also exists on Object.prototype](https://github.com/unexpectedjs/unexpected/commit/c94b00da5f397577d430ba8948fd22bef6ca5bf3) ([Andreas Lind](mailto:andreas@one.com))

### v10.26.1 (2017-02-26)

#### Pull requests

- [#376](https://github.com/unexpectedjs/unexpected/pull/376) Add assertion type signature to error messages relevant to it ([Peter Müller](mailto:munter@fumle.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/f14dd8be8b0c8013853676175fbf9965fa114fc6) ([Andreas Lind](mailto:andreas@one.com))
- [Makefile, test target: Don't pass --harmony-async-await now that node 7.6.0 supports async\/await without it.](https://github.com/unexpectedjs/unexpected/commit/4eb5b1144bee375b2cb761f20d1257f4962ee8a0) ([Andreas Lind](mailto:andreas@one.com))
- [type.inspect: Fix detection of whether inspect is invoked by util.inspect](https://github.com/unexpectedjs/unexpected/commit/543b474fb8425559ab5b34bba300cc2e7d569cf6) ([Andreas Lind](mailto:andreas@one.com))

### v10.26.0 (2017-02-16)

#### Pull requests

- [#372](https://github.com/unexpectedjs/unexpected/pull/372) addAssertion: Fail when the handler takes too many parameters ([Andreas Lind](mailto:andreas@one.com))
- [#371](https://github.com/unexpectedjs/unexpected/pull/371) Fix: `to exhaustively satisfy` doesn't consider a missing property to be identical to a property with a value of undefined \(\#370\) ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/77ba2efe2d6da4571d08868521d7a52e33862330) ([Andreas Lind](mailto:andreas@one.com))

### v10.25.0 (2017-02-04)

#### Pull requests

- [#367](https://github.com/unexpectedjs/unexpected/pull/367) to throw a\/an ([Andreas Lind](mailto:andreas@one.com))
- [#368](https://github.com/unexpectedjs/unexpected/pull/368) Consistently use the 'not to be empty' assertion for objects and arrays ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/5204042646cdbb01ccb1ce2fb9a53c64792cf303) ([Andreas Lind](mailto:andreas@one.com))

### v10.24.0 (2017-01-26)

#### Pull requests

- [#366](https://github.com/unexpectedjs/unexpected/pull/366) Normalized line breaks in test output. ([Gert Sønderby](mailto:gert.sonderby@gmail.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/36e0b33222b1aa71a9b9a9edd5c729d6209a798d) ([Andreas Lind](mailto:andreas@one.com))
- [update eslint-config-onelint \(1.2.0\) and eslint \(2.13.1\)](https://github.com/unexpectedjs/unexpected/commit/969cce663ee0bd0abd6bedd88171f28c233cabe7) ([Gustav Nikolaj Olsen](mailto:gno@one.com))

### v10.23.0 (2017-01-23)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/aab3f24abe78172559abb5f5e04a63736b9ddc4d) ([Andreas Lind](mailto:andreas@one.com))
- [Stop abusing .i\(\) to increase indentation, use indentLines\/outdentLines instead.](https://github.com/unexpectedjs/unexpected/commit/1d9f8740965b6ca2d3651848218e14d812093724) ([Andreas Lind](mailto:andreas@one.com))
- [Show the type signature of the subject and arguments when failing with "assertion not found".](https://github.com/unexpectedjs/unexpected/commit/96f5f7c4e175daf9449e2a36aac550de4a008918) ([Andreas Lind](mailto:andreas@one.com))

### v10.22.2 (2017-01-20)

#### Pull requests

- [#363](https://github.com/unexpectedjs/unexpected/pull/363) Jest suite up ([Andreas Lind](mailto:andreas@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/ba3b5bca804ef15bb9dff6ca6372271d25966b82) ([Andreas Lind](mailto:andreas@one.com))

### v10.22.1 (2017-01-19)

#### Pull requests

- [#361](https://github.com/unexpectedjs/unexpected/pull/361) Jest seems to just print the stack, so we need the error message in the stack ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/dd25863ae034e3c269bf01c7e5fe180442b613e0) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.22.0 (2017-01-09)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/ad48ca8146129ec7a71d093560b86b52905cbfd0) ([Andreas Lind](mailto:andreas@one.com))
- [Make notifyPendingPromise available as a property of the expect function, allowing it to be overridden.](https://github.com/unexpectedjs/unexpected/commit/36bc17ebdb3d9e2761f275c54f9607fe8376d90c) ([Andreas Lind](mailto:andreas@one.com))
- [Fixed typo in the documentation](https://github.com/unexpectedjs/unexpected/commit/bac7009108646fe6ca868ab7509e17309698f345) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Code cleanup](https://github.com/unexpectedjs/unexpected/commit/ff914d4ab4f74a0a9f9b10b4a293b4a1f8142c4d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.21.1 (2016-12-27)

#### Pull requests

- [#357](https://github.com/unexpectedjs/unexpected/pull/357) Highlight trailing whitespace in added\/removed string diff chunks ([Andreas Lind](mailto:andreas@one.com))
- [#353](https://github.com/unexpectedjs/unexpected/pull/353) Remove expect.promise from the docs ([Andreas Lind](mailto:andreas@one.com), [Joel Mukuthu](mailto:jmu@one.com), [Joel Mukuthu](mailto:joelmukuthu@gmail.com))
- [#354](https://github.com/unexpectedjs/unexpected/pull/354) Install the promise polyfill in one central place. ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/d982c6b07c0d4947b01e759c94a041af6f779f58) ([Andreas Lind](mailto:andreas@one.com))

### v10.21.0 (2016-12-18)

#### Pull requests

- [#338](https://github.com/unexpectedjs/unexpected/pull/338) Add &lt;object|array-like&gt; to have \(a value|an item\) satisfying &lt;any|assertion&gt; ([Andreas Lind](mailto:andreas@one.com), [Joel Mukuthu](mailto:jmu@one.com))
- [#355](https://github.com/unexpectedjs/unexpected/pull/355) Inspect async functions ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/0935287ab63530f6ec97c9e245d99bf1064ca542) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/4c4a40067e28d8730123679cddec293f33df8f0c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Travis: Enable build with node.js 7.](https://github.com/unexpectedjs/unexpected/commit/44fcc8e5a0bcdb31fd133f037943a443cde76150) ([Andreas Lind](mailto:andreas@one.com))
- [Makefile: Don't rely on .\/node\_modules\/.bin\/ being in $PATH. Fixes \#343.](https://github.com/unexpectedjs/unexpected/commit/afb5b1b9da312f4be01b5dae1d4638f72c31b5e6) ([Andreas Lind](mailto:andreas@one.com))

### v10.20.0 (2016-11-27)

#### Pull requests

- [#340](https://github.com/unexpectedjs/unexpected/pull/340) Add 'to be fulfilled with a value satisfying' and 'to be rejected with error satisfying' ([Joel Mukuthu](mailto:jmu@one.com))
- [#348](https://github.com/unexpectedjs/unexpected/pull/348) to have \(items|values|keys\) satisfying: Only allow one &lt;any&gt; as the value, not &lt;any+&gt; ([Andreas Lind](mailto:andreas@one.com))
- [#349](https://github.com/unexpectedjs/unexpected/pull/349) to have keys satisfying, to have values satisfying: Disallow an empty array ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/7c89ca5633e8283eeee1c6278904f81a9a86d536) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.19.0 (2016-11-14)

#### Pull requests

- [#344](https://github.com/unexpectedjs/unexpected/pull/344) Add '\[not\] to be one of' assertion ([Morten Siebuhr](mailto:sbhr@sbhr.dk))
- [#332](https://github.com/unexpectedjs/unexpected/pull/332) Consistently return the output from the inspect and diff methods of the built-in types ([Andreas Lind](mailto:andreas@one.com))
- [#336](https://github.com/unexpectedjs/unexpected/pull/336) Use eslint-plugin-import \(especially import\/no-extraneous-dependencies\). ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/34aa891ccd5252fc8f115b57ce95a087622c4e59) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Show off arrows in to equals example](https://github.com/unexpectedjs/unexpected/commit/ded88cee7daf296bdfbb87c9b48fe4916f749f04) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.18.1 (2016-09-26)

- [Move greedy-interval-packer from devDependencies to dependencies, oops.](https://github.com/unexpectedjs/unexpected/commit/18581ad133b3511682fe3916b8b2cce63ce2f02f) ([Andreas Lind](mailto:andreas@one.com))

### v10.18.0 (2016-09-26)

#### Pull requests

- [#333](https://github.com/unexpectedjs/unexpected/pull/333) Render array moves with arrows ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/0de627fe5c21d50d10f400526963dba9ae2527ae) ([Andreas Lind](mailto:andreas@one.com))

### v10.17.2 (2016-09-14)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/66182edf118c67e538543f2aa6521cefed8530fb) ([Andreas Lind](mailto:andreas@one.com))
- [Update array-changes-async to 2.2.1.](https://github.com/unexpectedjs/unexpected/commit/f9c4991e99e11a456e71fde1e4e403543ae8c173) ([Andreas Lind](mailto:andreas@one.com))

### v10.17.1 (2016-09-14)

#### Pull requests

- [#335](https://github.com/unexpectedjs/unexpected/pull/335) Upgraded array-changes ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/725b2a8608f5e625a91d8693a456efa589895112) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Simplify documentation test to avoid output differences between v8 5.1+ and everything else.](https://github.com/unexpectedjs/unexpected/commit/eff3eb2c39cef56aa80d8da6ee6ea965e4c2da24) ([Andreas Lind](mailto:andreas@one.com))

### v10.17.0 (2016-09-02)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/cb7ec1047315004be1724aded1387b2c8b925e05) ([Andreas Lind](mailto:andreas@one.com))
- [Fix the test suite with node.js 6.5.0.](https://github.com/unexpectedjs/unexpected/commit/a69540ebcb2b4cd3ffa29bf031572ad8abeebf58) ([Andreas Lind](mailto:andreas@one.com))
- [Makefile, travis target: Also depend on 'clean' so the targets will be rebuilt despite unexpected.js being checked in.](https://github.com/unexpectedjs/unexpected/commit/54f826aa94aac2ef01074eb033d0fd37e2630ea4) ([Andreas Lind](mailto:andreas@one.com))
- [Update magicpen to 5.10.0.](https://github.com/unexpectedjs/unexpected/commit/2866d1929c2d1efc88f09ba4b23588e207304e9e) ([Andreas Lind](mailto:andreas@one.com))

### v10.16.0 (2016-08-22)

#### Pull requests

- [#323](https://github.com/unexpectedjs/unexpected/pull/323) Preserve the stack of the actual error. ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/15fd52abd234ae3e805a003ac70ac6634e7a6917) ([Andreas Lind](mailto:andreas@one.com))
- [Fix the jasmine setup with npm 3.](https://github.com/unexpectedjs/unexpected/commit/e3d57e543c71be2010effb5d58108dc91896d120) ([Andreas Lind](mailto:andreas@one.com))
- [Include unexpected-magicpen.min.js in the JasmineRunner.html template.](https://github.com/unexpectedjs/unexpected/commit/fd83b9cba4bd5c149745b84b8ef44914e4453b49) ([Andreas Lind](mailto:andreas@one.com))

### v10.15.1 (2016-08-05)

#### Pull requests

- [#327](https://github.com/unexpectedjs/unexpected/pull/327) Fix subject compaction in nested settings ([Andreas Lind](mailto:andreas@one.com))
- [#326](https://github.com/unexpectedjs/unexpected/pull/326) Avoid some .then\(function \(\) {return something}\) constructs using promise.tap ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/9ed4523bc701727e517ba9852b0fd22701787fc5) ([Andreas Lind](mailto:andreas@one.com))
- [Update chewbacca to 1.10.0.](https://github.com/unexpectedjs/unexpected/commit/b9cc41e2c8c03b65db97961ff9ff8b6afba4acec) ([Andreas Lind](mailto:andreas@one.com))
- [Added a Github star badge to the documentation site](https://github.com/unexpectedjs/unexpected/commit/6ee37318fd9ba495cf1ab85a6fcae6671f19798b) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.15.0 (2016-07-15)

#### Pull requests

- [#321](https://github.com/unexpectedjs/unexpected/pull/321) Allow assertions to succeed without settling all promises ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/e34a3847174bc27658dea1865f4b7eeaee5a29ed) ([Andreas Lind](mailto:andreas@one.com))
- [Travis: Test with node.js 6 as well.](https://github.com/unexpectedjs/unexpected/commit/ccc630fb0c0f91b0b1b6491088c5a1f2e50ee556) ([Andreas Lind](mailto:andreas@one.com))
- [Update chewbacca to 1.9.0.](https://github.com/unexpectedjs/unexpected/commit/8609d346f75c01f6a27b2ce66b8af3ac7d4db2a0) ([Andreas Lind](mailto:andreas@one.com))
- [Fix lint.](https://github.com/unexpectedjs/unexpected/commit/897b8a1b297f79f394cbb8532a7c9c652debbbfb) ([Andreas Lind](mailto:andreas@one.com))
- [when sorted: Fix the non-array case.](https://github.com/unexpectedjs/unexpected/commit/bb5890a81f203dce058aef92c6a226c89af6c796) ([Andreas Lind](mailto:andreas@one.com))

### v10.14.2 (2016-06-23)

#### Pull requests

- [#314](https://github.com/unexpectedjs/unexpected/pull/314) Fix\/unexpected magicpen ([Andreas Lind](mailto:andreas@one.com))
- [#312](https://github.com/unexpectedjs/unexpected/pull/312) Add 'when sorted' and 'when sorted by' assertions for arrays ([Joel Mukuthu](mailto:jmu@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b55fad0c57ef09f7a4e6d9f0ce64c375356b406e) ([Andreas Lind](mailto:andreas@one.com))

### v10.14.1 (2016-06-22)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/2d3cb84f14b2454865e10b64c4f30bc097a123ea) ([Andreas Lind](mailto:andreas@one.com))
- [Remove magicPen style test \(moved to the unexpected-magicpen test suite\).](https://github.com/unexpectedjs/unexpected/commit/2b93b57a66f5c89a21bc994843b5b181bd78b49e) ([Andreas Lind](mailto:andreas@one.com))
- [Use 'to have message' in tests where possible.](https://github.com/unexpectedjs/unexpected/commit/2f6e5c186dad171fa07199d12a15c2447e64f1d4) ([Andreas Lind](mailto:andreas@one.com))
- [Use 'to have message' instead of 'to have text message' in assertions, whoops.](https://github.com/unexpectedjs/unexpected/commit/60767d7cd9fb2beb415b7e9c18e2898991c0e49f) ([Andreas Lind](mailto:andreas@one.com))

### v10.14.0 (2016-06-22)

#### Pull requests

- [#310](https://github.com/unexpectedjs/unexpected/pull/310) Move the magicpen type into a separate unexpected-magicpen plugin ([Andreas Lind](mailto:andreas@one.com))
- [#313](https://github.com/unexpectedjs/unexpected/pull/313) Fix case where mocha 2.2.0+ sidesteps the footgun detection by suppre… ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/4d155d7661b02e3c3936e12f519de5e6cf06f484) ([Andreas Lind](mailto:andreas@one.com))
- [Reintroduce &lt;Error&gt; to have message &lt;string&gt; in core.](https://github.com/unexpectedjs/unexpected/commit/40f4940ff5763b537db3561b78f1d1875fc52c79) ([Andreas Lind](mailto:andreas@one.com))
- [Added failing test that demonstrates a shortcoming with the afterEach-based detection of promises that should have been returned.](https://github.com/unexpectedjs/unexpected/commit/cfbbf7820ad6db0462e8121ce66503d92c0f662e) ([Andreas Lind](mailto:andreas@one.com))
- [Fix url in error message.](https://github.com/unexpectedjs/unexpected/commit/fc1ce8aef4d7a560c1ac4140448d80b012fa945e) ([Andreas Lind](mailto:andreas@one.com))

### v10.13.3 (2016-05-20)

#### Pull requests

- [#306](https://github.com/unexpectedjs/unexpected/pull/306) Expose \(almost\) all of Bluebird's static methods. ([Andreas Lind](mailto:andreas@one.com))
- [#305](https://github.com/unexpectedjs/unexpected/pull/305) Feature\/expect with one argument ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/f76257976f4e5b4bef30b4412ba79a08284d1c28) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated browser compatibility for now - will return to it](https://github.com/unexpectedjs/unexpected/commit/7588a0308539a34881813012fc615c500ac2db43) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Make sure that expect.use can handle function.name not being present on IE](https://github.com/unexpectedjs/unexpected/commit/a770e8e95e398863c6ce5d2ac562575e37d66db3) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Don't hack the stack in environments that don't make the error stack available as a getter](https://github.com/unexpectedjs/unexpected/commit/68270b78225564a9cf1dc3b12ac0ae295fc63505) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [&lt;object&gt; to satisfy &lt;object&gt;: Skip missing keys expected to be missing so they don't get rendered in the diff.](https://github.com/unexpectedjs/unexpected/commit/5f72bccf4cd3f1b0e2d21009c74c106748025cf1) ([Andreas Lind](mailto:andreas@one.com))

### v10.13.2 (2016-04-19)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/f85af50f625f9c95b809641531d9a7fe92252042) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Upgrade to the latest magicpen to avoid a check that is causing problems with older plug versions](https://github.com/unexpectedjs/unexpected/commit/7db4da35e8074bf494f51c4dc8e06b8269df97bb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.13.1 (2016-04-17)

#### Pull requests

- [#303](https://github.com/unexpectedjs/unexpected/pull/303) Update plugins page to link to unexpected-react docs ([Dave Brotherstone](mailto:davegb@pobox.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/abd678fe0f24a72574107a3a4f543e429ceda562) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Upgrade magicpen](https://github.com/unexpectedjs/unexpected/commit/52cd5dde8f067277984251f0d5e954003a361c34) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Test that the 'You have created a promise that was not returned from the it block' warning is emitted in multi-file suites.](https://github.com/unexpectedjs/unexpected/commit/3ca6ac119ac9b3cd896d324203274ad2d2a29016) ([Andreas Lind](mailto:andreas@one.com))
- [make test-phantomjs: Simplify how the JSON config is passed to mocha-phantomjs-core.](https://github.com/unexpectedjs/unexpected/commit/a2f14d4fe03a6eccb0f621411ff581c5b6ad78f6) ([Andreas Lind](mailto:andreas@one.com))

### v10.13.0 (2016-04-06)

#### Pull requests

- [#301](https://github.com/unexpectedjs/unexpected/pull/301) Don't inspect args for when called with as an array ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/2b228cc689009ba927f2043cef9e60323fef9baa) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.12.0 (2016-04-05)

#### Pull requests

- [#300](https://github.com/unexpectedjs/unexpected/pull/300) Feature\/cheaper long stack trace ([Andreas Lind](mailto:andreas@one.com))
- [#299](https://github.com/unexpectedjs/unexpected/pull/299) Switch from mocha-phantomjs-papandreou to mocha-phantomjs-core and st… ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/93c055d746f718c79f8badd081b211567369c7a4) ([Andreas Lind](mailto:andreas@one.com))
- [Whoops, don't depend on two phantom.js packages.](https://github.com/unexpectedjs/unexpected/commit/fd5ac4199e39321d99d4090b16e07485cba83eea) ([Andreas Lind](mailto:andreas@one.com))
- [Removed superfluous 2nd expect.shift arg.](https://github.com/unexpectedjs/unexpected/commit/035b93ea68c89f8d89493648ee89bc6c6db05b28) ([Andreas Lind](mailto:andreas@one.com))
- [Ensure that we get the new dark markdown theme](https://github.com/unexpectedjs/unexpected/commit/7115c01eb904059736e41f31ab4efe51659d0710) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Use ranges for the unexpected-markdown dependency](https://github.com/unexpectedjs/unexpected/commit/8b20531e1e3dcc3783bf3ad264d0633d5625a7cb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+2 more](https://github.com/unexpectedjs/unexpected/compare/v10.11.1...v10.12.0)

### v10.11.1 (2016-03-31)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/5c1094a65363ae7d22ccd878842fa345427e28c4) ([Andreas Lind](mailto:andreas@one.com))
- [findSuffixAssertions: Fix edge case where a failing assertion is followed by an assertion where a non-string is where an assertion should have been.](https://github.com/unexpectedjs/unexpected/commit/2d7f34091bb4b5d280be3a4b74d1c75ec76d8d89) ([Andreas Lind](mailto:andreas@one.com))

### v10.11.0 (2016-03-31)

#### Pull requests

- [#297](https://github.com/unexpectedjs/unexpected/pull/297) A fix and two new features for expect.promise\(function \(run\) {...}\) ([Andreas Lind](mailto:andreas@one.com))
- [#295](https://github.com/unexpectedjs/unexpected/pull/295) Only fail in the afterEach hook if the test was otherwise successful ([Andreas Lind](mailto:andreas@one.com))
- [#296](https://github.com/unexpectedjs/unexpected/pull/296) Update leven to 2.0.0. ([Andreas Lind](mailto:andreas@one.com))
- [#293](https://github.com/unexpectedjs/unexpected/pull/293) Add unexpected-webdriver plugin to docs ([Felix Gnass](mailto:fgnass@gmail.com))
- [#289](https://github.com/unexpectedjs/unexpected/pull/289) Implement &lt;function&gt; to be \(rejected|fulfilled\) \[with\] ([Andreas Lind](mailto:andreas@one.com))
- [#282](https://github.com/unexpectedjs/unexpected/pull/282) make coverage: Replace istanbul with nyc \(an istanbul wrapper\) ([Andreas Lind](mailto:andreas@one.com))
- [#288](https://github.com/unexpectedjs/unexpected/pull/288) add eslint and use the onelint shared configuration ([Gustav Nikolaj Olsen](mailto:gno@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/6f49d53c92d377d7888aa9df4e41373aaff28427) ([Andreas Lind](mailto:andreas@one.com))
- [Update coveralls to 2.11.9, use a liberal version range with ^.](https://github.com/unexpectedjs/unexpected/commit/fbf1f934cc73cd8da3c83a98e0531d45deb7d6ec) ([Andreas Lind](mailto:andreas@one.com))
- [Fix rendering of assertion strings when using certain compound assertions.](https://github.com/unexpectedjs/unexpected/commit/5ed6511409a72844ce307e54aa6f829d88bd81bd) ([Andreas Lind](mailto:andreas@one.com))
- [Added pending test.](https://github.com/unexpectedjs/unexpected/commit/99cd0e490bdb13c30db3993dea4ba91ef70fd9cf) ([Andreas Lind](mailto:andreas@one.com))
- [Save a var in utils.uniqueNonNumericalStringsAndSymbols.](https://github.com/unexpectedjs/unexpected/commit/d9893e552ef3122a805aeef7b7441c18caaaa62a) ([Andreas Lind](mailto:andreas@one.com))
- [+10 more](https://github.com/unexpectedjs/unexpected/compare/v10.10.12...v10.11.0)

### v10.10.12 (2016-03-18)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/5c6973b4809c6a92b845c379b206f4a0d6302235) ([Andreas Lind](mailto:andreas@one.com))
- [Always set the inline attribute when generating a diff. Fixes \#285.](https://github.com/unexpectedjs/unexpected/commit/9a9b6112bb32cba72f08105eb0493472a42b2536) ([Andreas Lind](mailto:andreas@one.com))

### v10.10.11 (2016-03-18)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/62bc3c4a666fb17345a76a465fd459c4c1deb0a2) ([Andreas Lind](mailto:andreas@one.com))
- [&lt;object&gt; to satisfy &lt;object&gt;: Fix the diff generation when a missing property is fulfilled by a function in the RHS.](https://github.com/unexpectedjs/unexpected/commit/11f87422f8242d5fcde70f2030820c170cd194be) ([Andreas Lind](mailto:andreas@one.com))

### v10.10.10 (2016-03-17)

#### Pull requests

- [#284](https://github.com/unexpectedjs/unexpected/pull/284) Fix UNEXPECTED\_FULL\_TRACE env variable for emulated DOM ([Dave Brotherstone](mailto:davegb@pobox.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/11c00efefb892a3af54af4772565d560e0da45b2) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.10.9 (2016-03-17)

#### Pull requests

- [#281](https://github.com/unexpectedjs/unexpected/pull/281) to exhaustively satisfy: Don't break with non-enumerable properties and allow matching on prototype properties ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/4fa4c2a2bdbd0458277cbedb41f05daf36d2ab62) ([Andreas Lind](mailto:andreas@one.com))

### v10.10.8 (2016-03-13)

#### Pull requests

- [#279](https://github.com/unexpectedjs/unexpected/pull/279) expect.it: Always fail when there's a misspelled assertion ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/342f9e483e8c31c02940291345adc052206edfdf) ([Andreas Lind](mailto:andreas@one.com))

### v10.10.6 (2016-03-13)

#### Pull requests

- [#280](https://github.com/unexpectedjs/unexpected/pull/280) Don't consider two different functions equal even if their toString\(\) methods return the same value ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/9b4815b7be928f668b0e302391d9c3f30d74ff35) ([Andreas Lind](mailto:andreas@one.com))

### v10.10.5 (2016-03-11)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/92eaa3bb55ed31d7c1d576c4348598d95acafae6) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Documented UnexpectedError.isUnexpected](https://github.com/unexpectedjs/unexpected/commit/ac32ff67336748de039116c4cfdbf6c4bf3ec3ad) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Changing UnexpectedError name back to `UnexpectedError` as the change was breaking wallaby](https://github.com/unexpectedjs/unexpected/commit/8b244ddab03a836252a1bde56a96dc624b657214) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [stringDiff: Fix rendering of added\/removed newlines immediately following a replaced chunk.](https://github.com/unexpectedjs/unexpected/commit/856338733eec28d36dc793eab2558164a169b3d6) ([Andreas Lind](mailto:andreas@one.com))

### v10.10.4 (2016-03-09)

#### Pull requests

- [#277](https://github.com/unexpectedjs/unexpected/pull/277) Make unexpected errors more resilient to weird post processing of the stack ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/95b1db7f9623fcceb677b5e0914b5abe0ee838c6) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.10.3 (2016-03-09)

#### Pull requests

- [#276](https://github.com/unexpectedjs/unexpected/pull/276) Refactor string diff code ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/53942a894aff4fb3e502fe22b697cabc3e0e46e9) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Upgraded magicpen to get better phantomjs detection](https://github.com/unexpectedjs/unexpected/commit/71deeab7d1b3c7cab48a9e72e070c8d6645f0da8) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Increase string diff limit to 4 KB, 1024 bytes is clearly too little.](https://github.com/unexpectedjs/unexpected/commit/b166520ae7d0c01c5f7213e9b1161de74a3f7d64) ([Andreas Lind](mailto:andreas@one.com))

### v10.10.2 (2016-03-07)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/34fbf29b1a830ba24e3354cdff4f06fa94ec820b) ([Andreas Lind](mailto:andreas@one.com))
- [to satisfy: Don't break when trying to determine whether an object and null are structurally similar.](https://github.com/unexpectedjs/unexpected/commit/5ddfc1d7c5507021b163c451cd907849f457dd4c) ([Andreas Lind](mailto:andreas@one.com))

### v10.10.1 (2016-03-07)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/70c74a828001ce02ec08ece9e87e956586333db7) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Suppress string diff when actual or expected is longer than 1024 chars.](https://github.com/unexpectedjs/unexpected/commit/3e524aee46234e2c47760f238cad415f817442a3) ([Andreas Lind](mailto:andreas@one.com))
- [magicPenLine style: Add support for inspecting raw output.](https://github.com/unexpectedjs/unexpected/commit/f153a8805cbdf6bf7340351f26a81c20d1400ef1) ([Andreas Lind](mailto:andreas@one.com))
- [Documentation: Add unexpected-set to the plugins page.](https://github.com/unexpectedjs/unexpected/commit/40e1db02f37820cf94bfb612f6d6550ff8ed28b7) ([Andreas Lind](mailto:andreas@one.com))
- [Update documentation.](https://github.com/unexpectedjs/unexpected/commit/18d51210794247ffd30ecc81b4775697753ff243) ([Andreas Lind](mailto:andreas@one.com))
- [+1 more](https://github.com/unexpectedjs/unexpected/compare/v10.10.0...v10.10.1)

### v10.10.0 (2016-03-04)

#### Pull requests

- [#275](https://github.com/unexpectedjs/unexpected/pull/275) Disallow expect\({...}, 'to satisfy', \[...\]\) ([Andreas Lind](mailto:andreas@one.com))
- [#273](https://github.com/unexpectedjs/unexpected/pull/273) Avoid diff result ([Andreas Lind](mailto:andreas@one.com))
- [#274](https://github.com/unexpectedjs/unexpected/pull/274) Switch to unexpected-bluebird ([Andreas Lind](mailto:andreas@one.com))
- [#271](https://github.com/unexpectedjs/unexpected/pull/271) Always include vertical whitespace between the error message and the diff ([Andreas Lind](mailto:andreas@one.com))
- [#270](https://github.com/unexpectedjs/unexpected/pull/270) WIP: Omit plus and minus in string diffs, except in text mode ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/a102b487b8fd5a0cba98e8a6ddadffc8adb20616) ([Andreas Lind](mailto:andreas@one.com))
- [inspect: Don't detect a recurring object as \[Circular\].](https://github.com/unexpectedjs/unexpected/commit/c21259d89d280b468b7c0a693341bcf0d3deedac) ([Andreas Lind](mailto:andreas@one.com))

### v10.9.1 (2016-02-27)

#### Pull requests

- [#269](https://github.com/unexpectedjs/unexpected/pull/269) npm version: Fail unless invoked via make release. ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/ef11b3d52ac406a7b5835f92544bbc962d38730c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed linting errors](https://github.com/unexpectedjs/unexpected/commit/4b4a6bd83eb01ad70004da07884291cd7da41b27) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed key sorting for `to equal` on objects](https://github.com/unexpectedjs/unexpected/commit/0cf0f3adeb13e18cbc63d1a6c583cb3c60d43b68) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.9.0 (2016-02-27)

#### Pull requests

- [#268](https://github.com/unexpectedjs/unexpected/pull/268) Remove all unexpected lines from the stack unless UNEXPECTED\_FULL\_TRACE is set ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#267](https://github.com/unexpectedjs/unexpected/pull/267) Add unexpected-events to the list of plugins. ([Alex J Burke](mailto:alex@alexjeffburke.com))
- [#263](https://github.com/unexpectedjs/unexpected/pull/263) Add support for arrays with non-numerical keys ([Andreas Lind](mailto:andreas@one.com))
- [#265](https://github.com/unexpectedjs/unexpected/pull/265) Add jspm support ([Guy Bedford](mailto:guybedford@gmail.com))
- [#264](https://github.com/unexpectedjs/unexpected/pull/264) Fix broken link to magicpen repo in api\/addType.md docs ([Vesa Laakso](mailto:laakso.vesa@gmail.com))
- [#262](https://github.com/unexpectedjs/unexpected/pull/262) Implement Symbol type when the Symbol global is available. ([Andreas Lind](mailto:andreas@one.com))
- [#257](https://github.com/unexpectedjs/unexpected/pull/257) Wip: Replace test framework patch with afterEach hook ([Andreas Lind](mailto:andreas@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/eb9cbf6a1cadec58517a79e9d64cdbaa8f4231e0) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added missing returns in the prefix and suffix methods of the binaryArray type.](https://github.com/unexpectedjs/unexpected/commit/f18b079d50aa29e203bf4fe2ae08e1bbde7508d8) ([Andreas Lind](mailto:andreas@one.com))
- [Remove unused var.](https://github.com/unexpectedjs/unexpected/commit/bc77f602441edd101a7d3a0d479f9d8a1a4c756e) ([Andreas Lind](mailto:andreas@one.com))
- [Simplify 'to error'.](https://github.com/unexpectedjs/unexpected/commit/a6ff325db2b30f1980e6a5efce45b4e6394a8212) ([Andreas Lind](mailto:andreas@one.com))
- [Remove no longer needed arrayification.](https://github.com/unexpectedjs/unexpected/commit/4a2a8435dbcef95701b726de88805a14dc6dd0bd) ([Andreas Lind](mailto:andreas@one.com))
- [+6 more](https://github.com/unexpectedjs/unexpected/compare/v10.8.4...v10.9.0)

### v10.8.4 (2016-02-26)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b41c9a1b2e483b9dfd54ab44ac756ae8888c059f) ([Andreas Lind](mailto:andreas@one.com))

### v10.8.3 (2016-02-26)

- [Added missing returns in the prefix and suffix methods of the binaryArray type.](https://github.com/unexpectedjs/unexpected/commit/f04461418a601b1b03c73259cc862176353a457a) ([Andreas Lind](mailto:andreas@one.com))

### v10.8.2 (2016-02-18)

- [treat as a jspm package \(cherry picked from commit 8dd74034826bdfaeafe72ce20c087e7c4d2c7557\)](https://github.com/unexpectedjs/unexpected/commit/a8600f8aa4b55d716e626a03349d0f7b857b2b8a) ([Guy Bedford](mailto:guybedford@gmail.com))
- [add jspm support \(cherry picked from commit 15c4e88b9ae09581e5f8b740a2e1ae1a22b85efd\)](https://github.com/unexpectedjs/unexpected/commit/5fc7fdf649c8b92cf1547335b4383fe5e6167e36) ([Guy Bedford](mailto:guybedford@gmail.com))

### v10.8.1 (2016-01-29)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/7ffdd306e83922ebd11ff047d74e0a1f366a6fd8) ([Andreas Lind](mailto:andreas@one.com))
- [Revert "Merge pull request \#239 from unexpectedjs\/feature\/bluebird3"](https://github.com/unexpectedjs/unexpected/commit/1ea8f3413c406a88bc35fb459e6e90af75677da9) ([Andreas Lind](mailto:andreas@one.com))
- [Revert "Avoid using Bluebird's Promise.settle, silences deprecation warning."](https://github.com/unexpectedjs/unexpected/commit/571ea4a805ac45d71f2b8b2e0c2d8a57e89cc8ae) ([Andreas Lind](mailto:andreas@one.com))

### v10.8.0 (2016-01-25)

#### Pull requests

- [#258](https://github.com/unexpectedjs/unexpected/pull/258) Implement 'to have \(items|values\) exhaustively satisfying'. ([Andreas Lind](mailto:andreas@one.com))
- [#256](https://github.com/unexpectedjs/unexpected/pull/256) Fix propagation of a missing assertion error in expect.it\(...\).or\(...\) constructs ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/0d98f3a8134e036e712c71e8c299269163c2f687) ([Andreas Lind](mailto:andreas@one.com))
- [Avoid using Bluebird's Promise.settle, silences deprecation warning.](https://github.com/unexpectedjs/unexpected/commit/615f7b133614a6c8893366dc0ade95e30e189430) ([Andreas Lind](mailto:andreas@one.com))
- [Fixed documentation bug.](https://github.com/unexpectedjs/unexpected/commit/531c4d63ff9a64c5e68b97028c7c3919264b72e6) ([Andreas Lind](mailto:andreas@one.com))

### v10.7.0 (2016-01-22)

#### Pull requests

- [#239](https://github.com/unexpectedjs/unexpected/pull/239) Update bluebird from 2.9.34 to 3.1.1. ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b451edbb5ed7744d3edd49b387efc4493cf5c0fe) ([Andreas Lind](mailto:andreas@one.com))
- [test\/assertions\/when-called{ =&gt; .spec}.js](https://github.com/unexpectedjs/unexpected/commit/1859c0564a1548db413232c746aca07a820cbb93) ([Andreas Lind](mailto:andreas@one.com))
- [expect.shift: Support expect.it in addition to an assertion string.](https://github.com/unexpectedjs/unexpected/commit/e55f1b579a0b0af6864e0292e4f3009c4c83341c) ([Andreas Lind](mailto:andreas@one.com))
- [Added unexpected-check to the plugin list](https://github.com/unexpectedjs/unexpected/commit/22496407693e51a3c64b3b2e7c210602cfa6d823) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.6.1 (2016-01-22)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/2823dd52095bf7d141dd1c880f31da7dca5a5075) ([Andreas Lind](mailto:andreas@one.com))
- [&lt;array-like&gt; to satisfy &lt;array-like&gt;: Fix "cannot get rejection reason of a non-rejected promise" error.](https://github.com/unexpectedjs/unexpected/commit/334e180b4ebf222680ac83c09b775d3d93ec4479) ([Andreas Lind](mailto:andreas@one.com))
- [Travis: Build on the latest node.js 4 and 5 release \(instead of only 4.0.0\).](https://github.com/unexpectedjs/unexpected/commit/080a614806157ee6e06b99a8b9eabc9c0645ce77) ([Andreas Lind](mailto:andreas@one.com))

### v10.6.0 (2016-01-22)

#### Pull requests

- [#250](https://github.com/unexpectedjs/unexpected/pull/250) Allow subtypes of object and array-like more fine-grained control over newlines and indentation ([Andreas Lind](mailto:andreas@one.com))
- [#247](https://github.com/unexpectedjs/unexpected/pull/247) Added '&lt;object&gt; not to have keys' assertion ([Joel Mukuthu](mailto:joelmukuthu@gmail.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/d3c776c11de6fc7f2f77d6a335a6eafe647a919c) ([Andreas Lind](mailto:andreas@one.com))
- [Documentation, to call the callback: Remove construct that broke update-examples.](https://github.com/unexpectedjs/unexpected/commit/1e9f9819b29f63fed508a602e7c6e93cae206ee9) ([Andreas Lind](mailto:andreas@one.com))
- [Added --save-dev flag to node installation documentation](https://github.com/unexpectedjs/unexpected/commit/fb7b4f24309fa0cc210b9e897d4264f487fd5fab) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.5.1 (2016-01-08)

#### Pull requests

- [#242](https://github.com/unexpectedjs/unexpected/pull/242) Generate the html runners so we don't have to maintain them ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/ab840bdb76e2da7c858f157e2bc4671a0ce8d6bb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed to have properties on function objects](https://github.com/unexpectedjs/unexpected/commit/da874fb5774848b3b84cb802dd863c294b5be6a7) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Docs, addAssertion: Add a note about multiple assertion strings not being supported.](https://github.com/unexpectedjs/unexpected/commit/fa2ae03d861d55f3e7747bce47d1c24c3e479f61) ([Andreas Lind](mailto:andreas@one.com))
- [Throw a more specific error when attempting to add an assertion with multiple assertion strings.](https://github.com/unexpectedjs/unexpected/commit/490c403125daec5883c01cd599d36d3adfd6c586) ([Andreas Lind](mailto:andreas@one.com))
- [it throw{ =&gt; s} in test descriptions](https://github.com/unexpectedjs/unexpected/commit/32523f4bc32148825b9f29413749d0f451bc906d) ([Andreas Lind](mailto:andreas@one.com))
- [+59 more](https://github.com/unexpectedjs/unexpected/compare/v10.5.0...v10.5.1)

### v10.5.0 (2015-12-23)

#### Pull requests

- [#240](https://github.com/unexpectedjs/unexpected/pull/240) Spike\/compound assertion ([Andreas Lind](mailto:andreas@one.com))
- [#241](https://github.com/unexpectedjs/unexpected/pull/241) Implement expect\(fn, 'when called', ...\); ([Andreas Lind](mailto:andreas@one.com))
- [#237](https://github.com/unexpectedjs/unexpected/pull/237) Fixed our test setup and extracted the first test into another file ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#236](https://github.com/unexpectedjs/unexpected/pull/236) Feature\/unexpected markdown upgrade ([Andreas Lind](mailto:andreas@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#235](https://github.com/unexpectedjs/unexpected/pull/235) to only have keys: Implemented diff ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/34841fbca552ab5c526a0ee26097b98d4e0c5f22) ([Andreas Lind](mailto:andreas@one.com))
- [Moved to be positive and to be negative to separate spec files.](https://github.com/unexpectedjs/unexpected/commit/6b2581513d448ebae53d668d23085d4eacedde2f) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Moved to be truthy and to be falsy to new spec files](https://github.com/unexpectedjs/unexpected/commit/0c8b63ac24b735ac5830df34c6831c0ffd63090d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Moved misplaced specs](https://github.com/unexpectedjs/unexpected/commit/e756f6d35b1fd62b93cbdc9a42e186607d1962d3) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Moved `when decoded as` spec to separate file.](https://github.com/unexpectedjs/unexpected/commit/3872b1689114cee5db55aac3b26cf9c446889ae7) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+1 more](https://github.com/unexpectedjs/unexpected/compare/v10.4.0...v10.5.0)

### v10.4.0 (2015-12-09)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b8877219ce9d343b634d847cfb06704dc889e053) ([Andreas Lind](mailto:andreas@one.com))
- [Update .npmignore so that the built site, coverage report, test suite, and documentation isn't published.](https://github.com/unexpectedjs/unexpected/commit/3ea4307566d2fbcc00b805719833591c05b5d9c5) ([Andreas Lind](mailto:andreas@one.com))
- [to have items satisfying: Avoid quotes around the subsequent assertion names in the error output.](https://github.com/unexpectedjs/unexpected/commit/24312989c1d94f6cb5366dec7db73ab0588f8bd5) ([Andreas Lind](mailto:andreas@one.com))
- [Simplify the &lt;object&gt; to satisfy &lt;object&gt; diffing code a bit now that it doesn't need to handle the &lt;array-like&gt; to satisfy &lt;array-like&gt; case anymore.](https://github.com/unexpectedjs/unexpected/commit/b09c8df8396b229ba087b53652ec4ba9c0e4a0a7) ([Andreas Lind](mailto:andreas@one.com))

### v10.3.1 (2015-11-23)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/4aa1bbf01faa7b102452706693c895469c708e4e) ([Andreas Lind](mailto:andreas@one.com))
- [Tweak &lt;object&gt; to satisfy &lt;object&gt; diff.](https://github.com/unexpectedjs/unexpected/commit/9ace47a96bfdd2af49aba10e6bb057a4b87a9dda) ([Andreas Lind](mailto:andreas@one.com))

### v10.3.0 (2015-11-22)

#### Pull requests

- [#230](https://github.com/unexpectedjs/unexpected/pull/230) Improve the appearance of missing properties in object diffs and to satisfy diffs ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/bb753282105b096a197b227a5082c074cf26b6f8) ([Andreas Lind](mailto:andreas@one.com))

### v10.2.0 (2015-11-17)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/2c5a52af3975a21c348c55758c9b94c6ef0abf60) ([Andreas Lind](mailto:andreas@one.com))
- [&lt;object&gt; to satisfy &lt;object&gt;: Pass if an object is satisfied against itself.](https://github.com/unexpectedjs/unexpected/commit/41d93d653ab299ef35493130993b282bada7eab9) ([Andreas Lind](mailto:andreas@one.com))
- [&lt;Promise&gt; assertions: Offer footgun protection when testing promises created with other Promise libs.](https://github.com/unexpectedjs/unexpected/commit/dd99ffeafff0c29f4190f98c65b97a2ecb229715) ([Andreas Lind](mailto:andreas@one.com))
- [Avoid Array.prototype.slice.{call,apply}\(arguments, ...\) in hot code.](https://github.com/unexpectedjs/unexpected/commit/a049f9a5a5c792603bbfa70d895998fa0898d436) ([Andreas Lind](mailto:andreas@one.com))

### v10.1.0
- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/19226c4b894dcec359c641b0f000faf68b64162c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Expose withError on the top level expect](https://github.com/unexpectedjs/unexpected/commit/a5d35c88eb57720d75dd781b66e1f7e6441f2c6a) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Oh, it's not https.](https://github.com/unexpectedjs/unexpected/commit/8c4753741bbca46d3c30c31f03756290dbd1d0cf) ([Andreas Lind](mailto:andreas@one.com))
- [Plugins page: Update unexpected-moment url.](https://github.com/unexpectedjs/unexpected/commit/7b79bd0f196f111b63fef0ac6babd5d24d4c6509) ([Andreas Lind](mailto:andreas@one.com))
- [documentation: Add unexpected-moment to the Plugins page.](https://github.com/unexpectedjs/unexpected/commit/b32be36f24e3beec778f1835abf35d9a1dd5bae0) ([Andreas Lind](mailto:andreas@one.com))
- [+4 more](https://github.com/unexpectedjs/unexpected/compare/v10.0.2...v10.1.0)

### v10.0.2 (2015-10-23)

#### Pull requests

- [#218](https://github.com/unexpectedjs/unexpected/pull/218) oathbreaker: Don't recapture the stack of non-Unexpected errors. ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/72d33e309b695c74dae497bb836bacbab21020bf) ([Andreas Lind](mailto:andreas@one.com))
- [Update index.js](https://github.com/unexpectedjs/unexpected/commit/6811c8faeee5a856bc62560ef8024347876f583f) ([Andreas Lind](mailto:andreas@one.com))
- [Makefile: Fix indentation and minor cosmetics.](https://github.com/unexpectedjs/unexpected/commit/6f1be47340a9a8a2455bf8d44a3128c48c8d3ba6) ([Andreas Lind](mailto:andreas@one.com))
- [Makefile, coverage target: Exclude bootstrap-unexpected-markdown.js instead of generate-site.js](https://github.com/unexpectedjs/unexpected/commit/26bec934faf49935c6e0f18e862f279e90c3c752) ([Andreas Lind](mailto:andreas@one.com))
- [Also reapply the test framework patch when a parent module of index.js is retrieved from require's cache.](https://github.com/unexpectedjs/unexpected/commit/c86281e7e414729586a733e1cfa154936f5f0c65) ([Andreas Lind](mailto:andreas@one.com))
- [+4 more](https://github.com/unexpectedjs/unexpected/compare/v10.0.1...v10.0.2)

### v10.0.1
- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/9d446062213d892527bd77aa49d7c5e828b16dff) ([Andreas Lind](mailto:andreas@one.com))
- [Fixed relaxed match.](https://github.com/unexpectedjs/unexpected/commit/b71a7b9959b846ebb19e1211ce74e614f1bb828c) ([Andreas Lind](mailto:andreas@one.com))
- [Upgraded the documentation generator](https://github.com/unexpectedjs/unexpected/commit/983649dc3eefd30ed1b75005f4935da6608c2bf9) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated the documentation generator](https://github.com/unexpectedjs/unexpected/commit/2269b087fbec0dcc2c084870bdde23a76368cfb5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v10.0.0 (2015-10-08)

#### Pull requests

- [#220](https://github.com/unexpectedjs/unexpected/pull/220) Spike\/v10 duck typing ([Andreas Lind](mailto:andreas@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#219](https://github.com/unexpectedjs/unexpected/pull/219) Feature\/v10 shift ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/5ac9647b05f0ba257aeba033b63d34c905a23e74) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [remove unexpected-fs from plugins page](https://github.com/unexpectedjs/unexpected/commit/abac29e294e0609249d4bd3b49c30b6348842a7a) ([Gustav Nikolaj Olsen](mailto:gno@one.com))

### v9.16.1 (2015-10-05)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/5a705952ceca6a529e6cf2786624fe52c9fd9280) ([Andreas Lind](mailto:andreas@one.com))
- [Makefile: node\_modules\/.bin\/deploy-site{ =&gt; .sh}](https://github.com/unexpectedjs/unexpected/commit/f79fb19884f4beb46e539dd86793a04de08ce042) ([Andreas Lind](mailto:andreas@one.com))
- [Fix expect\(...\).and\(...\).and\(...\).](https://github.com/unexpectedjs/unexpected/commit/c2454fd9ba0625cfbeb54e4fcedec52c41c92bcf) ([Andreas Lind](mailto:andreas@one.com))
- [Document 'when called with'. See \#217.](https://github.com/unexpectedjs/unexpected/commit/e1f4b5fc7cce208fe08b6442d8849c011c8c7282) ([Andreas Lind](mailto:andreas@one.com))
- [makePromise: Don't wrap reject in a superfluous function.](https://github.com/unexpectedjs/unexpected/commit/52bbf0e4ff72b359977f58d9049b525db830e832) ([Andreas Lind](mailto:andreas@one.com))
- [+3 more](https://github.com/unexpectedjs/unexpected/compare/v9.16.0...v9.16.1)

### v9.16.0 (2015-09-24)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/f145176ccc9324b1e4354633ed5956c3d07a1972) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Tweaking the color palettes](https://github.com/unexpectedjs/unexpected/commit/d1ed00f1bc13b68eced77471d1d3d05b5dbd5818) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v9.15.0 (2015-09-24)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/c09c7d2d235af65cc92d612766d0222c04509da6) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added a colorByIndex style that will color the text with the color of the given index in the theme palette](https://github.com/unexpectedjs/unexpected/commit/23082e6d70412f88d63c909c6951a967fbd22860) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v9.14.0 (2015-09-24)

- [Upgraded to the newest version of magicpen](https://github.com/unexpectedjs/unexpected/commit/a0edc356e2b1b9e619e596fa44671ef83198aadf) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Support a format argument for expect.inspect](https://github.com/unexpectedjs/unexpected/commit/2ba9a7e0058f622ab3206d099d28e7ac7c4ccaa6) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Enforce our current coding style](https://github.com/unexpectedjs/unexpected/commit/4a1b23f11575ecd7ddb002307f87defca03ce8f4) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v9.13.0 (2015-09-18)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/e44617313939dba9e0ef0daa1206b59da837cc04) ([Andreas Lind](mailto:andreas@one.com))
- [Never dot out array items for arrays shorter than 11 elements.](https://github.com/unexpectedjs/unexpected/commit/52cb0ec6b081dd8cb36de026e484924df9d1fc88) ([Andreas Lind](mailto:andreas@one.com))

### v9.12.3 (2015-09-17)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/ae2be1681108a628618f8e63a4e840a34a419eba) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [corrected test description](https://github.com/unexpectedjs/unexpected/commit/792cb90a11f6ed927158f11f7eae057674d60ebd) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Revert "Relaxed the requirements for type.identify a bit, to be compatible with plugins"](https://github.com/unexpectedjs/unexpected/commit/e07345071dbdf293c4662cb3a4a2763923fb5c36) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v9.12.2 (2015-09-17)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/24bdb5984bdf8faf177b5990497fc9c0351dfcfe) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Relaxed the requirements for type.identify a bit, to be compatible with plugins](https://github.com/unexpectedjs/unexpected/commit/92f3e24bcd2d559d73828df9f66c98ab244d4e98) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v9.12.1 (2015-09-17)

- [Throw an error if a type forget to specify an identify function](https://github.com/unexpectedjs/unexpected/commit/40a696a860cddf24225b571e415f24891c2936df) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v9.12.0 (2015-09-16)

#### Pull requests

- [#211](https://github.com/unexpectedjs/unexpected/pull/211) Put annotation on next line in to satisfy when lines gets too long ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#210](https://github.com/unexpectedjs/unexpected/pull/210) Add gitter chat badge to README ([Peter Müller](mailto:munter@fumle.dk))
- [#209](https://github.com/unexpectedjs/unexpected/pull/209) Remove the Assertion class, refactor and optimize the creation of the wrapped expect function ([Andreas Lind](mailto:andreas@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/483e74dc862c9e8907ba24d47ba9a7c1808ef75d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated the performance thresshold as we are not able to get it stable enough :-S](https://github.com/unexpectedjs/unexpected/commit/b8b111e5b94ece2b5e5836cbc6005a68a4a206df) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updating chewbacca to fix bug efter promisification](https://github.com/unexpectedjs/unexpected/commit/25bba08c8e93df4b1c931fd48b166741070513d6) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updating chewbacca](https://github.com/unexpectedjs/unexpected/commit/ef7676cfe3c2cb7d401c08fc21a74ad1d59320b5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [updated chewbacca](https://github.com/unexpectedjs/unexpected/commit/e61de125f67685549f97c1e23e5386504649f1cb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+14 more](https://github.com/unexpectedjs/unexpected/compare/v9.11.1...v9.12.0)

### v9.11.1 (2015-09-13)

#### Pull requests

- [#208](https://github.com/unexpectedjs/unexpected/pull/208) Add unexpected-react-shallow plugin to docs ([Dave Brotherstone](mailto:davegb@pobox.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/f5ebe889997d82ead6989946749a128e8555b8a3) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed inspection bug that messed up unexpected-messy](https://github.com/unexpectedjs/unexpected/commit/235d9b705d68751c7ea12d1a84c8d8bbfa0950c1) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [added no timeout flag to the benchmark target](https://github.com/unexpectedjs/unexpected/commit/76946b68af8d6c3df5dd784589519ff64bcb4207) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v9.11.0 (2015-09-10)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b0276caa598d84e12db7f2ebadb9b0a0d4c9e398) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added functionality to change the default depth from the browser and command line](https://github.com/unexpectedjs/unexpected/commit/e783d119620d1fdb7af2cd1b8981d641e6030e6d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v9.10.0 (2015-09-10)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/62e1a268cf5e83fdbef593b0a0207cfd9814fa68) ([Andreas Lind](mailto:andreas@one.com))
- [array-like: Make the delimiter customizable in subtypes](https://github.com/unexpectedjs/unexpected/commit/d905bafa706edfd32834a65f9f7674a295e6ab27) ([Andreas Lind](mailto:andreas@one.com))
- [Travis: Build on node.js 4.0.0.](https://github.com/unexpectedjs/unexpected/commit/6e6ddbcc662e3953cf7be5e48b23a115e78c8e0e) ([Andreas Lind](mailto:andreas@one.com))
- [Define the Buffer type after Uint8Array.](https://github.com/unexpectedjs/unexpected/commit/d2c8a83bb2c75067834c0e210a4b129a849621b3) ([Andreas Lind](mailto:andreas@one.com))

### v9.9.0 (2015-09-07)

#### Pull requests

- [#207](https://github.com/unexpectedjs/unexpected/pull/207) Omit subject for expect.it as well ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/fe7c1bbb86a41f5f27072f2f43aae7de205af46b) ([Andreas Lind](mailto:andreas@one.com))
- [to satisfy diff: Improve output when items are missing.](https://github.com/unexpectedjs/unexpected/commit/f07cab66734e5b7ed495024ca1d7bd5462399613) ([Andreas Lind](mailto:andreas@one.com))

### v9.8.1 (2015-09-04)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b3e8f6e728c559bc27bb1b5ac1a3153cfd1eca42) ([Andreas Lind](mailto:andreas@one.com))

### v9.8.0 (2015-09-04)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b13a8da9c3029182bb7f6016b0c2685419269f50) ([Andreas Lind](mailto:andreas@one.com))
- [Remove unused var.](https://github.com/unexpectedjs/unexpected/commit/2a30f6002268a358b4cdd48c274237ad6d5ee093) ([Andreas Lind](mailto:andreas@one.com))
- [Changed the to have keys satisfying to only satisfy on the keys](https://github.com/unexpectedjs/unexpected/commit/b23e0490b4db1aea0e5d7c01f9b57685ec90d738) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Adjust threshold for when compacting subject](https://github.com/unexpectedjs/unexpected/commit/a9c0148f3ffcf123827bd8efaf211a7b7832d3d8) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v9.7.0 (2015-09-04)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/54cbbe39508859d7287754ee7d12b994767a1bc5) ([Andreas Lind](mailto:andreas@one.com))
- [Introduce a 'defaultOrNested' error mode.](https://github.com/unexpectedjs/unexpected/commit/e71fc74e4fd912e9d84928f0a9153313e45608e4) ([Andreas Lind](mailto:andreas@one.com))
- [to have items satisfying: Don't use bubble mode, it makes the output worse.](https://github.com/unexpectedjs/unexpected/commit/33968d70f45276bc0849540ba73e6da9338d90ad) ([Andreas Lind](mailto:andreas@one.com))
- [Revert "Documentation: Duplicate a failed promise in two snippets to prevent it from causing an uncaught exception."](https://github.com/unexpectedjs/unexpected/commit/cea598223ecfe195e5c1a1d2db3821cda662cea2) ([Andreas Lind](mailto:andreas@one.com))
- [Documentation: Duplicate a failed promise in two snippets to prevent it from causing an uncaught exception.](https://github.com/unexpectedjs/unexpected/commit/fc3f3641f9e9661e870fe16ae94b8f2ae6e2a071) ([Andreas Lind](mailto:andreas@one.com))
- [+5 more](https://github.com/unexpectedjs/unexpected/compare/v9.6.0...v9.7.0)

### v9.6.0 (2015-08-18)

- [Use output.preferredWidth when generating the standard error message](https://github.com/unexpectedjs/unexpected/commit/0f706950f60b22e415157a443da07ede69289f06) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Whoops, move unexpected-documentation-site-generator to the correct section of package.json. Again.](https://github.com/unexpectedjs/unexpected/commit/8201a6c8b84fee43f11ecae1690438e91027f489) ([Andreas Lind](mailto:andreas@one.com))
- [Update unexpected-documentation-site-generator to 2.9.2.](https://github.com/unexpectedjs/unexpected/commit/eab85514767ff151f214007978e12ff3e613079c) ([Andreas Lind](mailto:andreas@one.com))
- [Documentation, plugins page: Sort the plugins alphabetically.](https://github.com/unexpectedjs/unexpected/commit/00d191ca659054fad48815c81b1ca89aa4807a43) ([Andreas Lind](mailto:andreas@one.com))
- [Documentation, plugins page: Use https links when possible.](https://github.com/unexpectedjs/unexpected/commit/12e9c94caa121a8af154bcbda1dfa5d1797219fa) ([Andreas Lind](mailto:andreas@one.com))
- [+2 more](https://github.com/unexpectedjs/unexpected/compare/v9.5.2...v9.6.0)

### v9.5.2 (2015-08-18)

#### Pull requests

- [#205](https://github.com/unexpectedjs/unexpected/pull/205) Fix patching of the test framework's 'it' function in test suites spanning multiple files ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [upgraded magicpen to improve output detection](https://github.com/unexpectedjs/unexpected/commit/c66384feb716209ef418675fed088b7c28ac76f2) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v9.5.1 (2015-08-18)

#### Pull requests

- [#202](https://github.com/unexpectedjs/unexpected/pull/202) Add a "Plugins" page to the documentation ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [upgraded magicpen to improve output detection](https://github.com/unexpectedjs/unexpected/commit/9ef64995e61e7b720accddb3870b76ef5ffe1d7a) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Update plugins.md](https://github.com/unexpectedjs/unexpected/commit/652eb2c34d5425fc177c3cc58da4157e3bc0ddea) ([Andreas Lind](mailto:andreas@one.com))
- [Fixed addAssertion headline](https://github.com/unexpectedjs/unexpected/commit/a8951f688ee67da0091dfdd401570f6336563646) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed headline for plugins.md](https://github.com/unexpectedjs/unexpected/commit/6c2e96a51cb540fc36f178c647d4cc06f644981c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fix headlines for api pages](https://github.com/unexpectedjs/unexpected/commit/2c522608d4c96eb4f31c0904825239b462782ae7) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+6 more](https://github.com/unexpectedjs/unexpected/compare/v9.5.0...v9.5.1)

### v9.5.0 (2015-08-08)

#### Pull requests

- [#198](https://github.com/unexpectedjs/unexpected/pull/198) Fix error message of 'when fulfilled' with expect.it ([Andreas Lind](mailto:andreas@one.com))
- [#201](https://github.com/unexpectedjs/unexpected/pull/201) Allow plugins to have a version property. ([Andreas Lind](mailto:andreas@one.com))
- [#200](https://github.com/unexpectedjs/unexpected/pull/200) Inspect magicpen instances as a series of function calls ([Andreas Lind](mailto:andreas@one.com))
- [#183](https://github.com/unexpectedjs/unexpected/pull/183) String assertions 'to begin with' + 'to end with' ([Peter Müller](mailto:munter@fumle.dk))
- [#195](https://github.com/unexpectedjs/unexpected/pull/195) Add some docs about the expect function. ([Andreas Lind](mailto:andreas@one.com))
- [#196](https://github.com/unexpectedjs/unexpected/pull/196) to have property: Improve the error output when an expected value is given ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/2710c7d086f074db55d9b8599bcb2226b74edf44) ([Andreas Lind](mailto:andreas@one.com))
- [Updated the documentation generator](https://github.com/unexpectedjs/unexpected/commit/a40822f8dcf76eaeb6bb70f09bb965497ec31a4f) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Update magicpen to 5.1.0.](https://github.com/unexpectedjs/unexpected/commit/a734ef7b522ca8773ff8c577c742bd728b9f1302) ([Andreas Lind](mailto:andreas@one.com))
- [to begin with, to end with, to contain: Error out if passed a needle of the empty string.](https://github.com/unexpectedjs/unexpected/commit/ea08ef38a3b6f44a9462dd0c29e91fe16d7ad606) ([Andreas Lind](mailto:andreas@one.com))
- [Increase test coverage.](https://github.com/unexpectedjs/unexpected/commit/bdf7b0e62160c7948b73e3ba01e43870f283ac37) ([Andreas Lind](mailto:andreas@one.com))
- [+9 more](https://github.com/unexpectedjs/unexpected/compare/v9.4.0...v9.5.0)

### v9.4.0 (2015-07-27)

#### Pull requests

- [#197](https://github.com/unexpectedjs/unexpected/pull/197) Fix stack trace of errors that has been thrown when the work queue has been drained ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#193](https://github.com/unexpectedjs/unexpected/pull/193) installPlugin =&gt; use, allow functions as plugins ([Andreas Lind](mailto:andreas@one.com))
- [#192](https://github.com/unexpectedjs/unexpected/pull/192) installPlugin: Error out if an already installed plugin has the same … ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/fbe7554b602be641036a3027f277c1c8f6de24e0) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated documentation tests](https://github.com/unexpectedjs/unexpected/commit/aeb731fad7ef61cfedfcd94f653233bcd4a0dd3d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [not to have own property with a value: Make sure the error message refers to the correct assertion.](https://github.com/unexpectedjs/unexpected/commit/ec608024f69de2aa0d170c416a0748775dfb8d45) ([Andreas Lind](mailto:andreas@one.com))
- [binaryArray to satisfy: Use the type system to decide whether the value is an expect.it or a function.](https://github.com/unexpectedjs/unexpected/commit/e6050c98e15d45f1dba9733e974a08d0af9a5906) ([Andreas Lind](mailto:andreas@one.com))
- [Add support for expect\(...\).and\(expect.it\(...\)\)](https://github.com/unexpectedjs/unexpected/commit/76288991a29995a55fb2e7132bc0f6b1172cd304) ([Andreas Lind](mailto:andreas@one.com))
- [+3 more](https://github.com/unexpectedjs/unexpected/compare/v9.3.0...v9.4.0)

### v9.3.0 (2015-07-21)

#### Pull requests

- [#190](https://github.com/unexpectedjs/unexpected/pull/190) expect: Always return a thenable ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/999639c54d0174266d3818cdce1dd6eb36c048f7) ([Andreas Lind](mailto:andreas@one.com))
- [to call the callback with error: Only provide the error as the fulfillment value rather than the entire arguments array.](https://github.com/unexpectedjs/unexpected/commit/30e10b2d671b3aee923857ac5af45b6fed253a1b) ([Andreas Lind](mailto:andreas@one.com))
- [to call the callback: Error out if the callback is called twice.](https://github.com/unexpectedjs/unexpected/commit/4cd113ac0817bcfee8431aad6da63c86bea42536) ([Andreas Lind](mailto:andreas@one.com))
- [Fixed typo in variable name.](https://github.com/unexpectedjs/unexpected/commit/a2b48044ed8979fb6793d6378d136c6913ce96bc) ([Andreas Lind](mailto:andreas@one.com))
- [README: Point to the documentation at unexpected.js.org](https://github.com/unexpectedjs/unexpected/commit/c6360e6bd13f3ee69ca53806867328d11ed30645) ([Andreas Lind](mailto:andreas@one.com))

### v9.2.1 (2015-07-08)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/6d437d1d4fe1d592cb0496f7a30ff607fcaada68) ([Andreas Lind](mailto:andreas@one.com))
- [Update array-changes to 1.0.3.](https://github.com/unexpectedjs/unexpected/commit/c5efbcf577ba9d55ddc1bff4076f90ad580432f7) ([Andreas Lind](mailto:andreas@one.com))
- [Makefile, update-examples target: Generate the site after the examples have been updated.](https://github.com/unexpectedjs/unexpected/commit/c73e99a2bc37db6e64ccf65af41d4bf222dcf56a) ([Andreas Lind](mailto:andreas@one.com))
- [Makefile, travis target: Build the documentation.](https://github.com/unexpectedjs/unexpected/commit/ad71b34d4762b53f10523e33e1e4ec5fb2a8f0ac) ([Andreas Lind](mailto:andreas@one.com))
- [Update unexpected-documentation-site-generator to 2.5.2.](https://github.com/unexpectedjs/unexpected/commit/43c7db8d4bee0e0cbdee2c6defddff4249baa80d) ([Andreas Lind](mailto:andreas@one.com))
- [+3 more](https://github.com/unexpectedjs/unexpected/compare/v9.2.0...v9.2.1)

### v9.2.0 (2015-07-06)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/cbdb792a37070928d95c1743ee5954f1bd8149b1) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Upgraded magicpen](https://github.com/unexpectedjs/unexpected/commit/e36ce2d0e003cbd1e16d744d8485aec472db7989) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v9.1.0 (2015-07-06)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/85a8df64feca74a2b7dcc53c5c532364960cffaf) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Upgraded magicpen for tweaks to the alt-method](https://github.com/unexpectedjs/unexpected/commit/deb3b040d92f4f015a3dab3a08f19e1a82f7a53d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Manually fixed documentation test \(sin\).](https://github.com/unexpectedjs/unexpected/commit/1fdc0dda88e9e6be03280eed2d8816c769951a97) ([Andreas Lind](mailto:andreas@one.com))
- [\[not\] to contain, not to match: Ensure the text mode diff is correct when needle contains newline](https://github.com/unexpectedjs/unexpected/commit/c7a088de48b5abeb5cadec79133314c949b3d42d) ([Andreas Lind](mailto:andreas@one.com))
- [Fix the output of 'when passed as parameter to' by duplicating code.](https://github.com/unexpectedjs/unexpected/commit/84c609f57cb4e0671d324b015bd0efa23bb5a09f) ([Andreas Lind](mailto:andreas@one.com))
- [+5 more](https://github.com/unexpectedjs/unexpected/compare/v9.0.0...v9.1.0)

### v9.0.0 (2015-07-03)

#### Pull requests

- [#182](https://github.com/unexpectedjs/unexpected/pull/182) Added .editorconfig ([Peter Müller](mailto:munter@fumle.dk))
- [#180](https://github.com/unexpectedjs/unexpected/pull/180) Error to have message: Allow specifying the desired representation of the error \(html\/ansi\/text\). ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/525a2eaf3f04751df0dfb2e47532fee60650ffa8) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed regression after merge](https://github.com/unexpectedjs/unexpected/commit/fc91f2d02e0c50deb39720d3039c240a63614afd) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Optimize UnexpectedError](https://github.com/unexpectedjs/unexpected/commit/759ce8402e14aa860be175a2b254ca3aaa818e8f) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed bug where we needed to clone the output](https://github.com/unexpectedjs/unexpected/commit/7ddc6d5d5f0458843667173105ca489cec0257be) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Documented that you need to provide a format or output to UnexpectedError.getDiff](https://github.com/unexpectedjs/unexpected/commit/34922c7fa23bb030e5d22735bd412430befde588) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+9 more](https://github.com/unexpectedjs/unexpected/compare/v8.5.1...v9.0.0)

### v8.5.1 (2015-06-30)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/a10dba1c55959fe32f62d9f516d2a38dccda49f4) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated the documentation spec](https://github.com/unexpectedjs/unexpected/commit/c059bf2796a098cc67d71e280018f946c00c0ede) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed bug where unexpected would fail if you gave it null as a placeholder value](https://github.com/unexpectedjs/unexpected/commit/9ae0b3469bb3f4008a3b17e8582cd7b9a691c2af) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Pass the output into createStandardErrorMessage](https://github.com/unexpectedjs/unexpected/commit/689ba7d454459f03135bfd021c8cac13d495fcdb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Using expect.fail direktly to throw a type error instread of createing an Unexpected error and failing with that](https://github.com/unexpectedjs/unexpected/commit/0a9717042ccbfb8298b3b5cede94e1b1e18f1f77) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+11 more](https://github.com/unexpectedjs/unexpected/compare/v8.5.0...v8.5.1)

### v8.5.0 (2015-06-24)

#### Pull requests

- [#179](https://github.com/unexpectedjs/unexpected/pull/179) to call the callback: Resolve the promise with an array containing th… ([Andreas Lind](mailto:andreas@one.com))
- [#176](https://github.com/unexpectedjs/unexpected/pull/176) Implemented "to call the callback with \[no\] error" assertion. ([Andreas Lind](mailto:andreas@one.com))
- [#177](https://github.com/unexpectedjs/unexpected/pull/177) Pull the unexpected-promise plugin into core. ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/26cfe0c2621a29e8e7daf1be3f2084be1783ee0e) ([Andreas Lind](mailto:andreas@one.com))
- [Right, Phantom.js doesn't support setImmediate.](https://github.com/unexpectedjs/unexpected/commit/9d3967f5c9b9da0eb689353bb7aa655e052b1ac5) ([Andreas Lind](mailto:andreas@one.com))
- [Document the fulfilled value of 'to call the callback with error' and 'to call the callback without error' as well.](https://github.com/unexpectedjs/unexpected/commit/d75387b2118648b1ce0986fe087cb1c1da90994b) ([Andreas Lind](mailto:andreas@one.com))
- [installPlugin: Throw if the unexpected-promise plugin is installed.](https://github.com/unexpectedjs/unexpected/commit/51377e93b8dbd8b3a3cf97951a335540772398e8) ([Andreas Lind](mailto:andreas@one.com))
- [Prohibit redefinition of a type.](https://github.com/unexpectedjs/unexpected/commit/ce5733eea51a96d546cc0699cf854ca12661c399) ([Andreas Lind](mailto:andreas@one.com))
- [+4 more](https://github.com/unexpectedjs/unexpected/compare/v8.4.1...v8.5.0)

### v8.4.1 (2015-06-23)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/0cdaf29e7ffde617edf47d4a8775195f7e8a6b05) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed: patching mocha didn't work with mocha --require](https://github.com/unexpectedjs/unexpected/commit/47b04bd05b7fb827654ed1aeb99e9ce8f743c888) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v8.4.0 (2015-06-21)

#### Pull requests

- [#174](https://github.com/unexpectedjs/unexpected/pull/174) expect.fail with an object: Set all properties on the UnexpectedError. ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/ec6614938b8857e5d072725bab23e1764c39074d) ([Andreas Lind](mailto:andreas@one.com))
- [Split up combo promise inspection test.](https://github.com/unexpectedjs/unexpected/commit/8ca36a7f01a3d8eaad876a05bd0e17dd97c19073) ([Andreas Lind](mailto:andreas@one.com))
- [Omit " =&gt; undefined" when inspecting promises rejected without a reason.](https://github.com/unexpectedjs/unexpected/commit/cf45975089a65cc1cb13c3d644cdd521b6f364fa) ([Andreas Lind](mailto:andreas@one.com))
- [Switch from doublequotes to singlequotes in the "unknown assertion..." error message as well.](https://github.com/unexpectedjs/unexpected/commit/f7cc131769f6c19d52f15f7dbd2b4353cf9b2286) ([Andreas Lind](mailto:andreas@one.com))

### v8.3.0 (2015-06-16)

#### Pull requests

- [#172](https://github.com/unexpectedjs/unexpected/pull/172) Add inspect method to promises ([Andreas Lind](mailto:andreas@one.com))
- [#171](https://github.com/unexpectedjs/unexpected/pull/171) Added custom inspect function for UnexpectedError. ([Andreas Lind](mailto:andreas@one.com))
- [#169](https://github.com/unexpectedjs/unexpected/pull/169) Stop truncating the stack of thrown errors ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/682ea16571d37c66de4121f4179f6bf5c3144141) ([Andreas Lind](mailto:andreas@one.com))
- [Use single quotes in the 'assertion is not defined for the type...' message.](https://github.com/unexpectedjs/unexpected/commit/1f223114112a37e1d5f3312d98bc02e4a5aa1d08) ([Andreas Lind](mailto:andreas@one.com))

### v8.2.0 (2015-06-15)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/a3c5c82e2c10415cca04623e8d0d2b5d13d73efe) ([Andreas Lind](mailto:andreas@one.com))
- [to \[not\] \[only\] have \(key|keys\): Fully support getKeys.](https://github.com/unexpectedjs/unexpected/commit/062128b9ceea23fbc253481d7f246cb7dba96f37) ([Andreas Lind](mailto:andreas@one.com))
- [Update mocha to 2.2.5.](https://github.com/unexpectedjs/unexpected/commit/5c685fa1862a0c200349f8415ab6f48d6c6e8178) ([Andreas Lind](mailto:andreas@one.com))

### v8.1.3 (2015-06-15)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/648239a78c664f54da2a19d3efec53fc9560012d) ([Andreas Lind](mailto:andreas@one.com))
- [to satisfy diff: Always omit indices when the subject type is array-like or a subtype.](https://github.com/unexpectedjs/unexpected/commit/446cc7f41a2bdb58066df54f914b23211e33c8e5) ([Andreas Lind](mailto:andreas@one.com))

### v8.1.2 (2015-06-13)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/769b85576d010a6692fd3b2be01efbcb9d3c0002) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Inspect array objects with square brackets instread of Array\({...}\)](https://github.com/unexpectedjs/unexpected/commit/17ef0b39cc1da8b6a1d7cfc6fa86da5b9ad07a47) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v8.1.1 (2015-06-13)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/e0c62048b36d642f04de294327bb572799f646cd) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Only use suffix and prefix of types in to satisfy, inspect and diffs](https://github.com/unexpectedjs/unexpected/commit/8678d681ffc7881a93843d03259b432a6756b9f0) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v8.1.0 (2015-06-12)

#### Pull requests

- [#168](https://github.com/unexpectedjs/unexpected/pull/168) Improve output of "to have items\/values\/keys satisfying" ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/6fa1093ef9fa0336086d399687425ed8f80881b9) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v8.0.1 (2015-06-10)

- [to have property: fix typo, not and value](https://github.com/unexpectedjs/unexpected/commit/cbd65f5d6c9e32f750870b97a88ee385298fe467) ([Gustav Nikolaj Olsen](mailto:gno@one.com))
- [Fixed link in 8.0.0 changelog.](https://github.com/unexpectedjs/unexpected/commit/5d1060a86461293e371abef0eae82db47afc395e) ([Andreas Lind](mailto:andreas@one.com))
- [Deploy documentation site to site-build branch instead of gh-pages to avoid CNAME conflict with the actual site](https://github.com/unexpectedjs/unexpected/commit/2e885afebd73cf81229df8ffcbcad08f4144f499) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v8.0.0 (2015-06-10)

#### Pull requests

- [#164](https://github.com/unexpectedjs/unexpected/pull/164) Feature\/to error ([Andreas Lind](mailto:andreas@one.com), [Gustav Nikolaj Olsen](mailto:gno@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/8aec28e8845beb1b626a48b342c756cb11c02ceb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Raise coverage of special character escaping](https://github.com/unexpectedjs/unexpected/commit/efad1fd32d5fdc564c052b3feac3b34fbcc138c8) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed failing test in phantomjs](https://github.com/unexpectedjs/unexpected/commit/2b0bb112d90bbc8c5ed47b7bda31e28730d4101c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Exclude generate-site.js from the coverage report.](https://github.com/unexpectedjs/unexpected/commit/9b5f77f3669e1d455ba095d1d08fde395405301b) ([Andreas Lind](mailto:andreas@one.com))
- [Exclude lib\/testFrameworkPatch.js from the coverage report.](https://github.com/unexpectedjs/unexpected/commit/8c9e3dc7b3b99ab4e16399ad17d606c357959ca1) ([Andreas Lind](mailto:andreas@one.com))
- [+49 more](https://github.com/unexpectedjs/unexpected/compare/v7.5.1...v8.0.0)

### v7.5.1 (2015-06-01)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/0d0145e9595444f6a86b1326acac53f08d343dcc) ([Andreas Lind](mailto:andreas@one.com))
- [Avoid the use of .caught\(...\) on promises that we didn't necessarily create ourselves.](https://github.com/unexpectedjs/unexpected/commit/fb217239928080371afaf1231fc3b354d4701826) ([Andreas Lind](mailto:andreas@one.com))
- [I messed up the meaning of some test descriptions with my last commit](https://github.com/unexpectedjs/unexpected/commit/d6221e3950d24f17dd54a1273a55391dd1fda66c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v7.5.0 (2015-05-22)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/546bdb27d4b4f9bf190443c52eeda60e50ff2d9d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Return promise even if is fulfilled](https://github.com/unexpectedjs/unexpected/commit/cef2a637b81ded2920698cf13d2d5cec790badb5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v7.4.3 (2015-05-20)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/0d082add93a71489a871495e513190831501b8bf) ([Andreas Lind](mailto:andreas@one.com))
- [Let the 'name' property take precedence again when inspecting Error instances.](https://github.com/unexpectedjs/unexpected/commit/58e138baee10b2c7d489399406d53f71815d5073) ([Andreas Lind](mailto:andreas@one.com))

### v7.4.2 (2015-05-19)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/85b17fb1303ecb93df60d693e23f15867bafd39d) ([Andreas Lind](mailto:andreas@one.com))
- [Fixed diff when Error instances weren't created by the same constructor.](https://github.com/unexpectedjs/unexpected/commit/f03a6a3b103f329203eb67d02c4a044ad04a4873) ([Andreas Lind](mailto:andreas@one.com))
- [Fixed inspection of the constructor name for Error subclasses.](https://github.com/unexpectedjs/unexpected/commit/bfc9eedda1b71a327dc4339188ccfd98b4597f66) ([Andreas Lind](mailto:andreas@one.com))
- [Another regression test for \#155.](https://github.com/unexpectedjs/unexpected/commit/ec1a3f22c7b84c9f9d4f05867791835b68782fb9) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v7.4.1 (2015-05-19)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/3ccdb471d5984687ab23ea00251ca1c6b0fc3974) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed case where we didn't use the type system in to satisfy to decide is a function should be called](https://github.com/unexpectedjs/unexpected/commit/63d0fd139ce629af6c31758e1abace54111fce52) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added regression test for \#155.](https://github.com/unexpectedjs/unexpected/commit/3eb3cca9ae02b6f81e7346b02090c5bf77eaf054) ([Andreas Lind](mailto:andreas@one.com))

### v7.4.0 (2015-05-18)

#### Pull requests

- [#155](https://github.com/unexpectedjs/unexpected/pull/155) Use type system in to satisfy ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#154](https://github.com/unexpectedjs/unexpected/pull/154) expect.it: Indicate success\/failure for all clauses. ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/1ba47a72e70570aa427786a4d497b69b4ebf7d71) ([Andreas Lind](mailto:andreas@one.com))
- [wrapperObject to satisfy: Prefer the label from the assertion being delegated to if available.](https://github.com/unexpectedjs/unexpected/commit/abfcace9de8692b2a81b19960c628042e2f411d8) ([Andreas Lind](mailto:andreas@one.com))
- [Update index.md](https://github.com/unexpectedjs/unexpected/commit/93c70d8a5d08386272787c8817ec2c48eae8fcda) ([Andreas Lind](mailto:andreas@one.com))

### v7.3.0 (2015-05-13)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/816039d6612dcb41829db6fb8dbe4df18b80198a) ([Andreas Lind](mailto:andreas@one.com))
- [Inspect errors with only a message property more compactly.](https://github.com/unexpectedjs/unexpected/commit/4b7cc79db302f288f969e3561770fedcec10cefb) ([Andreas Lind](mailto:andreas@one.com))

### v7.2.0 (2015-05-13)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/40a2b501b82c630ab8f2e78d7d2aaf1c8a47b8ac) ([Andreas Lind](mailto:andreas@one.com))
- [binaryArray: Add support for .prefix\(\) and .suffix\(\) the same way as array-like and wrapperObject.](https://github.com/unexpectedjs/unexpected/commit/1fdeb1ee18aaffed0b55b38acd02714614f4e709) ([Andreas Lind](mailto:andreas@one.com))

### v7.1.2 (2015-05-12)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/d97b65063fe84af6ecfafeb7d5cb38bee7b42d0b) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Use the error name when inspecting error instances](https://github.com/unexpectedjs/unexpected/commit/e915b3d2435102561005254c4d491215050617a6) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed: Provide context for type.prefix and type.suffix](https://github.com/unexpectedjs/unexpected/commit/0b285b1817c0c52c8e32e64e22dbcf6c9fe70121) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added common.js to mocha.opts](https://github.com/unexpectedjs/unexpected/commit/42ddd1e3afd34b60f9684e811bd701f8c0d84937) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Removed unecessary code](https://github.com/unexpectedjs/unexpected/commit/85af8d18e2da004638172312fc545991ae9e888f) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+1 more](https://github.com/unexpectedjs/unexpected/compare/v7.1.1...v7.1.2)

### v7.1.1 (2015-05-11)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/426a56e4213ba9a5b1128f88942b311aedf472cd) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Use getKeys in array-like when inspecting](https://github.com/unexpectedjs/unexpected/commit/f9acc2e225ee4e025610b1d7f59c67c4638fe43d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Provide context for type prefix and suffix methods.](https://github.com/unexpectedjs/unexpected/commit/73bde8df95cd93a6de177277d32c0e5ab5566f84) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Never dot out the unwrapped value of a wrapper object](https://github.com/unexpectedjs/unexpected/commit/3ea47f10d91f2ff0c2ace6df1a5b641e8baef07a) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v7.1.0 (2015-05-11)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/d69be0e78fa1adf58aaf882fc23b6f0b8d5b0b5d) ([Andreas Lind](mailto:andreas@one.com))
- [Fixed typo in docs.](https://github.com/unexpectedjs/unexpected/commit/ceac85664b5d7ee164ad66d04ff66e3ff769fe24) ([Andreas Lind](mailto:andreas@one.com))
- [package.json: Lock down the bluebird dependency at 2.9.25.](https://github.com/unexpectedjs/unexpected/commit/f232ee03af2b4ae42b47cd8b4d281b2d268f1ca9) ([Andreas Lind](mailto:andreas@one.com))
- [to satisfy diff on array-like: Output the type name when it's not an actual array.](https://github.com/unexpectedjs/unexpected/commit/8630b242072e8a8f40c365cadd2e2dcc2a8e2096) ([Andreas Lind](mailto:andreas@one.com))
- [to satisfy: Renamed var to reflect reality: bothAreArrays =&gt; bothAreArrayLike](https://github.com/unexpectedjs/unexpected/commit/40776f2e1dc7d4ddaa890da8bd24f425efb7ab7b) ([Andreas Lind](mailto:andreas@one.com))
- [+14 more](https://github.com/unexpectedjs/unexpected/compare/v7.0.5...v7.1.0)

### v7.0.5 (2015-05-04)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/72e253cd278d777c1ca4b57a38fe66214fbd0fb1) ([Andreas Lind](mailto:andreas@one.com))
- [Buffer to satisfy: Support promise-returning expect.its and functions.](https://github.com/unexpectedjs/unexpected/commit/dd31a0f9f19087934bf60d2e8a9a8a854250e1c0) ([Andreas Lind](mailto:andreas@one.com))
- [Renamed accidentally committed "should foo" test and added the successful case.](https://github.com/unexpectedjs/unexpected/commit/eda2aaab094461ffc685a1c2398d29c3a2043774) ([Andreas Lind](mailto:andreas@one.com))
- [Make the site generation a bit more general](https://github.com/unexpectedjs/unexpected/commit/d24efbf098ac8b8ca5f260d17e50cd2a517c48f6) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed bug in update-examples with the new metalsmith-unexpected-markdown](https://github.com/unexpectedjs/unexpected/commit/c44f8c7a8e749bd608ed5585ccb786a4416c5fab) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+3 more](https://github.com/unexpectedjs/unexpected/compare/v7.0.4...v7.0.5)

### v7.0.4 (2015-04-30)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/46942133076791a52a1ab5f24a5f6ecd988fd10e) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed bug where the diff for an array-like object satisfied against an array did not show that entries should be removed](https://github.com/unexpectedjs/unexpected/commit/0e085623bb3b01b14c89988615759eee9cd4e64e) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v7.0.3 (2015-04-29)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/4c9e91d7510d8fc2e7bc177926b3596649ebc054) ([Andreas Lind](mailto:andreas@one.com))
- [any type: Guard against node.js' require\('util'\).inspect eagerly calling .inspect\(\) on objects](https://github.com/unexpectedjs/unexpected/commit/1726a0aaf8ce40581ba07f501e6a547d5f07d403) ([Andreas Lind](mailto:andreas@one.com))
- [to satisfy: Fixed silently successful 'to satisfy' of array against objects.](https://github.com/unexpectedjs/unexpected/commit/54e380ede120e9f5a4071658819309aec52fa501) ([Andreas Lind](mailto:andreas@one.com))

### v7.0.2 (2015-04-29)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/9d0988a7b177c60c6cc9f8cd2d12d1c182f2b0fb) ([Andreas Lind](mailto:andreas@one.com))
- [Refactored expect.it to settle all promises before building the report.](https://github.com/unexpectedjs/unexpected/commit/2411b24339de084893be69657660a31789580ae5) ([Andreas Lind](mailto:andreas@one.com))
- [Makefile, travis target: Disregard the exit code from coveralls to avoid failing the build when it flakes out.](https://github.com/unexpectedjs/unexpected/commit/d0d05de7739c968336ce2964608fbb673973d58b) ([Andreas Lind](mailto:andreas@one.com))
- [Updated to throw documentation to include to satisfy example](https://github.com/unexpectedjs/unexpected/commit/ca7a1635938c475e6d8b9edf9fee03e7fce57e98) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated the error message for \#149 to point to the documentation](https://github.com/unexpectedjs/unexpected/commit/84b8267ee6404a0a4c3437251d263575bbd9f93f) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+10 more](https://github.com/unexpectedjs/unexpected/compare/v7.0.1...v7.0.2)

### v7.0.1 (2015-04-22)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/750b4a9dc18165b0b8a323829c8f4a4b363ab181) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed problem where expect.async would not serialize it's error message](https://github.com/unexpectedjs/unexpected/commit/b91cf842cd3e4bcc4ae00ba286f5d6446fc58d03) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Whoops, forgot to update the documentation and tests in the previous commit.](https://github.com/unexpectedjs/unexpected/commit/4c7f096ebd109f747cbf1a1b54d9096a3e1f49ab) ([Andreas Lind](mailto:andreas@one.com))
- [when passed as parameter to: Set the error mode to 'bubble'.](https://github.com/unexpectedjs/unexpected/commit/3e89ddee3c65ddb2222f9b77503f7c751e11eb7e) ([Andreas Lind](mailto:andreas@one.com))
- [Added missing return in async test.](https://github.com/unexpectedjs/unexpected/commit/2048021cf2a74ab37956430e0ad17578eb587e10) ([Andreas Lind](mailto:andreas@one.com))
- [+1 more](https://github.com/unexpectedjs/unexpected/compare/v7.0.0...v7.0.1)

### v7.0.0 (2015-04-17)

#### Pull requests

- [#140](https://github.com/unexpectedjs/unexpected/pull/140) Error to have message ([Andreas Lind](mailto:andreas@one.com))
- [#141](https://github.com/unexpectedjs/unexpected/pull/141) when passed as parameters to: Implement 'async' flag. ([Andreas Lind](mailto:andreas@one.com))
- [#139](https://github.com/unexpectedjs/unexpected/pull/139) Fix \#132 ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/1bda0389a0a19c760940c6a596f125460815650d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [We lost the ability to truncate the stack correctly in the async case, so we disabled it](https://github.com/unexpectedjs/unexpected/commit/c2b3fe8ef4a1fc585383a8995d544cc0a02c120e) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed failing phantomjs test](https://github.com/unexpectedjs/unexpected/commit/f2f89805bd94e1e54640ed35402107092403ff6e) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Removed to have message assertion from documentation tests](https://github.com/unexpectedjs/unexpected/commit/6a767ee649bd063e68f5be7604f228f77651bab1) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Make keyboard scrolling work in the main panel on the site](https://github.com/unexpectedjs/unexpected/commit/7334d3c494906a8834938fd368ea1f48edabedae) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+5 more](https://github.com/unexpectedjs/unexpected/compare/v6.4.0...v7.0.0)

### v6.4.0 (2015-03-13)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/0a451846310d17dc699b35e30756ef6014b89142) ([Andreas Lind](mailto:andreas@one.com))
- [Better inspection of multilines blocks](https://github.com/unexpectedjs/unexpected/commit/eb8e32dedf833f91cdf45444b116c9335ecbd656) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v6.3.1 (2015-03-12)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/044a9de19b1c8f82d4fb0bd1392073c243c026ce) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed misplaced comma when using block items inside arrays and objects](https://github.com/unexpectedjs/unexpected/commit/7057525b76653477283adee16e07772a445d89a0) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v6.3.0 (2015-03-12)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/b93188b4f85b4d0c7d538349a2ee7f14dad649a3) ([Andreas Lind](mailto:andreas@one.com))
- [Fixed missing semicolon.](https://github.com/unexpectedjs/unexpected/commit/ec45926cbd4587a68cadfdea50400865ea16ca55) ([Andreas Lind](mailto:andreas@one.com))
- [Include the standard error message when an assertion is not defined for the subject type.](https://github.com/unexpectedjs/unexpected/commit/8ad0a0eb84effbb5a0af171f3d5fcc212719c31e) ([Andreas Lind](mailto:andreas@one.com))
- [expect: Simplified arguments shuffling.](https://github.com/unexpectedjs/unexpected/commit/e07a525898b9de2b330f85547d777b1fc6562879) ([Andreas Lind](mailto:andreas@one.com))
- [addType docs: Mention more built-in types.](https://github.com/unexpectedjs/unexpected/commit/0cdb12f3b36fafb20f3b1c8cea300ccd1bb296ed) ([Andreas Lind](mailto:andreas@one.com))
- [+3 more](https://github.com/unexpectedjs/unexpected/compare/v6.2.1...v6.3.0)

### v6.2.1 (2015-03-10)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/ef22d549a3cd1fd36435d4910bc5cd56bdd9f068) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated array-changes to fix problem when diffing empty arrays](https://github.com/unexpectedjs/unexpected/commit/a7005f7d431973e3ce38186e201474a2ad2c5d13) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Remove DomElement type \(old expect.js artifact\).](https://github.com/unexpectedjs/unexpected/commit/50ff464863d4d3e30a1feda952d81edfd30eb9f4) ([Andreas Lind](mailto:andreas@one.com))
- [Using pointer cursor for search menu and remove metalsmith-relative](https://github.com/unexpectedjs/unexpected/commit/e63a2ba9731fd0cf21b84e49fd88ecb209e63df6) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Stop using relative urls in the documentation site](https://github.com/unexpectedjs/unexpected/commit/bdad6ce7a897c444bf1bbf62bab1dcaf627c65cd) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+4 more](https://github.com/unexpectedjs/unexpected/compare/v6.2.0...v6.2.1)

### v6.2.0 (2015-03-09)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/d65a37e4bab9c56bcba7ea0238881a0146815a06) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Extracted the array diff into a separate module: array-changes](https://github.com/unexpectedjs/unexpected/commit/9c5fcda08a71767bbcf040def8f106bc3d03973f) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Testing array diff special case](https://github.com/unexpectedjs/unexpected/commit/00e5997655a73e300157f68505658d402a5ed21c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v6.1.1 (2015-03-06)

- [Makefile, release-% target: Try not to break when there's not already a local branch called 'site-build'.](https://github.com/unexpectedjs/unexpected/commit/3b97f8f9dfefb6d8b570c41f89fee7684c9acf34) ([Andreas Lind](mailto:andreas@one.com))

### v6.1.0 (2015-03-06)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/730f6967c7ab31a49660dd2cb857ddcf01086a9d) ([Andreas Lind](mailto:andreas@one.com))
- [Assertion.prototype.shift: If the next parameter is a function, call it instead of assuming it's the name of an assertion.](https://github.com/unexpectedjs/unexpected/commit/f5f2a26175ceb0166cc4b2b1e1989a566dcd16b8) ([Andreas Lind](mailto:andreas@one.com))
- [Use the real autoprefixer package instead of the one that Gustav made](https://github.com/unexpectedjs/unexpected/commit/71f9a9307ec4b78963928da75a8b7df31b7ae3fd) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v6.0.7 (2015-03-05)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/1110a1d123a6059c1589fc9137e1184b18ca5241) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Make nesting level local to the unexpected instance](https://github.com/unexpectedjs/unexpected/commit/9a9b7871507e0e7814d283279f6f7ec0bdc203e5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v6.0.6 (2015-03-05)

#### Pull requests

- [#125](https://github.com/unexpectedjs/unexpected/pull/125) Change alias to use relative url ([Peter Müller](mailto:munter@fumle.dk))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/15b2a4a7315abd7a71c17b75603cac9756cb2d39) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Commit unexpected.js before deploy-site when releasing](https://github.com/unexpectedjs/unexpected/commit/47f5fc29b7ad5b192ef9f863bdf790221613a56c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Use to satisfy when expecting on thrown errors](https://github.com/unexpectedjs/unexpected/commit/a9cc1f3f58d815ec23dfc324552cf6774b9c6b4d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Forward normal errors to top-level in to satisfy](https://github.com/unexpectedjs/unexpected/commit/f3a915eb4fe1175cdddae13a6b993b2171d9c1ec) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [update metalsmith-autoprefixer to v1.0.1 \(and don't use the -gustavnikolaj fork anymore\)](https://github.com/unexpectedjs/unexpected/commit/54768ccb04ca8f11c9f2ded66542d22392ad6a41) ([Gustav Nikolaj Olsen](mailto:gno@one.com))
- [+2 more](https://github.com/unexpectedjs/unexpected/compare/v6.0.5...v6.0.6)

### v6.0.5 (2015-03-03)

- [Use a branch for site-build instead of a submodule](https://github.com/unexpectedjs/unexpected/commit/f515fbd524441e3a010896eed3dc7f17221fa8a5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Documented aliases and flags for to be a map whose values satisfy](https://github.com/unexpectedjs/unexpected/commit/6dbbaa1873090cf70be9a841612372d50a41230d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Documented aliases and flags for to be a map whose keys satisfy](https://github.com/unexpectedjs/unexpected/commit/5f2ea942b7bf99cd51efc5bd1bbc2b8e4f1db866) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed too eager search-replace in changelog entry](https://github.com/unexpectedjs/unexpected/commit/911b9f089f8641dd9e31d59396d5d1b781d7a446) ([Andreas Lind](mailto:andreas@one.com))
- [Try to use a git:\/\/ url for the site-build submodule so that Travis can \(maybe\) get to it.](https://github.com/unexpectedjs/unexpected/commit/6fc27fe453095067ffa9c704bdca5a2f8ecdc04e) ([Andreas Lind](mailto:andreas@one.com))

### v6.0.4 (2015-03-03)

- [Build unexpected.js and site](https://github.com/unexpectedjs/unexpected/commit/71c4870cb9d082c618ba2b107a779b54ee699c31) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Remove any references to the old project location](https://github.com/unexpectedjs/unexpected/commit/73fc25901a5c3304e0f66b320d7fe84ccffe0ab4) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v6.0.3 (2015-03-03)

- [Build unexpected.js and site](https://github.com/unexpectedjs/unexpected/commit/45a223b17d31df319e946b018026e20c734e3f02) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Build site in tmp to avoid overriding the submodule](https://github.com/unexpectedjs/unexpected/commit/f5c41a971d6705ad9440aceb9dffc04c3988c324) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v6.0.2 (2015-03-03)

- [Build unexpected.js and site](https://github.com/unexpectedjs/unexpected/commit/4d3d52668698c431aa181ff59950a96f3d2fd8af) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [build.js removes the site-build folder so we will just update the submodule afterwards](https://github.com/unexpectedjs/unexpected/commit/c1eb710c1bc340d3565045b6de6125002ac14de5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v6.0.1 (2015-03-03)

- [Remove site-build files correctly](https://github.com/unexpectedjs/unexpected/commit/35c3f0834b141ded790400b2f577dd9e7006fac2) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Removed static top-level folder](https://github.com/unexpectedjs/unexpected/commit/0626e5001628f9373c6d0246b58e175e013c8c72) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Build unexpected.js and site](https://github.com/unexpectedjs/unexpected/commit/0cf049fb7bb7990e1f87cae9ff69827dbb3c9e9e) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Avoid nuking the .git file in site-build when rebuilding.](https://github.com/unexpectedjs/unexpected/commit/7561c85f6770d5c817ce402d0da35b10584b466f) ([Andreas Lind](mailto:andreas@one.com))
- [Makefile: Make site-build .PHONY.](https://github.com/unexpectedjs/unexpected/commit/e37749f7d190b7f3e6ac1a54db95f0dd77280625) ([Andreas Lind](mailto:andreas@one.com))
- [+3 more](https://github.com/unexpectedjs/unexpected/compare/v6.0.0...v6.0.1)

### v6.0.0 (2015-03-03)

#### Pull requests

- [#120](https://github.com/unexpectedjs/unexpected/pull/120) Use Object.is when testing for equality where the === operator was previously used ([Andreas Lind](mailto:andreas@one.com))
- [#93](https://github.com/unexpectedjs/unexpected/pull/93) Added missing metalsmith-static dev-dependency ([Peter Müller](mailto:munter@fumle.dk))

#### Commits to master

- [Build unexpected.js and site](https://github.com/unexpectedjs/unexpected/commit/e0466d74983c69e3f8a313027daaafe67d4c7fa4) ([Andreas Lind](mailto:andreas@one.com))
- [Add site-build as a submodule \(deja vu\).](https://github.com/unexpectedjs/unexpected/commit/fe8524c3e08c132ce68ca1b7e1444ba10c46d2f3) ([Andreas Lind](mailto:andreas@one.com))
- [Remove \/site-build\/ from .gitignore now that it's a submodule.](https://github.com/unexpectedjs/unexpected/commit/273a2c908b1841483ad63a32b2bc8ed6f94165b2) ([Andreas Lind](mailto:andreas@one.com))
- [Updated badge links](https://github.com/unexpectedjs/unexpected/commit/e6e59bbaa5ea0b4adc469b556174eabef4eedb4d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [README: Use SVG icons.](https://github.com/unexpectedjs/unexpected/commit/80effefcc6ab4deda8b28ee8a5eb7503a66cb51c) ([Andreas Lind](mailto:andreas@one.com))
- [+1 more](https://github.com/unexpectedjs/unexpected/compare/v5.10.0...v6.0.0)

### v5.10.0 (2015-02-27)

#### Pull requests

- [#123](https://github.com/unexpectedjs/unexpected/pull/123) should be =&gt; should equal when comparisons use equal semantics. ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/2780cff6d4ef3b6becabb0ec8eb23e029c241f76) ([Andreas Lind](mailto:andreas@one.com))
- [to satisfy: Fixed diff output of array against array.](https://github.com/unexpectedjs/unexpected/commit/a40a512497a0cb2a1a318bb678f2f9c1875e7273) ([Andreas Lind](mailto:andreas@one.com))
- [Fixed satisfying an error instance against one with fewer properties.](https://github.com/unexpectedjs/unexpected/commit/fdffdcc6e6cfc42db684de5535ad6988da226b96) ([Andreas Lind](mailto:andreas@one.com))

### v5.9.3 (2015-02-20)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/d19b7b9bd6c45b22a35baad102b29e9874faeeb7) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Upgraded magicpen to fix bug where the color diff would fail if Array.prototype was extended](https://github.com/unexpectedjs/unexpected/commit/c978b0278800a7fc7d4364c32a9d01411e1a0cb4) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Removed prepublish hook as we release from make](https://github.com/unexpectedjs/unexpected/commit/4a0847e898537a0e9879879e6d140ece53d121bc) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v5.9.2 (2015-02-18)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/f2b1625e5984800b1b2e5c7739823a66934ef057) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated dependencies](https://github.com/unexpectedjs/unexpected/commit/421bf9306d89c9bfae547b5a1a4fa07298a223e8) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v5.9.1 (2015-02-12)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/e974f30994348a39ca78ded39c0f6395a2554080) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Make sure unexpected.js is rebuild when dependencies changes](https://github.com/unexpectedjs/unexpected/commit/bb3c50f6d9624247cf282386d0f37fddb7ee9066) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed: Colors lost with karma \/ jasmine \/ phantomjs](https://github.com/unexpectedjs/unexpected/commit/73739ba6e0644349450577ee70a618ac5fe266db) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v5.9.0 (2015-02-12)

- [Build unexpected.js](https://github.com/unexpectedjs/unexpected/commit/c099cfb7d3cf49f1bb8d31df5ea18b9176394ff0) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Add unexpected.js to version control before a release](https://github.com/unexpectedjs/unexpected/commit/cd50eb4c958732e504884057499253b881b8bced) ([Peter Müller](mailto:munter@fumle.dk))
- [Add bower.json](https://github.com/unexpectedjs/unexpected/commit/17355f74dabac5388744931e32d60c4e8685e970) ([Peter Müller](mailto:munter@fumle.dk))

### v5.8.1 (2015-02-02)

- [Decrement depth for loop detection for consistency with inspect](https://github.com/unexpectedjs/unexpected/commit/d2ce50f9322feab8e0f4adfae635fd05c242c8b1) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Make sure that we bail when diffing circular structures](https://github.com/unexpectedjs/unexpected/commit/bfbde98e5533fa63e5e6abd40900dc24a86f2e65) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Never wrap objects with constructor name 'Object'](https://github.com/unexpectedjs/unexpected/commit/ad1e2cb994f564c28bbc003763f5795e049a2c24) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Forgot utils.wrapConstructorNameAroundOutput returned a new output](https://github.com/unexpectedjs/unexpected/commit/ef411afbafb42118c3fe1970e035bb46551f4abb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Use wrapConstructorNameAroundOutput in object diff](https://github.com/unexpectedjs/unexpected/commit/df67162c591b440a497691476adf58feca9b7ab5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v5.8.0 (2015-01-27)

- [Start using the theme feature of magicpen](https://github.com/unexpectedjs/unexpected/commit/afee6a4941d71e88c171acabbcddd3d1485f6db4) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Revert "Speed up travis CI runs by using new docker infrastructure and caching node\_modules"](https://github.com/unexpectedjs/unexpected/commit/ef963aaa5e96f6caa446cef12c8a01905cbb2917) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Upgraded magicpen to get rid of trailing whitespace](https://github.com/unexpectedjs/unexpected/commit/e86f78032a61887d0e878dbff2f111ce169a2948) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Test that we can run to satisfy on value of getter](https://github.com/unexpectedjs/unexpected/commit/9a3dcef8b0bdbcf2f238bfa9d868fcc0ee6970d3) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v5.7.1 (2015-01-24)

- [Fixed incorrect diff for expect\({a: 'f00', b: 'bar'}, 'to have own properties', {a: 'foo', b: 'bar'}\)](https://github.com/unexpectedjs/unexpected/commit/8c93210c4266cbc106c8e55bc09518062eb377c0) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v5.7.0 (2015-01-23)

- [improve equal, inspect and diff of sparse arrays](https://github.com/unexpectedjs/unexpected/commit/7450dbc2e207cb60b1093e1d9742f184809eab76) ([Gustav Nikolaj Olsen](mailto:gno@one.com))
- [README: Fixed typos.](https://github.com/unexpectedjs/unexpected/commit/db353eabc5977feed090acb3bebc1df10923f4de) ([Andreas Lind](mailto:andreas@one.com))

### v5.6.5 (2015-01-22)

#### Pull requests

- [#119](https://github.com/unexpectedjs/unexpected/pull/119) Speed up travis CI runs by using new docker infrastructure and caching n... ([Peter Müller](mailto:munter@fumle.dk))

#### Commits to master

- [function should be considered to be an object by the object type](https://github.com/unexpectedjs/unexpected/commit/4fd8e81220dcdda234128ab8870799e0dd3674b1) ([Gustav Nikolaj Olsen](mailto:gno@one.com))

### v5.6.4 (2015-01-21)

- [Make addStyle method available on cloned instances](https://github.com/unexpectedjs/unexpected/commit/e2112bcf5df7abb25e4c12103f76daa3ccbd63fb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v5.6.3 (2015-01-21)

- [Unbreak expect\(binaryArray, 'to satisfy', expect.it|function\)](https://github.com/unexpectedjs/unexpected/commit/63ea0604506f9e803de8abd10b87b07a1eac4939) ([Gustav Nikolaj Olsen](mailto:gno@one.com))

### v5.6.2 (2015-01-21)

- [object diff: Fixed indentation of unchanged objects.](https://github.com/unexpectedjs/unexpected/commit/93b2e5b6b82b2f30955b802a34024738875a316b) ([Andreas Lind](mailto:andreas@one.com))

### v5.6.1 (2015-01-21)

- [object diff: Fixed indentation of objects to be removed.](https://github.com/unexpectedjs/unexpected/commit/c55f3f6caf20ac0e3ef53ce9dfe5028b46bc2cf7) ([Andreas Lind](mailto:andreas@one.com))

### v5.6.0 (2015-01-20)

- [Also include the constructor name in 'to have properties' and 'to satisfy' diffs.](https://github.com/unexpectedjs/unexpected/commit/49c8b9ba70f2176f804207602afdd9c7f463c7a7) ([Andreas Lind](mailto:andreas@one.com))
- [Partially implement \#115 \(except 'to have properties' and 'to satisfy' diffs\).](https://github.com/unexpectedjs/unexpected/commit/9047f3d4d656e6ee8ff55adbae92ca7730c79b7d) ([Andreas Lind](mailto:andreas@one.com))

### v5.5.2 (2015-01-20)

- [to be within: Don't put numeric ranges in quotes.](https://github.com/unexpectedjs/unexpected/commit/8667f203837aa79fe7454fbf4e94f9ad50148d4e) ([Andreas Lind](mailto:andreas@one.com))
- [to be within: Don't put the range in quotes.](https://github.com/unexpectedjs/unexpected/commit/ba0511e8ab58e34fd22634a667b552b764f8a09c) ([Andreas Lind](mailto:andreas@one.com))

### v5.5.1 (2015-01-19)

- [Only wrap diff with prefix if there is a createDiff method on the error](https://github.com/unexpectedjs/unexpected/commit/8343aaa11dc03c084d8ba3c3c62cdde292a31e91) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Separated array algorithm completely from output](https://github.com/unexpectedjs/unexpected/commit/e16a774d2e4dad965548ca59593a1ef402593b1c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v5.5.0 (2015-01-16)

- [Made the 'key' style quote the key, and don't quote numeric keys.](https://github.com/unexpectedjs/unexpected/commit/10ede2fefc7eb9947dcce369e595e96823052db5) ([Andreas Lind](mailto:andreas@one.com))
- [\[...\] to satisfy \[...\]: Assert that the value is always matched exhaustively.](https://github.com/unexpectedjs/unexpected/commit/b0ce9de4e883edca9d2ecaa8dcff961ad1f90302) ([Andreas Lind](mailto:andreas@one.com))
- [package.json: Tweak the test script and add prepublish hook to protect against releasing stale code.](https://github.com/unexpectedjs/unexpected/commit/365c71bb24e1adf0cb9a671fea65e04e4affa7e9) ([Andreas Lind](mailto:andreas@one.com))

### v5.4.1 (2015-01-16)

- [to satisfy: Assert equality for binary arrays instead of attempting to do an object diff.](https://github.com/unexpectedjs/unexpected/commit/981866b97cbb5d22e1e097b4459e1442df899b71) ([Andreas Lind](mailto:andreas@one.com))

### v5.4.0 (2015-01-15)

#### Pull requests

- [#113](https://github.com/unexpectedjs/unexpected/pull/113) Introduce a NaN type so the number assertions can refuse to work on it ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Do not hoist the label of the nested exception in errorMode:'nested'.](https://github.com/unexpectedjs/unexpected/commit/57be82f5a178a9d14b56090bd812b9d20b8ae468) ([Andreas Lind](mailto:andreas@one.com))
- [not to be undefined: Don't create a diff.](https://github.com/unexpectedjs/unexpected/commit/07a5d5c2788653709a328b8e92f68c4cf61b91e3) ([Andreas Lind](mailto:andreas@one.com))

### v5.3.0 (2015-01-14)

#### Pull requests

- [#109](https://github.com/unexpectedjs/unexpected/pull/109) Inspect Date instances in a JavaScript-compatible syntax ([Andreas Lind](mailto:andreas@one.com))
- [#108](https://github.com/unexpectedjs/unexpected/pull/108) Inspect getters and setters ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [installPlugin: Also be chainable when the plugin is already installed.](https://github.com/unexpectedjs/unexpected/commit/f61c6578637ab635f4d2c1fa560f01cc95f70575) ([Andreas Lind](mailto:andreas@one.com))
- [Never identify anything as the "arrayLike" type. Just use it as an abstract type.](https://github.com/unexpectedjs/unexpected/commit/c59f6c6b9afe0ed90883e925e6802e1c5f536a87) ([Gustav Nikolaj Olsen](mailto:gno@one.com))

### v5.2.0 (2015-01-12)

#### Pull requests

- [#102](https://github.com/unexpectedjs/unexpected/pull/102) 'when called with' and 'when passed as parameters to': Set the errorMode to 'nested' ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Test that null, undefined, NaN, Infinity, and -Infinity are inspected correctly.](https://github.com/unexpectedjs/unexpected/commit/8100783e193083888b2ac7bd368d5c65a54a2755) ([Andreas Lind](mailto:andreas@one.com))
- [Object equal handle case where prototype is null.](https://github.com/unexpectedjs/unexpected/commit/f6c1bbd8f51821433fb4a825316820abaad45a75) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Only dot-out objects except expect.it based on our type system](https://github.com/unexpectedjs/unexpected/commit/2a003629db57ca5021c589eb3540720eff41c089) ([Sune Simonsen](mailto:sss@one.com))

### v5.1.6 (2015-01-07)

- [Fixed bug where expect\({ foo: 'b'}, 'not to have keys', \[\]\) would fail](https://github.com/unexpectedjs/unexpected/commit/2e50deeb3ef729537f3a3b1a326c207cbce2eaf9) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Improved output of to be an](https://github.com/unexpectedjs/unexpected/commit/5999d8ce028d47926007e30790560e70dd387116) ([Sune Simonsen](mailto:sss@one.com))

### v5.1.5 (2015-01-07)

- [expect.fail: Stringify the argument if it's not a function or an Error instance.](https://github.com/unexpectedjs/unexpected/commit/0b8261b0708487fa5aec49caa69f2528d56e2458) ([Andreas Lind](mailto:andreas@one.com))
- [util.isError: Also accept objects that are instanceof Error.](https://github.com/unexpectedjs/unexpected/commit/615ea5769b1f76799e29fb60c518150ce2800dac) ([Andreas Lind](mailto:andreas@one.com))
- [Test that the error message in async assertions gets serialized](https://github.com/unexpectedjs/unexpected/commit/4ae8d3540d69570563ff5bf72f03807a81b17325) ([Sune Simonsen](mailto:sss@one.com))
- [Added missing "not" to comment.](https://github.com/unexpectedjs/unexpected/commit/9cf340fede149192800c2e452867be945ab9138c) ([Andreas Lind](mailto:andreas@one.com))

### v5.1.4 (2015-01-05)

- [Collapse keys that to satisfy does not have any expectations on](https://github.com/unexpectedjs/unexpected/commit/a7048fc82be749c7c627ef6e9f88895941d07b1f) ([Sune Simonsen](mailto:sss@one.com))

### v5.1.2 (2015-01-05)

#### Pull requests

- [#94](https://github.com/unexpectedjs/unexpected/pull/94) Improved missing assertion error ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Fixed bug where to satisfy appended inline content in a block](https://github.com/unexpectedjs/unexpected/commit/490291e43153ca82f6881afcf560ce9dd5edb64d) ([Sune Simonsen](mailto:sss@one.com))
- [Use type system instead of if in 'to be' assertion](https://github.com/unexpectedjs/unexpected/commit/377150907c765dab09b6bc065d987592307f8f0a) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [fix headlines in readme.](https://github.com/unexpectedjs/unexpected/commit/21c19e6251fa122eec0702938b07c513c3e83260) ([Gustav Nikolaj Olsen](mailto:gno@one.com))
- [Makefile: fix coverage target](https://github.com/unexpectedjs/unexpected/commit/f6b7cfaab4cc9a69c5e95d68411c17cae32dd08e) ([Gustav Nikolaj Olsen](mailto:gno@one.com))

### v5.1.1 (2014-12-24)

- [Tweaking the array diff a bit more and corrected some tests](https://github.com/unexpectedjs/unexpected/commit/c04a5a7c8d18ccddd35ba2b0431b0c065529f0c9) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v5.1.0 (2014-12-23)

- [Use another array diff algorithm if the current on produce a bad result](https://github.com/unexpectedjs/unexpected/commit/a0a0b545e896b0ea746f70b81952f7a898c0079f) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v5.0.0 (2014-12-22)

#### Pull requests

- [#80](https://github.com/unexpectedjs/unexpected/pull/80) Inspect arguments differently from array ([Andreas Lind](mailto:andreas@one.com))
- [#73](https://github.com/unexpectedjs/unexpected/pull/73) Include diffs in the "not to contain" and "not to match" error messages ([Andreas Lind](mailto:andreas@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#64](https://github.com/unexpectedjs/unexpected/pull/64) Improve the output for the standard error message ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#62](https://github.com/unexpectedjs/unexpected/pull/62) Implement to be \(a|an\) \[non-empty\] \(map|hash|object\) whose properties satisfy ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [Extended the expect.it example a bit](https://github.com/unexpectedjs/unexpected/commit/d8e4ad9d0969342e2afcec636a3810746ab8f2d5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [expect.fail documentation](https://github.com/unexpectedjs/unexpected/commit/80d70d97a29f08f8f3c2bb93e836818f8bbbed75) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [expect.addType documentation](https://github.com/unexpectedjs/unexpected/commit/ce65b3ab3eaf34338416271494c8fbe53a1082fe) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [5.0.0-beta37](https://github.com/unexpectedjs/unexpected/commit/b80a8734cc7af7b4383a11682801f4cd501c5657) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Upgraded to latest magicpen](https://github.com/unexpectedjs/unexpected/commit/20bbf81cdd8032f488f4126835e3499bc26a30e7) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+121 more](https://github.com/unexpectedjs/unexpected/compare/v4.1.6...v5.0.0)

### v4.1.6 (2014-08-26)

#### Pull requests

- [#52](https://github.com/unexpectedjs/unexpected/pull/52) Show the type name when doing a console log on a type ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Added a 'to be defined' assertion](https://github.com/unexpectedjs/unexpected/commit/4e7d8527e8b951e516b1a16ca23bd94d6a0b414d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v4.1.5 (2014-08-21)

- [Fixed bug where expect.fail threw an error with no message.](https://github.com/unexpectedjs/unexpected/commit/510db5df6e55c3fe59322b079c213613d917af62) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v4.1.4 (2014-08-20)

- [Fixed bug where toJSON returned an instance of magicpen instead of a string](https://github.com/unexpectedjs/unexpected/commit/8f74bb0491a1dcb2c745ac37ffd0db8062bbe824) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added test\/mocha.opts and turn on the --check-leaks switch.](https://github.com/unexpectedjs/unexpected/commit/d44edc50f239986da6893587df019aa7805b074b) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Removed test\/common.js, which is not needed with Istanbul.](https://github.com/unexpectedjs/unexpected/commit/8d5ab2de162f8dc6d5464d4a8f8521ffd95580cc) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Updated the Mocha version](https://github.com/unexpectedjs/unexpected/commit/be44732f8bab2d0871b480d3b1e19b03b1f8dd0b) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v4.1.3 (2014-08-19)

- [Fixed bug when inspecting keys that contains " or '](https://github.com/unexpectedjs/unexpected/commit/5cabcfd74f891379cf52feb71f1db792179976dd) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Color strings cyan](https://github.com/unexpectedjs/unexpected/commit/d4f1cec1d0539463d8ad8dc8340d06e3a95cb314) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Only show build batch for master branch](https://github.com/unexpectedjs/unexpected/commit/aa2c08a6c6715692e995a200d47949ce0b67e9d5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [DomElement type: Inspect the HTML as code so a plugin can syntax highlight it.](https://github.com/unexpectedjs/unexpected/commit/5e0efd9cc5eed31adb09898562acd2379d9c7c1d) ([Andreas Lind Petersen](mailto:andreas@one.com))

### v4.1.2 (2014-08-18)

- [types: Don't consider null to be an object.](https://github.com/unexpectedjs/unexpected/commit/704198f24514fe6ba8bbaa585c7b3dec718e6469) ([Andreas Lind Petersen](mailto:andreas@one.com))

### v4.1.1 (2014-08-18)

- [Replace failback type with anytype](https://github.com/unexpectedjs/unexpected/commit/c389c422a47335d85ed64b692b853bc20cc54f2a) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v4.1.0 (2014-08-18)

- [Make addType require types to have a name](https://github.com/unexpectedjs/unexpected/commit/21df785d8a1a1cea5215711ea7ab30af79e3c445) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v4.0.5 (2014-08-14)

- [Sigh, Phantom.js doesn't support Uint8Array.prototype.slice](https://github.com/unexpectedjs/unexpected/commit/346e486eb8d4f314567110ebfeb5636ac97bbc36) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Fixed inspections of Buffer, Uint8Array, and Uint16Array.](https://github.com/unexpectedjs/unexpected/commit/798bbe184a0ea020d9b8bc476dd99e7001f00153) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [inspectBufferLikeObject: Accept a 'maxLength' parameter.](https://github.com/unexpectedjs/unexpected/commit/65574ef0fc452d35b0188c6387bbf4326480b4a1) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Don't put a trailing newline when inspecting buffer-like objects.](https://github.com/unexpectedjs/unexpected/commit/0c15b4e657a88d98029010229115e5c1cddd99f8) ([Andreas Lind Petersen](mailto:andreas@one.com))

### v4.0.4 (2014-08-13)

- [Update magicpen to 0.3.4.](https://github.com/unexpectedjs/unexpected/commit/2092f624f27735c248d26634aa3a17907e2862a0) ([Andreas Lind](mailto:andreas@one.com))

### v4.0.2 (2014-08-13)

- [Update magicpen to 0.3.4.](https://github.com/unexpectedjs/unexpected/commit/69cc9bb921cb7fa5e2fac7ac0fb102f8b751fd43) ([Andreas Lind](mailto:andreas@one.com))
- [Fixed spelling error in test](https://github.com/unexpectedjs/unexpected/commit/f01f38215020215c35e2529763392ebf56c53d97) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v4.0.1 (2014-08-13)

- [Define a 'code' style that can be overwritten by plugins.](https://github.com/unexpectedjs/unexpected/commit/491b72a59df3d5c4d67e55d4198b65eace1b971e) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Update magicpen to 0.3.3.](https://github.com/unexpectedjs/unexpected/commit/a805614c3f31db385284ef754c2d47197d359a09) ([Andreas Lind Petersen](mailto:andreas@one.com))

### v4.0.0 (2014-08-13)

- [Fixed linting error](https://github.com/unexpectedjs/unexpected/commit/294749431a8dd71f850e3e9a6eb4fd2188f7b38c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fix: 'to have properties' does not include prototype functions on err.actual](https://github.com/unexpectedjs/unexpected/commit/ff6290d4ae356bc618ee19c34970bb819b661d06) ([Andreas Lind Petersen](mailto:andreas@one.com))

### v3.2.4 (2014-08-12)

#### Pull requests

- [#46](https://github.com/unexpectedjs/unexpected/pull/46) Implemented 'to be close to' assertion ([Andreas Lind](mailto:andreas@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))
- [#45](https://github.com/unexpectedjs/unexpected/pull/45) Implemented 'to be canonical' assertion ([Andreas Lind](mailto:andreas@one.com))
- [#44](https://github.com/unexpectedjs/unexpected/pull/44) Consider Error instances different when their 'message' properties differ ([Andreas Lind](mailto:andreas@one.com))
- [#43](https://github.com/unexpectedjs/unexpected/pull/43) Throw if an assertion is redefined. ([Andreas Lind](mailto:andreas@one.com))

#### Commits to master

- [to equal, to have properties: Assert the absence of a property when the RHS object has an undefined value.](https://github.com/unexpectedjs/unexpected/commit/fea8d79bc2238023820b1cd0e79e10c90c28373a) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Make itSkipIf a little prettier](https://github.com/unexpectedjs/unexpected/commit/6afff507e0c825d1920aa0941fecfd6a809aa839) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v3.2.3 (2014-07-02)

- [Show diffs when comparing strings with the to be assertion](https://github.com/unexpectedjs/unexpected/commit/6a22191c8e80c75105931d43c8c0822788d7bd9d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Update .travis.yml](https://github.com/unexpectedjs/unexpected/commit/9716bcd4e535353020350b82136e6a2a22112c9c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v3.2.2 (2014-06-03)

- [Added information about unexpected expection in the 'to throw' assertion](https://github.com/unexpectedjs/unexpected/commit/e19c3d6f3813d9c2e6af86bcb47ff65533238dc7) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v3.2.1 (2014-05-30)

- [Throw a new error when changing the error message to get a stack that is in sync](https://github.com/unexpectedjs/unexpected/commit/fa0796e338dc43738177916119f9cdf59e8de2e4) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v3.2.0 (2014-05-15)

#### Pull requests

- [#41](https://github.com/unexpectedjs/unexpected/pull/41) Use custom types for all types ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Fixing tests failing in PhantomJS](https://github.com/unexpectedjs/unexpected/commit/7b8d1931854249bb86ae6322eee19e3c019cf39b) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Test inspect on circular structures](https://github.com/unexpectedjs/unexpected/commit/821fa88c449a4991fea1f01ecf250825a00bd81a) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v3.1.7 (2014-05-13)

- [Fixing bug where expect\(\[\], 'to equal', 0\) :-S](https://github.com/unexpectedjs/unexpected/commit/915802d3503bb2a3f27d217a07c93a2814e9a368) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Test that nested expects throws if the assertion does not exists](https://github.com/unexpectedjs/unexpected/commit/09d9cf89b8b2999e18a7cc041e8287c997675d59) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed typos in error messages](https://github.com/unexpectedjs/unexpected/commit/c6d95897ef8572c6ffeac74b4fa21766b2636439) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- ['to throw exception' asertion: Use 'to equal' instead of 'to be' when comparing the message so that a string diff will be provided in case of a mismatch.](https://github.com/unexpectedjs/unexpected/commit/6551f06d25ca5ce0e50944a6a3300b0a9e4f53f6) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Removed no longer used code for identifying and inspecting Date instances.](https://github.com/unexpectedjs/unexpected/commit/5372d5a1a00fe0a5efa8a52dee70ee5dec74680a) ([Andreas Lind Petersen](mailto:andreas@one.com))

### v3.1.6 (2014-04-27)

- [Test: Made the expect on an error message also accept the wording in Phantom.js.](https://github.com/unexpectedjs/unexpected/commit/d790899901669d578b726d13842acdc8aa30f0ee) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Skip Uint8Array diff test when there's no Array.prototype.map.](https://github.com/unexpectedjs/unexpected/commit/fc43dd2363c41559561e9954c6c79afba9522285) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [equal: Avoid calling util.getKeysOfDefinedProperties on non-objects.](https://github.com/unexpectedjs/unexpected/commit/f4fe7766b16972b042a4dff058377f79b4bb7c6b) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [es5-compatible: Removed unnecessary quoting of key names in object literal.](https://github.com/unexpectedjs/unexpected/commit/cf3bfcbe49b3188b6e945f9c0d19635954db69be) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Fixed typo: util.getKey{ =&gt; s}OfDefinedProperties.](https://github.com/unexpectedjs/unexpected/commit/6ff31bf9fc9dbca154c5d607c2bec8bada12aa74) ([Andreas Lind Petersen](mailto:andreas@one.com))

### v3.1.5 (2014-04-22)

#### Pull requests

- [#37](https://github.com/unexpectedjs/unexpected/pull/37) to not only have keys should expect the given keys to be present ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [to equal: Treat properties with undefined values as equivalent to missing properties.](https://github.com/unexpectedjs/unexpected/commit/384bd01d373b96cfe7aa3b1e555a46fcab4d6445) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [utils: Whitespace fixes.](https://github.com/unexpectedjs/unexpected/commit/ee761b53d303b0a9964b017836bc2c8c5209456f) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [equal: Removed try..catch that doesn't seem to be necessary with utils.getKeys.](https://github.com/unexpectedjs/unexpected/commit/e45009eaa55dc2ea5673dbdba5eb0e5f0892eb54) ([Andreas Lind Petersen](mailto:andreas@one.com))

### v3.1.4 (2014-04-15)

- [wrappedExpect: Only mangle the message and stack if the error is thrown by the library itself.](https://github.com/unexpectedjs/unexpected/commit/e1d72abf331131683152f839de972f08aecdc3da) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Document 'to have properties' on arrays](https://github.com/unexpectedjs/unexpected/commit/0a7af141cd6ce7016fe45e4615bea9c19d769fef) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Include support for diffing and comparing Uint16Array instances \(\#35\).](https://github.com/unexpectedjs/unexpected/commit/0ae4db8197301ac2482c89881a6caa96ad53e953) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Implemented utils.leftPad.](https://github.com/unexpectedjs/unexpected/commit/f545947e32f385846c6700b87bc448a7eb23969c) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Custom types, toJSON: Use uppercase constructor name after the dollar sign.](https://github.com/unexpectedjs/unexpected/commit/5dccb43fbb6243457c56626f304e08dce39d12cc) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [+4 more](https://github.com/unexpectedjs/unexpected/compare/v3.1.3...v3.1.4)

### v3.1.2 (2014-04-08)

#### Pull requests

- [#34](https://github.com/unexpectedjs/unexpected/pull/34) Do a hex dump of Buffer instances to make them more diffable. ([Andreas Lind Petersen](mailto:andreas@one.com))
- [#33](https://github.com/unexpectedjs/unexpected/pull/33) Inline equal and guard against circular structures ([Andreas Lind Petersen](mailto:andreas@one.com))

#### Commits to master

- [Only show the first 20 bytes when inspecting buffers.](https://github.com/unexpectedjs/unexpected/commit/76f6556848ea3e76e744f280c22d3a745e5d3a58) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [sanitize: Moved stack.push\/pop to the outer level.](https://github.com/unexpectedjs/unexpected/commit/74d3dceab2dd66e8d3c6bdebaec041132b7c2626) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Use findFirst in sanitize.](https://github.com/unexpectedjs/unexpected/commit/00bf1e228d862a3fb6b6820305019675074c4ed8) ([Andreas Lind Petersen](mailto:andreas@one.com))

### v3.1.0 (2014-04-05)

#### Pull requests

- [#32](https://github.com/unexpectedjs/unexpected/pull/32) Adding support for custom types ([Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- ['to have properties' assertion: Add diffable actual and expected properties so that mocha will show a nice diff.](https://github.com/unexpectedjs/unexpected/commit/f0797214cf0373243d66a72f68e5d58bdb019137) ([Andreas Lind Petersen](mailto:andreas@one.com))

### v3.0.1 (2014-03-21)

- [Made installPlugin chainable.](https://github.com/unexpectedjs/unexpected/commit/25660d12ee7b72e96d03c9ccc5baa1f07279a7b2) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Point to production tests from README](https://github.com/unexpectedjs/unexpected/commit/da6013f25fbc6046fb5492abcebf42bc8a897e1c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v3.0.0 (2014-03-21)

#### Pull requests

- [#30](https://github.com/unexpectedjs/unexpected/pull/30) Eliminate build step for node js and mocha ([Andreas Lind Petersen](mailto:andreas@one.com), [Sune Simonsen](mailto:sune@we-knowhow.dk))

#### Commits to master

- [Makefile, release-% target: Remind user to push tags.](https://github.com/unexpectedjs/unexpected/commit/f2c8fddbfde62647e7ed61078faf784eb729a318) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Added .npmignore so the generated files aren't excluded from the npm package.](https://github.com/unexpectedjs/unexpected/commit/4ebea67d69e0689a1eb1a66ca6959c7ccbccf4c6) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Makefile: Merge release-{patch,minor,major} into one target.](https://github.com/unexpectedjs/unexpected/commit/f1f50da46271a8406258d0530e75f1c53c2bb986) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Fixed wrong character in main name](https://github.com/unexpectedjs/unexpected/commit/9e22ac55b31798c8d59da71d0db43c7b33d65c0a) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v2.1.8 (2014-03-07)

- [Build unexpected for production](https://github.com/unexpectedjs/unexpected/commit/b204a43fcf42b88a54317cce50aa60ce90b78472) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Make overriding inspect on custom types work in the browser](https://github.com/unexpectedjs/unexpected/commit/fe6838d1e8b1a30ab91bb93b0b31b45d96b5ef1e) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v2.1.7 (2014-03-07)

- [Build unexpected for production](https://github.com/unexpectedjs/unexpected/commit/aa4dafc3381c15f444b345096ff810a6f3ff24dd) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Format errors as '\[Error: &lt;message&gt;\]' rather than '{}'.](https://github.com/unexpectedjs/unexpected/commit/7a8fd95a7f6af056be9656c7a5e249b169d216e1) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Update mocha to 1.17.1.](https://github.com/unexpectedjs/unexpected/commit/eac7667d21268e0e66566d44e0c39ceef3c434f0) ([Andreas Lind Petersen](mailto:andreas@one.com))

### v2.1.6 (2014-02-26)

- [Fixed namespace leak](https://github.com/unexpectedjs/unexpected/commit/7b7fd9369c65c877e4dd2fa8e29a3289a78d3f14) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v2.1.5 (2014-02-26)

- [Build unexpected for production](https://github.com/unexpectedjs/unexpected/commit/5a508f0c0e447a556c251e86bd74b2dddf5b83c5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixed namespace leak](https://github.com/unexpectedjs/unexpected/commit/6d04550b48e66c5576b8ba7b8ed87fa9fcc27b25) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v2.1.4 (2014-02-17)

- [Build unexpected for production](https://github.com/unexpectedjs/unexpected/commit/9397c92b3a8f8e98058b659253eba1c0e7736474) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Use charAt instead of indexing into strings to support IE](https://github.com/unexpectedjs/unexpected/commit/b430b75331d526cff05618bbc3d755d4d7ee82b2) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Don't use Array.prototype.indexOf from spec](https://github.com/unexpectedjs/unexpected/commit/fb69845fcb999aac6e45630399205870b567b02b) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v2.1.3 (2014-02-17)

- [Build unexpected for production](https://github.com/unexpectedjs/unexpected/commit/8774e789081f59c66cac3c95c24d206dabfd9937) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Rewrote indexOf shim to work in es4 environments](https://github.com/unexpectedjs/unexpected/commit/534b72e89364045034d8c2f9a2dbe14081342b7a) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v2.1.2 (2014-02-16)

- [Build unexpected for production](https://github.com/unexpectedjs/unexpected/commit/30a21f8d97a11a90ef81fe77e4fb95c7697ca118) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v2.1.1 (2014-02-16)

- [Use equal to test equality for 'to have properties'](https://github.com/unexpectedjs/unexpected/commit/77b2024abfa6d569e70caf37affee1511efcc862) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v2.1.0 (2014-01-18)

- [Build unexpected for production](https://github.com/unexpectedjs/unexpected/commit/37143a805f1f51dc883ab0f407d72fd7d669ae15) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Made a version of unexpected that requires es5 compatibility](https://github.com/unexpectedjs/unexpected/commit/8c05de2203ce5e99a2179aeca1d9ae4ca0563234) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Run jshint from node\_modules](https://github.com/unexpectedjs/unexpected/commit/2bb33f4675a7ca563a0b73602057fbff53202001) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Use make to run tests](https://github.com/unexpectedjs/unexpected/commit/7cedf03b876e42e5d78153dd154a9a8e4e15dda8) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Ensure that all source files are linted](https://github.com/unexpectedjs/unexpected/commit/fcb595cb6ce598a81f3fea2bb5215691662b92d4) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+3 more](https://github.com/unexpectedjs/unexpected/compare/v2.0.0...v2.1.0)

### v2.0.0 (2013-12-20)

#### Pull requests

- [#26](https://github.com/unexpectedjs/unexpected/pull/26) Added 'to have properties' assertion ([Gustav Nikolaj Olsen](mailto:gno@one.com), [Gustav Nikolaj Olsen](mailto:gustavnikolaj@gmail.com))

#### Commits to master

- [Using === for primitive values is the deep equal assertion](https://github.com/unexpectedjs/unexpected/commit/a74691acca37be6f5c14c6d1706dfd894688844d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Linking node assets](https://github.com/unexpectedjs/unexpected/commit/e3277ea043db4c2b0814c47b562f83adcd3de744) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Using phantomjs for testing](https://github.com/unexpectedjs/unexpected/commit/3e0c33c2b9ecaa014f5cdc6ba334205edc6297e5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Avoid wrapping in example](https://github.com/unexpectedjs/unexpected/commit/37286363531634b7ff0a81c30153a36062a6aaed) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Ensure that people does not rely on ES5 methods](https://github.com/unexpectedjs/unexpected/commit/036e9ee439d41ea964a5d0f13d5c1adefec5687c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.1.3 (2013-12-13)

- [Complain if the argument to installPlugin is not a function](https://github.com/unexpectedjs/unexpected/commit/5afa66aa9df16dac2c0c4b5e149c62504368e3e0) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.1.2 (2013-12-13)

- [Added an installPlugin to expect](https://github.com/unexpectedjs/unexpected/commit/b36a2076aae2f7c3bf6365aaad9a295f5834b52d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.1.1 (2013-12-11)

- [Added the item index to the 'to be an array whose items satisfy' assertion](https://github.com/unexpectedjs/unexpected/commit/e56557389120eafc9b796a4cf9123dffa2e22d31) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.1.0 (2013-12-05)

- [Fixed: bug where 'not to throw' with no arguments didn't work :-\/](https://github.com/unexpectedjs/unexpected/commit/c7413181cd2c169dd03b4b4f30425b5fe1202cd7) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.0.13 (2013-12-05)

- [Simple validation of arguments to expect](https://github.com/unexpectedjs/unexpected/commit/b8d16e93b2780aea7a7c43249c71974cd11ff3bb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.0.12
- [Set the showDiff property of the thrown errors under the same circumstances as expected\/actual, provided that the types are non-primitive and the same.](https://github.com/unexpectedjs/unexpected/commit/4f72a6a0a840734d7986d3217e6edfcc1a559b3f) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Updated readme to avoid scrolling in examples](https://github.com/unexpectedjs/unexpected/commit/7bdec58b7fe19df271811284ed47fe0b18d221db) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.0.11
- [Implemented the short string version of 'to be a ... whose items|keys|values satisfy'.](https://github.com/unexpectedjs/unexpected/commit/a79505ccc7bb207bbd7d6159c37e291942321280) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Implement 'to be an array of &lt;type&gt;s'. Fixes \#18.](https://github.com/unexpectedjs/unexpected/commit/d081225bca2bd5df6556b043ebccb1c542ed1a01) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Put \(a|an\) in a consistent order.](https://github.com/unexpectedjs/unexpected/commit/19fcb258d8373e17a1cef5ae2474f0566db50f2e) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Changed recurring regexp to require exactly three letters instead of three or more. Makes the intention clearer.](https://github.com/unexpectedjs/unexpected/commit/0e36268c9edd20978e5df6e98ae100ed727f6555) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Use the 'to be non-empty' to make the code slightly more readable.](https://github.com/unexpectedjs/unexpected/commit/4a77d5d5210e57b4f315d95113bf1088702c40f6) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [+5 more](https://github.com/unexpectedjs/unexpected/compare/v1.0.10...v1.0.11)

### v1.0.10 (2013-11-16)

- [Added assertion 'to be a map whose keys satisfy'](https://github.com/unexpectedjs/unexpected/commit/8c1b3c0301715ce054c3faf60d74374d4881cdfc) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Refactoring: Delegating from 'to be an array whose items satisfy' to 'to be a map whose values satisfy'](https://github.com/unexpectedjs/unexpected/commit/405f067c559de281f4542006bb306f0cdb0d51e4) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [ReadMe.md: Removed .js extension fron require.js example.](https://github.com/unexpectedjs/unexpected/commit/6639d9655e3b3cf33f31f5b91eb683e410f90464) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Fixed a copy paste error in the examples](https://github.com/unexpectedjs/unexpected/commit/afa460479640841994abe6b58f7458ea429da255) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Reformated examples to avoid scrolling](https://github.com/unexpectedjs/unexpected/commit/1137e2a915d10eda4d0bc3c30542c0a69afa602b) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+2 more](https://github.com/unexpectedjs/unexpected/compare/v1.0.9...v1.0.10)

### v1.0.9 (2013-11-16)

- [Added 'to be a map whose values satisfy' assertion](https://github.com/unexpectedjs/unexpected/commit/1f759b89384524a678cc6f0859d2829b4ae221eb) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.0.8 (2013-11-15)

- [#17](https://github.com/unexpectedjs/unexpected/pull/17) Added 'to be an array whose items satisfy' assertion ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.0.7
- [Implemented the uncontroversial suggestions from \#15.](https://github.com/unexpectedjs/unexpected/commit/4f01be3731c218c316a34f0871cb91352ab05a90) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Fixed typo in test.](https://github.com/unexpectedjs/unexpected/commit/8685442772c85dd4a13f754ea19307ad5d829e44) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Use the correct plural form of 'parenthesis'.](https://github.com/unexpectedjs/unexpected/commit/7aa7793d6bc892549e8320f00ba01be6fd08f1fc) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Update mocha to 1.14.0.](https://github.com/unexpectedjs/unexpected/commit/ba1ce5370d8c3c5957334c8bc9283c95224622ed) ([Andreas Lind Petersen](mailto:andreas@one.com))
- [Using 'expect' as the target for 'is a function' to make it a little more geeky](https://github.com/unexpectedjs/unexpected/commit/5265674a24fdf01c8531c132603042aaf66f069c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.0.6 (2013-11-13)

#### Pull requests

- [#16](https://github.com/unexpectedjs/unexpected/pull/16) Corrected a spelling mistake in an usage example ([Martin Gausby](mailto:martin.gausby@mac.com))

#### Commits to master

- [Copying the assertions map for clones instead of using the prototype chain.](https://github.com/unexpectedjs/unexpected/commit/171a5464adb196b79f87e08f814e925b3335c407) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.0.5 (2013-11-12)

- [Added support for printing all registered assertions to the console](https://github.com/unexpectedjs/unexpected/commit/ee8078e2cd50ecef150d3ce04173d997362cbf09) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated the === equality documented to reflect the tests](https://github.com/unexpectedjs/unexpected/commit/751e195c3846a1ea131f467c7f154dd4f3098501) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Documented 'to be true' and 'to be false' assertions](https://github.com/unexpectedjs/unexpected/commit/8120a1a1ea41e9bf1a49d57620d2cd9a1ee59991) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added test for 'not to be true' and 'not to be false'](https://github.com/unexpectedjs/unexpected/commit/35f284345899f7f55deffc1edec72bea306c2f54) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.0.4 (2013-11-12)

- [#14](https://github.com/unexpectedjs/unexpected/pull/14) Implemented 'to be true' and 'to be false' shorthands. ([Andreas Lind Petersen](mailto:andreas@one.com))

### v1.0.2 (2013-11-11)

- [Added chaining for addAssertion](https://github.com/unexpectedjs/unexpected/commit/cb87532479f3f34844aa34d11b48937b233b94e5) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Make expect cloneable and refactored towards having unexpected instances backing the expect function](https://github.com/unexpectedjs/unexpected/commit/97c47591633ef30fe4c1265e2b1686d452c9e52d) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Removed internal namespace](https://github.com/unexpectedjs/unexpected/commit/21c97039788683de3d30739662e7d8d13b38934f) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Simplified definition of throw expection assertion](https://github.com/unexpectedjs/unexpected/commit/b347be02ec3d2df6c85e2d2831b4b958f8a70b7a) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Comment](https://github.com/unexpectedjs/unexpected/commit/6f181bc13e7c2a90303d66dd09551e8478a44417) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+5 more](https://github.com/unexpectedjs/unexpected/compare/v1.0.1...v1.0.2)

### v1.0.1 (2013-09-17)

#### Pull requests

- [#11](https://github.com/unexpectedjs/unexpected/pull/11) Implemented 'to be finite' and 'to be infinite' assertions. ([Andreas Lind Petersen](mailto:andreas@one.com))
- [#9](https://github.com/unexpectedjs/unexpected/pull/9) Added 'to be null' and 'to be undefined' assertions ([Andreas Lind Petersen](mailto:andreas@one.com))

#### Commits to master

- [Added explicit assertion for testing against NaN](https://github.com/unexpectedjs/unexpected/commit/aad122a19b41c238a6d57eda11e907b464ed492c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v1.0.0 (2013-09-16)

#### Pull requests

- [#7](https://github.com/unexpectedjs/unexpected/pull/7) Include 'expected' and 'actual' properties on the exception object ([Andreas Lind Petersen](mailto:andreas@one.com))
- [#8](https://github.com/unexpectedjs/unexpected/pull/8) 'to be' and 'to equal': Added tests for Buffer instances. ([Andreas Lind Petersen](mailto:andreas@one.com))

#### Commits to master

- [Changed wording in assertions to sound better:](https://github.com/unexpectedjs/unexpected/commit/66a5619fd2a624fc535aa68933dac91cbbaae93a) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Revert "Added '\[not\] to be' and '\[not\] to equal' assertions"](https://github.com/unexpectedjs/unexpected/commit/85189962d8bf5ce15905e0cec6d1570d528cf0fd) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added 'to throw' assertion](https://github.com/unexpectedjs/unexpected/commit/39f61d357b80c65aea965c298eee3f5af39487d3) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added '\[not\] to be' and '\[not\] to equal' assertions](https://github.com/unexpectedjs/unexpected/commit/f73d381fb673c1743c8ab784ee420434c048be68) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v0.1.1 (2013-09-11)

- [#4](https://github.com/unexpectedjs/unexpected/pull/4) Remove unexpected's entries from the stack traces of the thrown error objectsThis is really nice - thank very much! ([Andreas Lind Petersen](mailto:andreas@one.com))
- [#3](https://github.com/unexpectedjs/unexpected/pull/3) Fixed regular expression assertions and added shorthands ([Andreas Lind Petersen](mailto:andreas@one.com))

### v0.1.0 (2013-09-03)

#### Pull requests

- [#2](https://github.com/unexpectedjs/unexpected/pull/2) Fixed grammar: \(less|greater\) than or equal{s =&gt;} ([Andreas Lind Petersen](mailto:andreas@one.com))

#### Commits to master

- [Documented new type assertions](https://github.com/unexpectedjs/unexpected/commit/8c17462b9f13667a09d5f1c39bd247870ed10ab7) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v0.0.7 (2013-09-03)

- [Added aliases for common type assertions](https://github.com/unexpectedjs/unexpected/commit/6d1f60e2f7fbf3f665eaaa0109a17d44cfb956cf) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Removed usage warning](https://github.com/unexpectedjs/unexpected/commit/8614d291ed47cb4d15a31691b49795e69ff66ed9) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v0.0.6 (2013-08-27)

- [Stop overriding weknowhow namespace](https://github.com/unexpectedjs/unexpected/commit/4f10f34b63cf4a9d8e3b7be1ccee8f991968506b) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v0.0.5 (2013-08-25)

- [Fixed bug where you would get a trailing space if you had a flag in the end of the assertion pattern](https://github.com/unexpectedjs/unexpected/commit/1f82a46ff5ebaeb4031c1732c88d1df7b2a93ba0) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Updated feature list in readme](https://github.com/unexpectedjs/unexpected/commit/926c904443eaed18389fe1e69f96e6010ce7059c) ([Sune Simonsen](mailto:sune@we-knowhow.dk))

### v0.0.4 (2013-08-15)

- [Removed performance comparison with expect.js as it doesn't work anymore](https://github.com/unexpectedjs/unexpected/commit/85468a94a09e905539d53189c33daadbd383c9b9) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Only show one sugestion when failing on an unknown assertion](https://github.com/unexpectedjs/unexpected/commit/25d6ee68bdca7266aa93f2a836ead42336b34829) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Make suggestions when using an unknown assertion](https://github.com/unexpectedjs/unexpected/commit/a40553a2680785ecf8838f1418c5387d1a5e37e6) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Added missing else](https://github.com/unexpectedjs/unexpected/commit/746c7900f88b412dbfea5adc144f772bed9c2f79) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [Fixing string indexing on IE](https://github.com/unexpectedjs/unexpected/commit/3c123bd9bff9679fd7b99c1368fca00f817abc00) ([Sune Simonsen](mailto:sune@we-knowhow.dk))
- [+69 more](https://github.com/unexpectedjs/unexpected/compare/85468a94a09e905539d53189c33daadbd383c9b9%5E...v0.0.4)

