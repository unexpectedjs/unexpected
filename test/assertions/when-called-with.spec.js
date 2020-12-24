/* global expect */
describe('when called with assertion', () => {
  function add(a, b) {
    return a + b;
  }

  it('should assert that the function invocation produces the correct output', () => {
    expect(add).whenCalledWith([3, 4]).toEqual(7);
  });

  it('should combine with other assertions (showcase)', () => {
    expect(function () {
      expect(add).whenCalledWith([3, 4]).toEqual(9);
    }).toThrow(
      'expected function add(a, b) { return a + b; } when called with 3, 4 to equal 9\n' +
        '  expected 7 to equal 9'
    );
  });

  it('should should provide the result as the fulfillment value if no assertion is provided', () => {
    return expect(add)
      .whenCalledWith([3, 4])
      .then(function (sum) {
        expect(sum).toEqual(7);
      });
  });

  describe('when assertion is executed in context of another object', () => {
    it('should call the function in the context of that object', () => {
      function Greeter(prefix) {
        this.prefix = prefix;
      }

      Greeter.prototype.greet = function (name) {
        return this.prefix + name;
      };

      expect(new Greeter('Hello, ')).toSatisfy({
        greet: expect.whenCalledWith(['John Doe']).toEqual('Hello, John Doe'),
      });
    });
  });
});
