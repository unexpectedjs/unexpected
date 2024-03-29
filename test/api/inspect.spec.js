/* global expect */
describe('inspect', () => {
  function Field(val, options) {
    let value = val;
    const propertyDescription = {
      enumerable: true,
    };
    if (options.match(/getter/)) {
      propertyDescription.get = function () {
        return value;
      };
    }

    if (options.match(/setter/)) {
      propertyDescription.set = function (val) {
        value = val;
      };
    }
    Object.defineProperty(this, 'value', propertyDescription);
  }

  const circular = {};
  circular.self = circular;

  if (Object.defineProperty) {
    it('handles getters and setters correctly', () => {
      expect(
        new Field('VALUE', 'getter'),
        'to inspect as',
        "Field({ value: 'VALUE' /* getter */ })"
      );
      expect(
        new Field('VALUE', 'setter'),
        'to inspect as',
        'Field({ set value: function (val) { value = val; } })'
      );
      expect(
        new Field('VALUE', 'getter and setter'),
        'to inspect as',
        "Field({ value: 'VALUE' /* getter/setter */ })"
      );
    });
  }

  it('should render strings with control chars and backslashes correctly', () => {
    let stringWithControlCharsAndStuff = '\\';
    for (let i = 0; i < 32; i += 1) {
      stringWithControlCharsAndStuff += String.fromCharCode(i);
    }

    expect(
      stringWithControlCharsAndStuff,
      'to inspect as',
      "'\\\\\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\b\\t\\n\\x0b\\f\\r\\x0e\\x0f\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f'"
    );
  });

  describe('with various special values', () => {
    it('renders null correctly', () => {
      expect(null, 'to inspect as', 'null');
    });

    it('renders undefined correctly', () => {
      expect(undefined, 'to inspect as', 'undefined');
    });

    it('renders NaN correctly', () => {
      expect(NaN, 'to inspect as', 'NaN');
    });

    it('renders zero correctly', () => {
      expect(0, 'to inspect as', '0');
    });

    it('renders negative zero correctly', () => {
      expect(-0, 'to inspect as', '-0');
    });

    it('renders Infinity correctly', () => {
      expect(Infinity, 'to inspect as', 'Infinity');
    });

    it('renders -Infinity correctly', () => {
      expect(-Infinity, 'to inspect as', '-Infinity');
    });
    it('sparse array', () => {
      const sparse = [];
      sparse[1] = 'foo';
      expect(sparse, 'to inspect as', "[ , 'foo' ]");
    });
    it('sparse array with explicit undefined', () => {
      const sparse = [];
      sparse[1] = undefined;
      expect(sparse, 'to inspect as', '[ , undefined ]');
    });
  });

  describe('block items as inspected correctly in', () => {
    const clonedExpect = expect.clone().addType({
      name: 'multiline',
      base: 'string',
      identify(value) {
        return typeof value === 'string' && value.indexOf('\n') !== -1;
      },
      inspect(value, depth, output) {
        output.block(function () {
          this.jsString("'")
            .block(function () {
              this.jsString(value);
            })
            .amend('jsString', "'");
        });
      },
    });

    it('arrays', () => {
      clonedExpect(
        ['foo\nfoo', 'bar'],
        'to inspect as',
        '[\n' + "  'foo\n" + "   foo',\n" + "  'bar'\n" + ']'
      );
    });

    it('objects', () => {
      clonedExpect(
        { foo: 'foo\nfoo', bar: 'bar' },
        'to inspect as',
        '{\n' + "  foo: 'foo\n" + "        foo',\n" + "  bar: 'bar'\n" + '}'
      );
    });
  });

  it('indents correctly', () => {
    const data = [
      {
        guid: 'db550c87-1680-462a-bacc-655cecdd8907',
        isActive: false,
        age: 38,
        email: 'huntterry@medalert.com',
        phone: '+1 (803) 472-3209',
        address: '944 Milton Street, Madrid, Ohio, 1336',
        about:
          'Ea consequat nulla duis incididunt ut irure' +
          'irure cupidatat. Est tempor cillum commodo aliqua' +
          'consequat esse commodo. Culpa ipsum eu consectetur id' +
          'enim quis sint. Aliqua deserunt dolore reprehenderit' +
          'id anim exercitation laboris. Eiusmod aute consectetur' +
          'excepteur in nulla proident occaecat' +
          'consectetur.\r\n',
        registered: new Date('Sun Jun 03 1984 11:36:47 GMT+0200 (CEST)'),
        latitude: 8.635553,
        longitude: -103.382498,
        tags: ['tempor', 'dolore', 'non', 'sit', 'minim', 'aute', 'non'],
        friends: [
          { id: 0, name: 'Jeanne Hyde' },
          { id: 1, name: 'Chavez Parker' },
          { id: 2, name: 'Orr Rogers' },
          { id: 3, name: 'Etta Glover' },
          { id: 4, name: 'Glenna Aguirre' },
          { id: 5, name: 'Erika England' },
          { id: 6, name: 'Casandra Stanton' },
          { id: 7, name: 'Hooper Cobb' },
          { id: 8, name: 'Gates Todd' },
          { id: 9, name: 'Lesa Chase' },
          { id: 10, name: 'Natasha Frazier' },
          { id: 11, name: 'Lynnette Key' },
          { id: 12, name: 'Linda Mclaughlin' },
          { id: 13, name: 'Harrison Martinez' },
          { id: 14, name: 'Tameka Hebert' },
          { id: 15, name: 'Gena Farley' },
          { id: 16, name: 'Conley Walsh' },
          { id: 17, name: 'Suarez Norman' },
          { id: 18, name: 'Susana Pitts' },
          { id: 19, name: 'Peck Hester' },
        ],
      },
      {
        guid: '904c2f38-071c-4b97-b968-f5c228aaf41a',
        isActive: false,
        age: 34,
        email: 'peckhester@medalert.com',
        phone: '+1 (848) 599-3447',
        address: '323 Legion Street, Caspar, Delaware, 4117',
        registered: new Date('Tue Mar 10 1981 18:02:53 GMT+0100 (CET)'),
        latitude: -55.321712,
        longitude: -100.276818,
        tags: [
          'Lorem',
          'laboris',
          'enim',
          'anim',
          'sint',
          'incididunt',
          'labore',
        ],
        friends: [
          { id: 0, name: 'Patterson Meadows' },
          { id: 1, name: 'Velasquez Joseph' },
          { id: 2, name: 'Horn Harrison' },
          { id: 3, name: 'Young Mooney' },
          { id: 4, name: 'Barbara Lynn' },
          { id: 5, name: 'Sharpe Downs' },
        ],
        circular,
        this: {
          is: {
            deeply: {
              nested: { object: 'This should not be shown' },
              string: 'should be shown',
              list: [1, 2, 3],
            },
            list: [1, 2, 3],
          },
        },
      },
    ];

    expect(
      expect.inspect(data, 5).toString(),
      'to equal',
      '[\n' +
        '  {\n' +
        "    guid: 'db550c87-1680-462a-bacc-655cecdd8907', isActive: false,\n" +
        "    age: 38, email: 'huntterry@medalert.com', phone: '+1 (803) 472-3209',\n" +
        "    address: '944 Milton Street, Madrid, Ohio, 1336',\n" +
        "    about: 'Ea consequat nulla duis incididunt ut irureirure cupidatat. Est tempor cillum commodo aliquaconsequat esse commodo. Culpa ipsum eu consectetur idenim quis sint. Aliqua deserunt dolore reprehenderitid anim exercitation laboris. Eiusmod aute consecteturexcepteur in nulla proident occaecatconsectetur.\\r\\n',\n" +
        "    registered: new Date('1984-06-03T09:36:47Z'), latitude: 8.635553,\n" +
        '    longitude: -103.382498,\n' +
        "    tags: [ 'tempor', 'dolore', 'non', 'sit', 'minim', 'aute', 'non' ],\n" +
        '    friends: [\n' +
        "      { id: 0, name: 'Jeanne Hyde' },\n" +
        "      { id: 1, name: 'Chavez Parker' },\n" +
        "      { id: 2, name: 'Orr Rogers' },\n" +
        "      { id: 3, name: 'Etta Glover' },\n" +
        "      { id: 4, name: 'Glenna Aguirre' },\n" +
        "      { id: 5, name: 'Erika England' },\n" +
        "      { id: 6, name: 'Casandra Stanton' },\n" +
        "      { id: 7, name: 'Hooper Cobb' },\n" +
        "      { id: 8, name: 'Gates Todd' },\n" +
        "      { id: 9, name: 'Lesa Chase' },\n" +
        "      { id: 10, name: 'Natasha Frazier' },\n" +
        "      { id: 11, name: 'Lynnette Key' },\n" +
        "      { id: 12, name: 'Linda Mclaughlin' },\n" +
        "      { id: 13, name: 'Harrison Martinez' },\n" +
        "      { id: 14, name: 'Tameka Hebert' },\n" +
        "      { id: 15, name: 'Gena Farley' },\n" +
        "      { id: 16, name: 'Conley Walsh' },\n" +
        "      { id: 17, name: 'Suarez Norman' },\n" +
        "      { id: 18, name: 'Susana Pitts' },\n" +
        "      { id: 19, name: 'Peck Hester' }\n" +
        '    ]\n' +
        '  },\n' +
        '  {\n' +
        "    guid: '904c2f38-071c-4b97-b968-f5c228aaf41a', isActive: false,\n" +
        "    age: 34, email: 'peckhester@medalert.com',\n" +
        "    phone: '+1 (848) 599-3447',\n" +
        "    address: '323 Legion Street, Caspar, Delaware, 4117',\n" +
        "    registered: new Date('1981-03-10T17:02:53Z'), latitude: -55.321712,\n" +
        '    longitude: -100.276818,\n' +
        "    tags: [ 'Lorem', 'laboris', 'enim', 'anim', 'sint', 'incididunt', 'labore' ],\n" +
        '    friends: [\n' +
        "      { id: 0, name: 'Patterson Meadows' },\n" +
        "      { id: 1, name: 'Velasquez Joseph' },\n" +
        "      { id: 2, name: 'Horn Harrison' },\n" +
        "      { id: 3, name: 'Young Mooney' },\n" +
        "      { id: 4, name: 'Barbara Lynn' },\n" +
        "      { id: 5, name: 'Sharpe Downs' }\n" +
        '    ],\n' +
        '    circular: { self: [Circular] },\n' +
        '    this: {\n' +
        '      is: {\n' +
        "        deeply: { nested: ..., string: 'should be shown', list: ... },\n" +
        '        list: [ 1, 2, 3 ]\n' +
        '      }\n' +
        '    }\n' +
        '  }\n' +
        ']'
    );

    const clonedExpect = expect.clone();
    clonedExpect.output.preferredWidth = 200;
    expect(
      clonedExpect.inspect(data, 5).toString(),
      'to equal',
      '[\n' +
        '  {\n' +
        "    guid: 'db550c87-1680-462a-bacc-655cecdd8907', isActive: false, age: 38, email: 'huntterry@medalert.com', phone: '+1 (803) 472-3209', address: '944 Milton Street, Madrid, Ohio, 1336',\n" +
        "    about: 'Ea consequat nulla duis incididunt ut irureirure cupidatat. Est tempor cillum commodo aliquaconsequat esse commodo. Culpa ipsum eu consectetur idenim quis sint. Aliqua deserunt dolore reprehenderitid anim exercitation laboris. Eiusmod aute consecteturexcepteur in nulla proident occaecatconsectetur.\\r\\n',\n" +
        "    registered: new Date('1984-06-03T09:36:47Z'), latitude: 8.635553, longitude: -103.382498, tags: [ 'tempor', 'dolore', 'non', 'sit', 'minim', 'aute', 'non' ],\n" +
        '    friends: [\n' +
        "      { id: 0, name: 'Jeanne Hyde' },\n" +
        "      { id: 1, name: 'Chavez Parker' },\n" +
        "      { id: 2, name: 'Orr Rogers' },\n" +
        "      { id: 3, name: 'Etta Glover' },\n" +
        "      { id: 4, name: 'Glenna Aguirre' },\n" +
        "      { id: 5, name: 'Erika England' },\n" +
        "      { id: 6, name: 'Casandra Stanton' },\n" +
        "      { id: 7, name: 'Hooper Cobb' },\n" +
        "      { id: 8, name: 'Gates Todd' },\n" +
        "      { id: 9, name: 'Lesa Chase' },\n" +
        "      { id: 10, name: 'Natasha Frazier' },\n" +
        "      { id: 11, name: 'Lynnette Key' },\n" +
        "      { id: 12, name: 'Linda Mclaughlin' },\n" +
        "      { id: 13, name: 'Harrison Martinez' },\n" +
        "      { id: 14, name: 'Tameka Hebert' },\n" +
        "      { id: 15, name: 'Gena Farley' },\n" +
        "      { id: 16, name: 'Conley Walsh' },\n" +
        "      { id: 17, name: 'Suarez Norman' },\n" +
        "      { id: 18, name: 'Susana Pitts' },\n" +
        "      { id: 19, name: 'Peck Hester' }\n" +
        '    ]\n' +
        '  },\n' +
        '  {\n' +
        "    guid: '904c2f38-071c-4b97-b968-f5c228aaf41a', isActive: false, age: 34, email: 'peckhester@medalert.com', phone: '+1 (848) 599-3447', address: '323 Legion Street, Caspar, Delaware, 4117',\n" +
        "    registered: new Date('1981-03-10T17:02:53Z'), latitude: -55.321712, longitude: -100.276818, tags: [ 'Lorem', 'laboris', 'enim', 'anim', 'sint', 'incididunt', 'labore' ],\n" +
        '    friends: [\n' +
        "      { id: 0, name: 'Patterson Meadows' },\n" +
        "      { id: 1, name: 'Velasquez Joseph' },\n" +
        "      { id: 2, name: 'Horn Harrison' },\n" +
        "      { id: 3, name: 'Young Mooney' },\n" +
        "      { id: 4, name: 'Barbara Lynn' },\n" +
        "      { id: 5, name: 'Sharpe Downs' }\n" +
        '    ],\n' +
        "    circular: { self: [Circular] }, this: { is: { deeply: { nested: ..., string: 'should be shown', list: ... }, list: [ 1, 2, 3 ] } }\n" +
        '  }\n' +
        ']'
    );
  });

  it('should inspect an arguments object differently from an array', () => {
    let args;
    (function () {
      args = arguments;
    })('a', 123);
    expect(args, 'to inspect as', "arguments( 'a', 123 )");
  });

  it('should output the body of a function', () => {
    expect(
      /* eslint-disable no-var */
      function () {
        var foo = 'bar';
        var quux = 'baz';
        while (foo) {
          foo = foo.substr(0, foo.length - 1);
        }
        return quux;
      },
      /* eslint-enable no-var */
      'to inspect as',
      'function () {\n' +
        "  var foo = 'bar';\n" +
        "  var quux = 'baz';\n" +
        '  while (foo) {\n' +
        '    foo = foo.substr(0, foo.length - 1);\n' +
        '  }\n' +
        '  return quux;\n' +
        '}'
    );
  });

  if (typeof Uint8Array !== 'undefined') {
    it('should render a hex dump for an Uint8Array instance', () => {
      expect(
        new Uint8Array([
          0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20,
          0x74, 0x68, 0x65, 0x20, 0x74, 0x68, 0x69, 0x6e, 0x67, 0x20, 0x49,
          0x20, 0x77, 0x61, 0x73, 0x20, 0x74, 0x61, 0x6c, 0x6b, 0x69, 0x6e,
          0x67, 0x20, 0x61, 0x62, 0x6f, 0x75, 0x74,
        ]),
        'to inspect as',
        'Uint8Array([0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74 /* 24 more */ ])'
      );
    });
  }

  /* eslint-disable no-multi-str, no-var */
  function multilineStringLiteral() {
    var foo = 'bar';
    var quux = 'baz\
      blah';
    foo = foo + quux;
    return foo;
  }
  /* eslint-enable no-multi-str, no-var */

  it('should bail out of removing the indentation of functions that use multiline string literals', () => {
    expect(
      multilineStringLiteral,
      'to inspect as',
      'function multilineStringLiteral() {\n' +
        "    var foo = 'bar';\n" +
        "    var quux = 'baz\\\n" +
        "      blah';\n" +
        '    foo = foo + quux;\n' +
        '    return foo;\n' +
        '}'
    );
  });

  it('should bail out of removing the indentation of one-liner functions', () => {
    expect(
      // prettier-ignore
      /* eslint-disable no-var */
      function() { var foo = 123;return foo; },
      /* eslint-enable no-var */
      'to inspect as',
      'function () { var foo = 123;return foo; }'
    );
  });

  it('should not show the body of a function with native code', () => {
    expect(
      Array.prototype.slice,
      'to inspect as',
      'function slice() { /* native code */ }'
    );
  });

  it('should not inspect a recurring object as [Circular]', () => {
    const a = { foo: 'bar' };
    const b = { c: a, d: a };
    expect(b, 'to inspect as', "{ c: { foo: 'bar' }, d: { foo: 'bar' } }");
  });
});
