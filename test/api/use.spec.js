/*global expect*/
describe('use', () => {
  var clonedExpect;
  beforeEach(() => {
    clonedExpect = expect.clone();
  });

  it('calls the given plugin with the clonedExpect instance as the parameter', done => {
    var plugin = {
      name: 'test',
      installInto(expectInstance) {
        clonedExpect(expectInstance, 'to be', clonedExpect);
        done();
      }
    };
    clonedExpect.use(plugin);
  });

  it('supports installPlugin as a legacy alias', done => {
    clonedExpect.installPlugin({
      name: 'test',
      installInto(expectInstance) {
        expect(expectInstance, 'to be', clonedExpect);
        done();
      }
    });
  });

  it('throws if the given arguments does not adhere to the plugin interface', () => {
    clonedExpect(
      () => {
        clonedExpect.use({});
      },
      'to throw',
      'Plugins must be functions or adhere to the following interface\n' +
        '{\n' +
        '  name: <an optional plugin name>,\n' +
        '  version: <an optional semver version string>,\n' +
        '  installInto: <a function that will update the given expect instance>\n' +
        '}'
    );
  });

  it('allows the installation of a plugin given as an anonymous function', () => {
    var callCount = 0;
    var plugin = function() {
      callCount += 1;
    };
    clonedExpect.use(plugin);
    expect(callCount, 'to equal', 1);
    clonedExpect.use(plugin);
    expect(callCount, 'to equal', 1);
  });

  it('allows the installation of a plugin given as a named function', () => {
    var callCount = 0;
    var plugin = function myPlugin() {
      callCount += 1;
    };
    clonedExpect.use(plugin);
    expect(callCount, 'to equal', 1);
    clonedExpect.use(plugin);
    expect(callCount, 'to equal', 1);
  });

  it('fails if identically named, but different functions are installed', () => {
    clonedExpect.use(() => {});
    expect(
      () => {
        clonedExpect.use(() => {});
      },
      'to throw',
      "Another instance of the plugin 'myPlugin' is already installed. Please check your node_modules folder for unmet peerDependencies."
    );
  });

  it('does not fail if all plugin dependencies has been fulfilled', done => {
    var pluginA = {
      name: 'PluginA',
      installInto(clonedExpect) {}
    };
    var pluginB = {
      name: 'PluginB',
      dependencies: ['PluginA'],
      installInto(clonedExpect) {
        done();
      }
    };
    clonedExpect.use(pluginA);
    clonedExpect.use(pluginB);
  });

  it('dependencies can be fulfilled across clones', done => {
    var pluginA = {
      name: 'PluginA',
      installInto(clonedExpect) {}
    };
    var pluginB = {
      name: 'PluginB',
      dependencies: ['PluginA'],
      installInto(clonedExpect) {
        done();
      }
    };
    clonedExpect.use(pluginA);
    clonedExpect.clone().use(pluginB);
  });

  it('installing a plugin more than once is a no-op', () => {
    var callCount = 0;
    var plugin = {
      name: 'plugin',
      installInto() {
        callCount += 1;
      }
    };
    clonedExpect.use(plugin);
    clonedExpect.use(plugin);
    clonedExpect.use(plugin);
    expect(callCount, 'to be', 1);
  });

  it('installing two different plugins that are identically named and have the same version (but not ===) will only install the first one', () => {
    var callCount1 = 0;
    var plugin1 = {
      name: 'plugin',
      version: '1.2.3',
      installInto() {
        callCount1 += 1;
      }
    };
    var callCount2 = 0;
    var plugin2 = {
      name: 'plugin',
      version: '1.2.3',
      installInto() {
        callCount2 += 1;
      }
    };
    clonedExpect.use(plugin1).use(plugin2);
    expect(callCount1, 'to be', 1);
    expect(callCount2, 'to be', 0);
  });

  it('should throw an error when installing two different plugins that are identically named and have different versions', () => {
    clonedExpect.use({
      name: 'plugin',
      version: '1.2.3',
      installInto() {}
    });
    expect(
      () => {
        clonedExpect.use({
          name: 'plugin',
          version: '1.5.6',
          installInto() {}
        });
      },
      'to throw',
      "Another instance of the plugin 'plugin' is already installed (version 1.2.3, trying to install 1.5.6). Please check your node_modules folder for unmet peerDependencies."
    );
  });

  it('should throw an error when two identically named plugins where the first one has a version number', () => {
    clonedExpect.use({
      name: 'plugin',
      version: '1.2.3',
      installInto() {}
    });
    expect(
      () => {
        clonedExpect.use({
          name: 'plugin',
          installInto() {}
        });
      },
      'to throw',
      "Another instance of the plugin 'plugin' is already installed (version 1.2.3). Please check your node_modules folder for unmet peerDependencies."
    );
  });

  it('installing a version-less plugin with the same name as another plugin (but not ===) throws an error', () => {
    clonedExpect.use({
      name: 'test',
      installInto() {}
    });
    expect(
      () => {
        clonedExpect.use({
          name: 'test',
          installInto() {}
        });
      },
      'to throw',
      "Another instance of the plugin 'test' is already installed. Please check your node_modules folder for unmet peerDependencies."
    );
  });

  it('should refuse to install a plugin named unexpected-promise', () => {
    expect(
      () => {
        expect.use({
          name: 'unexpected-promise',
          installInto() {}
        });
      },
      'to throw',
      'The unexpected-promise plugin was pulled into Unexpected as of 8.5.0. This means that the plugin is no longer supported.'
    );
  });
});
