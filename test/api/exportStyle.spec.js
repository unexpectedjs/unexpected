/*global expect*/
describe('styleType', () => {
  var parentExpect;
  var childExpect;
  beforeEach(() => {
    parentExpect = expect.clone();
    childExpect = parentExpect.child();
  });

  it('is chainable', () => {
    childExpect
      .exportStyle('firstStyle', function() {})
      .exportStyle('secondStyle', function() {});

    expect(parentExpect.output.firstStyle, 'to be a function');
    expect(parentExpect.output.secondStyle, 'to be a function');
  });

  it('makes the style available to the parent expect', () => {
    childExpect.exportStyle('fancyQuotes', function(text) {
      this.text('>>')
        .text(text)
        .text('<<');
    });

    expect(
      parentExpect
        .createOutput()
        .fancyQuotes('yadda')
        .toString(),
      'to equal',
      '>>yadda<<'
    );
  });

  it('does not make the style available to a parent parent expect', () => {
    childExpect.child().exportStyle('fancyQuotes', function(text) {
      this.text('>>')
        .text(text)
        .text('<<');
    });
    expect(parentExpect.createOutput(), 'to satisfy', {
      fancyQuotes: undefined
    });
  });

  it('binds the style handler to a child expect output so custom types are available inside the exported style', () => {
    childExpect.addStyle('fancyQuotes', function(text) {
      this.text('>>')
        .text(text)
        .text('<<');
    });

    childExpect.exportStyle('emphasize', function(text) {
      this.fancyQuotes(text);
    });

    expect(
      parentExpect
        .createOutput()
        .emphasize('yadda')
        .toString(),
      'to equal',
      '>>yadda<<'
    );
  });
});
