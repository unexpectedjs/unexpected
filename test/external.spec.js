/*global unexpected*/

var expect = unexpected.clone();

if (typeof process === 'object') {
    describe('invoked in a test via an external test runner', function () {
        var pathModule = require('path');
        var childProcess = require('child_process');
        var basePath = pathModule.resolve(__dirname, '..');
        var extend = require('../lib/utils').extend;
        describe('executed through mocha', function () {
            expect.addAssertion('<string> executed through mocha <object?>', function (expect, subject, env) {
                return expect.promise(function (run) {
                    childProcess.execFile(pathModule.resolve(basePath, 'node_modules', '.bin', 'mocha'), [
                        pathModule.resolve(__dirname, 'external', subject + '.externaljs')
                    ], {
                        cwd: basePath,
                        env: extend({}, process.env, env || {})
                    }, run(function (err, stdout, stderr) {
                        return [err, stdout, stderr];
                    }));
                });
            });

            it('should report that a promise was created, but not returned by the it block', function () {
                return expect('forgotToReturnPendingPromiseFromSuccessfulItBlock', 'executed through mocha').spread(function (err, stdout, stderr) {
                    expect(stdout, 'to contain', 'Error: should call the callback: You have created a promise that was not returned from the it block');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            it('should not report that a promise was created if the test already failed synchronously', function () {
                return expect('forgotToReturnPendingPromiseFromFailingItBlock', 'executed through mocha').spread(function (err, stdout, stderr) {
                    expect(stdout, 'not to contain', 'should call the callback: You have created a promise that was not returned from the it block');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            it('should trim unexpected plugins from the stack trace when the UNEXPECTED_FULL_TRACE environment variable is not set', function () {
                return expect('fullTrace', 'executed through mocha', { UNEXPECTED_FULL_TRACE: '' }).spread(function (err, stdout, stderr) {
                    expect(stdout, 'not to contain', 'node_modules/unexpected-bogus/');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            it('should not trim unexpected plugins from the stack trace when the UNEXPECTED_FULL_TRACE environment variable is set', function () {
                return expect('fullTrace', 'executed through mocha', { UNEXPECTED_FULL_TRACE: 'yes' }).spread(function (err, stdout, stderr) {
                    expect(stdout, 'to contain', 'node_modules/unexpected-bogus/');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            it('should accept an UNEXPECTED_DEPTH environment variable', function () {
                return expect('deepObject', 'executed through mocha', { UNEXPECTED_DEPTH: 6 }).spread(function (err, stdout, stderr) {
                    expect(err, 'to be falsy');
                });
            });
        });

        describe('executed through jasmine', function () {
            expect.addAssertion('<string> executed through jasmine', function (expect, subject, value) {
                return expect.promise(function (run) {
                    childProcess.execFile(pathModule.resolve(__dirname, '..', 'node_modules', '.bin', 'jasmine'), {
                        cwd: basePath,
                        env: extend({}, process.env, {
                            JASMINE_CONFIG_PATH: 'test/external/' + subject + '.jasmine.json'
                        })
                    }, run(function (err, stdout, stderr) {
                        return [err, stdout, stderr];
                    }));
                });
            });

            it('should report that a promise was created, but not returned by the it block when the test ', function () {
                return expect('forgotToReturnPendingPromiseFromSuccessfulItBlock', 'executed through jasmine').spread(function (err, stdout, stderr) {
                    expect(stdout, 'to contain', 'should call the callback: You have created a promise that was not returned from the it block');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            it('should not report that a promise was created if the test already failed synchronously', function () {
                return expect('forgotToReturnPendingPromiseFromFailingItBlock', 'executed through jasmine').spread(function (err, stdout, stderr) {
                    expect(stdout, 'not to contain', 'should call the callback: You have created a promise that was not returned from the it block');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });
        });
    });
}
