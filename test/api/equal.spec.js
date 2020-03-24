/* global expect */
if (Object.defineProperty) {
  describe('equal', () => {
    function Field(val, options) {
      var value = val;
      var propertyDescription = {
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

    it('handles getters and setters correctly', () => {
      expect(
        new Field('VALUE', 'getter'),
        'to equal',
        new Field('VALUE', 'getter')
      );
      expect(
        new Field('VALUE', 'setter'),
        'to equal',
        new Field('VALUE', 'setter')
      );
      expect(
        new Field('VALUE', 'getter and setter'),
        'to equal',
        new Field('VALUE', 'getter and setter')
      );
    });
  });
}
