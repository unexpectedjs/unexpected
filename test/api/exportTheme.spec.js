/* global expect */
describe('exportTheme', () => {
  let parentExpect;
  let childExpect;

  beforeEach(() => {
    parentExpect = expect.clone();
    childExpect = parentExpect.child();
  });

  it('is chainable', () => {
    childExpect
      .exportTheme('html', {
        styles: {
          firstStyle: '#E3E3E3'
        }
      })
      .exportTheme('html', {
        styles: {
          secondStyle: '#3E3E3E'
        }
      });

    expect(parentExpect.output.theme('html'), 'to satisfy', {
      styles: {
        firstStyle: '#E3E3E3',
        secondStyle: '#3E3E3E'
      }
    });
  });

  it('makes the style available to the parent expect', () => {
    childExpect.exportTheme('html', {
      styles: {
        error: ['#000000', 'italic']
      }
    });

    expect(
      parentExpect
        .createOutput('html')
        .error('yadda')
        .toString(),
      'to contain',
      '<span style="color: #000000; font-style: italic">yadda</span>'
    );
  });

  it('does not make the style available to a parent parent expect', () => {
    childExpect
      .child()
      .exportTheme('html', { styles: { fancyQuotes: '#333333' } });

    expect(expect.output.theme('html'), 'to satisfy', {
      styles: expect.it('not to have property', 'fancyQuotes')
    });
  });
});
