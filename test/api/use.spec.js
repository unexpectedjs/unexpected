/*global expect*/
describe('use', function () {
    var clonedExpect;
    beforeEach(function () {
        clonedExpect = expect.clone();
    });

    it('calls the given plugin with the clonedExpect instance as the parameter', function (done) {
        var plugin = {
            name: 'test',
            installInto: function (expectInstance) {
                clonedExpect(expectInstance, 'to be', clonedExpect);
                done();
            }
        };
        clonedExpect.use(plugin);
    });

    it('supports installPlugin as a legacy alias', function (done) {
        clonedExpect.installPlugin({
            name: 'test',
            installInto: function (expectInstance) {
                expect(expectInstance, 'to be', clonedExpect);
                done();
            }
        });
    });

    it('throws if the given arguments does not adhere to the plugin interface', function () {
        clonedExpect(function () {
            clonedExpect.use({});
        }, 'to throw', 'Plugins must be functions or adhere to the following interface\n' +
               '{\n' +
               '  name: <an optional plugin name>,\n' +
               '  version: <an optional semver version string>,\n' +
               '  dependencies: <an optional list of dependencies>,\n' +
               '  installInto: <a function that will update the given expect instance>\n' +
               '}');
    });

    it('allows the installation of a plugin given as an anonymous function', function () {
        var callCount = 0;
        var plugin = function () {
            callCount += 1;
        };
        clonedExpect.use(plugin);
        expect(callCount, 'to equal', 1);
        clonedExpect.use(plugin);
        expect(callCount, 'to equal', 1);
    });

    it('allows the installation of a plugin given as a named function', function () {
        var callCount = 0;
        var plugin = function myPlugin() {
            callCount += 1;
        };
        clonedExpect.use(plugin);
        expect(callCount, 'to equal', 1);
        clonedExpect.use(plugin);
        expect(callCount, 'to equal', 1);
    });

    it('fails if identically named, but different functions are installed', function () {
        clonedExpect.use(function myPlugin() {});
        expect(function () {
            clonedExpect.use(function myPlugin() {});
        }, 'to throw', "Another instance of the plugin 'myPlugin' is already installed. Please check your node_modules folder for unmet peerDependencies.");
    });

    it('does not fail if all plugin dependencies has been fulfilled', function (done) {
        var pluginA = {
            name: 'PluginA',
            installInto: function (clonedExpect) {}
        };
        var pluginB = {
            name: 'PluginB',
            dependencies: ['PluginA'],
            installInto: function (clonedExpect) {
                done();
            }
        };
        clonedExpect.use(pluginA);
        clonedExpect.use(pluginB);
    });

    it('throws if the plugin has unfulfilled plugin dependencies', function () {
        var pluginB = {
            name: 'PluginB',
            dependencies: ['PluginA'],
            installInto: function (clonedExpect) {}
        };

        expect(function () {
            clonedExpect.use(pluginB);
        }, 'to throw', 'PluginB requires plugin PluginA');

        var pluginC = {
            name: 'PluginC',
            dependencies: ['PluginA', 'PluginB'],
            installInto: function (clonedExpect) {}
        };

        expect(function () {
            clonedExpect.use(pluginC);
        }, 'to throw', 'PluginC requires plugins PluginA and PluginB');

        var pluginD = {
            name: 'PluginD',
            dependencies: ['PluginA', 'PluginB', 'PluginC'],
            installInto: function (clonedExpect) {}
        };

        expect(function () {
            clonedExpect.use(pluginD);
        }, 'to throw', 'PluginD requires plugins PluginA, PluginB and PluginC');
    });

    it('dependencies can be fulfilled across clones', function (done) {
        var pluginA = {
            name: 'PluginA',
            installInto: function (clonedExpect) {}
        };
        var pluginB = {
            name: 'PluginB',
            dependencies: ['PluginA'],
            installInto: function (clonedExpect) {
                done();
            }
        };
        clonedExpect.use(pluginA);
        clonedExpect.clone().use(pluginB);
    });

    it('installing a plugin more than once is a no-op', function () {
        var callCount = 0;
        var plugin = {
            name: 'plugin',
            installInto: function () {
                callCount += 1;
            }
        };
        clonedExpect.use(plugin);
        clonedExpect.use(plugin);
        clonedExpect.use(plugin);
        expect(callCount, 'to be', 1);
    });

    it('installing two different plugins that are identically named and have the same version (but not ===) will only install the first one', function () {
        var callCount1 = 0;
        var plugin1 = {
            name: 'plugin',
            version: '1.2.3',
            installInto: function () {
                callCount1 += 1;
            }
        };
        var callCount2 = 0;
        var plugin2 = {
            name: 'plugin',
            version: '1.2.3',
            installInto: function () {
                callCount2 += 1;
            }
        };
        clonedExpect.use(plugin1).use(plugin2);
        expect(callCount1, 'to be', 1);
        expect(callCount2, 'to be', 0);
    });

    it('should throw an error when installing two different plugins that are identically named and have different versions', function () {
        clonedExpect.use({
            name: 'plugin',
            version: '1.2.3',
            installInto: function () {}
        });
        expect(function () {
            clonedExpect.use({
                name: 'plugin',
                version: '1.5.6',
                installInto: function () {}
            });
        }, 'to throw', "Another instance of the plugin 'plugin' is already installed (version 1.2.3, trying to install 1.5.6). Please check your node_modules folder for unmet peerDependencies.");
    });

    it('should throw an error when two identically named plugins where the first one has a version number', function () {
        clonedExpect.use({
            name: 'plugin',
            version: '1.2.3',
            installInto: function () {}
        });
        expect(function () {
            clonedExpect.use({
                name: 'plugin',
                installInto: function () {}
            });
        }, 'to throw', "Another instance of the plugin 'plugin' is already installed (version 1.2.3). Please check your node_modules folder for unmet peerDependencies.");
    });

    it('installing a version-less plugin with the same name as another plugin (but not ===) throws an error', function () {
        clonedExpect.use({
            name: 'test',
            installInto: function () {}
        });
        expect(function () {
            clonedExpect.use({
                name: 'test',
                installInto: function () {}
            });
        }, 'to throw', "Another instance of the plugin 'test' is already installed. Please check your node_modules folder for unmet peerDependencies.");
    });

    it('should refuse to install a plugin named unexpected-promise', function () {
        expect(function () {
            expect.use({
                name: 'unexpected-promise',
                installInto: function () {} }

            );
        }, 'to throw', 'The unexpected-promise plugin was pulled into Unexpected as of 8.5.0. This means that the plugin is no longer supported.');
    });
});
