/* global expect */
describe('annotationBlock', () => {
  it('should render an empty block', () => {
    expect(
      expect
        .createOutput('text')
        .annotationBlock(function () {})
        .toString()
    ).toEqual('// ');
  });
});
