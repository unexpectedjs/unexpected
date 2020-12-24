/* global expect */
describe('use', () => {
  let clonedExpect;
  beforeEach(() => {
    clonedExpect = expect.clone();
  });

  it('calls the given plugin with the clonedExpect instance as the parameter', function (done) {
    const plugin = {
      name: 'test',
      installInto(expectInstance) {
        clonedExpect(expectInstance).toBe(clonedExpect);
        done();
      },
    };
    clonedExpect.use(plugin);
  });

  it('supports installPlugin as a legacy alias', function (done) {
    clonedExpect.installPlugin({
      name: 'test',
      installInto(expectInstance) {
        expect(expectInstance).toBe(clonedExpect);
        done();
      },
    });
  });

  it('throws if the given arguments does not adhere to the plugin interface', () => {
    clonedExpect(function () {
      clonedExpect.use({});
    }).toThrow(
      'Plugins must be functions or adhere to the following interface\n' +
        '{\n' +
        '  name: <an optional plugin name>,\n' +
        '  version: <an optional semver version string>,\n' +
        '  installInto: <a function that will update the given expect instance>\n' +
        '}'
    );
  });

  it('allows the installation of a plugin given as an anonymous function', () => {
    let callCount = 0;
    const plugin = function () {
      callCount += 1;
    };
    clonedExpect.use(plugin);
    expect(callCount).toEqual(1);
    clonedExpect.use(plugin);
    expect(callCount).toEqual(1);
  });

  it('allows the installation of a plugin given as a named function', () => {
    let callCount = 0;
    const plugin = function myPlugin() {
      callCount += 1;
    };
    clonedExpect.use(plugin);
    expect(callCount).toEqual(1);
    clonedExpect.use(plugin);
    expect(callCount).toEqual(1);
  });

  it('fails if identically named, but different functions are installed', () => {
    clonedExpect.use(function myPlugin() {});
    expect(function () {
      clonedExpect.use(function myPlugin() {});
    }).toThrow(
      "Another instance of the plugin 'myPlugin' is already installed. Please check your node_modules folder for unmet peerDependencies."
    );
  });

  it('does not fail if all plugin dependencies has been fulfilled', function (done) {
    const pluginA = {
      name: 'PluginA',
      installInto(clonedExpect) {},
    };
    const pluginB = {
      name: 'PluginB',
      dependencies: ['PluginA'],
      installInto(clonedExpect) {
        done();
      },
    };
    clonedExpect.use(pluginA);
    clonedExpect.use(pluginB);
  });

  it('dependencies can be fulfilled across clones', function (done) {
    const pluginA = {
      name: 'PluginA',
      installInto(clonedExpect) {},
    };
    const pluginB = {
      name: 'PluginB',
      dependencies: ['PluginA'],
      installInto(clonedExpect) {
        done();
      },
    };
    clonedExpect.use(pluginA);
    clonedExpect.clone().use(pluginB);
  });

  it('installing a plugin more than once is a no-op', () => {
    let callCount = 0;
    const plugin = {
      name: 'plugin',
      installInto() {
        callCount += 1;
      },
    };
    clonedExpect.use(plugin);
    clonedExpect.use(plugin);
    clonedExpect.use(plugin);
    expect(callCount).toBe(1);
  });

  it('installing two different plugins that are identically named and have the same version (but not ===) will only install the first one', () => {
    let callCount1 = 0;
    const plugin1 = {
      name: 'plugin',
      version: '1.2.3',
      installInto() {
        callCount1 += 1;
      },
    };
    let callCount2 = 0;
    const plugin2 = {
      name: 'plugin',
      version: '1.2.3',
      installInto() {
        callCount2 += 1;
      },
    };
    clonedExpect.use(plugin1).use(plugin2);
    expect(callCount1).toBe(1);
    expect(callCount2).toBe(0);
  });

  it('should throw an error when installing two different plugins that are identically named and have different versions', () => {
    clonedExpect.use({
      name: 'plugin',
      version: '1.2.3',
      installInto() {},
    });
    expect(function () {
      clonedExpect.use({
        name: 'plugin',
        version: '1.5.6',
        installInto() {},
      });
    }).toThrow(
      "Another instance of the plugin 'plugin' is already installed (version 1.2.3, trying to install 1.5.6). Please check your node_modules folder for unmet peerDependencies."
    );
  });

  it('should throw an error when two identically named plugins where the first one has a version number', () => {
    clonedExpect.use({
      name: 'plugin',
      version: '1.2.3',
      installInto() {},
    });
    expect(function () {
      clonedExpect.use({
        name: 'plugin',
        installInto() {},
      });
    }).toThrow(
      "Another instance of the plugin 'plugin' is already installed (version 1.2.3). Please check your node_modules folder for unmet peerDependencies."
    );
  });

  it('installing a version-less plugin with the same name as another plugin (but not ===) throws an error', () => {
    clonedExpect.use({
      name: 'test',
      installInto() {},
    });
    expect(function () {
      clonedExpect.use({
        name: 'test',
        installInto() {},
      });
    }).toThrow(
      "Another instance of the plugin 'test' is already installed. Please check your node_modules folder for unmet peerDependencies."
    );
  });

  it('should refuse to install a plugin named unexpected-promise', () => {
    expect(function () {
      expect.use({
        name: 'unexpected-promise',
        installInto() {},
      });
    }).toThrow(
      'The unexpected-promise plugin was pulled into Unexpected as of 8.5.0. This means that the plugin is no longer supported.'
    );
  });
});
