var expect = require('../');
it('should not dot out the object in the diff', function () {
    expect(function () {
        expect({0: {0: {0: {0: {0: {0: {}}}}}}}, 'to equal', {});
    }, 'to throw',
        "expected { 0: { 0: { 0: { 0: { 0: { 0: ... } } } } } } to equal {}\n" +
        "\n" +
        "{\n" +
        "  0: { 0: { 0: { 0: { 0: { 0: {} } } } } } // should be removed\n" +
        "}"
    );
});
