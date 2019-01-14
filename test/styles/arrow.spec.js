/* global expect */
describe('arrow', () => {
  it('should render an arrow with the given dimensions', () => {
    expect(
      expect
        .createOutput('text')
        .arrow({ width: 4, height: 5, direction: 'down' })
        .toString(),
      'to equal',
      '┌───\n' + '│\n' + '│\n' + '│\n' + '└──▷'
    );
  });

  it('should support top and left coordinates', () => {
    expect(
      expect
        .createOutput('text')
        .arrow({ top: 2, left: 3, width: 4, height: 5, direction: 'down' })
        .toString(),
      'to equal',
      '\n' + '\n' + '   ┌───\n' + '   │\n' + '   │\n' + '   │\n' + '   └──▷'
    );
  });

  it('should render an arrow that points upwards when direction:up is given', () => {
    expect(
      expect
        .createOutput('text')
        .arrow({ width: 4, height: 5, direction: 'up' })
        .toString(),
      'to equal',
      '┌──▷\n' + '│\n' + '│\n' + '│\n' + '└───'
    );
  });
});
