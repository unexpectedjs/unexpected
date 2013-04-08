// Copyright 2013 Sune Simonsen
// https://github.com/sunesimonsen/factory.js
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var root = this;

(function () {
    function expect() {
        
    }

    // Support three module loading scenarios
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // CommonJS/Node.js
        module.exports = expect;
        exports.expect = expect;
    } else if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(function () {
            return expect;
        });
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        root.weknowhow = {
            expect: expect
        };
    }
}());
