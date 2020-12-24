/* global expect */
describe('merge', () => {
  it('should overlay a pen on top of another', () => {
    const pen = expect.createOutput('text');
    pen.text('abc').nl().text('def');
    const anotherPen = pen.clone().text(' h').nl().text('i');
    expect(pen.clone().merge([pen, anotherPen]).toString()).toEqual(
      'ahc\n' + 'ief'
    );
  });

  it('should result in a wider pen when merging a wide pen on top of a slim one', () => {
    const pen = expect.createOutput('text');
    pen.text('a').nl().text('b');
    const anotherPen = pen.clone().text('c').nl().text('  d');
    expect(pen.clone().merge([pen, anotherPen]).toString()).toEqual(
      'c\n' + 'b d'
    );
  });
});
