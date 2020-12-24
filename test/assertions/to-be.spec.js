/* global expect */
describe('to be assertion', () => {
  it('assert === equality', () => {
    const obj = {};
    expect(obj).toBe(obj);
    expect(obj).notToBe({});
    expect(1).toBe(1);
    expect(1).notToBe(true);
    expect('1').notToBe(1);
    expect(null).notToBe(undefined);
    expect(null).toBeNull();
    expect(0).notToBeNull();
    expect(undefined).notToBeNull();
    expect(true).toBeTrue();
    expect(false).notToBeTrue();
    expect(false).toBeFalse();
    expect(true).notToBeFalse();
    expect(undefined).notToBeDefined();
    expect(undefined).toBeUndefined();
    expect(false).toBeDefined();
    expect({}).toBeDefined();
    expect('').toBeDefined();
  });

  it('NaN as equal to NaN', () => {
    expect(NaN).toBe(NaN);
  });

  it('considers negative zero not to be zero', () => {
    expect(-0).notToBe(0);
  });

  it('considers negative zero to be itself', () => {
    expect(-0).toBe(-0);
  });

  it('considers zero to be itself', () => {
    expect(0).toBe(0);
  });

  if (typeof Buffer !== 'undefined') {
    it('asserts === equality for Buffers', () => {
      const buffer = Buffer.from([0x45, 0x59]);
      expect(buffer).toBe(buffer);
    });
  }

  if (typeof Uint8Array !== 'undefined') {
    it('asserts === equality for Uint8Array', () => {
      const uint8Array = new Uint8Array([0x45, 0x59]);
      expect(uint8Array).toBe(uint8Array);
    });
  }

  describe('on strings', () => {
    it('throws when the assertion fails', () => {
      expect(function () {
        expect('foo').toBe('bar');
      }).toThrowException(
        "expected 'foo' to be 'bar'\n" + '\n' + '-foo\n' + '+bar'
      );

      expect(function () {
        expect(true).notToBe(true);
      }).toThrowException('expected true not to be true');

      expect(function () {
        expect(undefined).toBeDefined();
      }).toThrowException('expected undefined to be defined');
    });

    it('truncates lines in large diffs', () => {
      const paragraphs = `\
        Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky
        venison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket
        pastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami
        shoulder buffalo boudin pork belly salami spare ribs. Bresaola picanha tri-tip,
        strip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.
        Strip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage
        bresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto
        short ribs, biltong boudin sausage turkey.

        Pork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine
        beef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,
        frankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.
        Pig ground round turducken, prosciutto pastrami ribeye pork ham hock beef
        meatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip
        steak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage
        boudin meatball chuck.`.replace(/^ {8}/gm, '');

      const modifiedParagraphs = `\
        Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky
        venison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket
        pastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami
        shoulder buffalo boudin salami spare ribs. Bresaola picanha tri-tip,
        strip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.
        Strip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage
        bresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto
        short ribs, biltong boudin sausage turkey.

        Pork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine
        beef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,
        frankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.
        Pig ground round turducken, pastrami prosciutto ribeye pork ham hock beef
        meatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip
        steak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage
        boudin meatball chuck.`.replace(/^ {8}/gm, '');

      const expectedOutput = `\
        expected 'Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky\\nvenison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket\\npastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami\\nshoulder buffalo boudin salami spare ribs. Bresaola picanha tri-tip,\\nstrip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.\\nStrip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage\\nbresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto\\nshort ribs, biltong boudin sausage turkey.\\n\\nPork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine\\nbeef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,\\nfrankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.\\nPig ground round turducken, pastrami prosciutto ribeye pork ham hock beef\\nmeatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip\\nsteak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage\\nboudin meatball chuck.'
        to equal 'Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky\\nvenison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket\\npastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami\\nshoulder buffalo boudin pork belly salami spare ribs. Bresaola picanha tri-tip,\\nstrip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.\\nStrip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage\\nbresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto\\nshort ribs, biltong boudin sausage turkey.\\n\\nPork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine\\nbeef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,\\nfrankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.\\nPig ground round turducken, prosciutto pastrami ribeye pork ham hock beef\\nmeatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip\\nsteak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage\\nboudin meatball chuck.'

         Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky
         venison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket
         pastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami
        -shoulder buffalo boudin salami spare ribs. Bresaola picanha tri-tip,
        +shoulder buffalo boudin pork belly salami spare ribs. Bresaola picanha tri-tip,
         strip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.
         Strip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage
         bresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto
        ... 2 lines omitted ...
         Pork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine
         beef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,
         frankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.
        -Pig ground round turducken, pastrami prosciutto ribeye pork ham hock beef
        +Pig ground round turducken, prosciutto pastrami ribeye pork ham hock beef
         meatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip
         steak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage
         boudin meatball chuck.`.replace(/^ {8}/gm, '');

      expect(() => {
        expect(modifiedParagraphs).toEqual(paragraphs);
      }).toThrow(expectedOutput);
    });

    // These would be annoying to look at
    it('does not produce ... 1 lines omitted ... lines', () => {
      expect(() =>
        expect('a\nb\nc\nd\ne\nf\ng\nh\ni\nj\nk\nl\nm\nn\no\np\nq\n').toEqual(
          'a\nb\nc\nd\nf\ng\nh\ni\nj\nk\nl\nn\no\np\nq\n'
        )
      ).toThrow(
        "expected 'a\\nb\\nc\\nd\\ne\\nf\\ng\\nh\\ni\\nj\\nk\\nl\\nm\\nn\\no\\np\\nq\\n'\n" +
          "to equal 'a\\nb\\nc\\nd\\nf\\ng\\nh\\ni\\nj\\nk\\nl\\nn\\no\\np\\nq\\n'\n" +
          '\n' +
          ' a\n' +
          ' b\n' +
          ' c\n' +
          ' d\n' +
          '-e\n' +
          ' f\n' +
          ' g\n' +
          ' h\n' +
          ' i\n' +
          ' j\n' +
          ' k\n' +
          ' l\n' +
          '-m\n' +
          ' n\n' +
          ' o\n' +
          ' p\n' +
          ' q\n'
      );
    });

    it('truncates lines in large in the start and end', () => {
      const paragraphs = `\
        Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky
        venison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket
        pastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami
        shoulder buffalo boudin pork belly salami spare ribs. Bresaola picanha tri-tip,
        strip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.
        Strip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage
        bresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto
        short ribs, biltong boudin sausage turkey.

        Pork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine
        beef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,
        frankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.
        Pig ground round turducken, prosciutto pastrami ribeye pork ham hock beef
        meatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip
        steak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage
        boudin meatball chuck.`.replace(/^ {8}/gm, '');

      const modifiedParagraphs = `\
        Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky
        venison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket
        pastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami
        shoulder buffalo boudin pork belly salami spare ribs. Bresaola picanha tri-tip,
        strip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.
        Strip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage
        bresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto
        short ribs, biltong sausage boudin turkey.

        Pork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine
        beef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,
        frankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.
        Pig ground round turducken, prosciutto pastrami ribeye pork ham hock beef
        meatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip
        steak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage
        boudin meatball chuck.`.replace(/^ {8}/gm, '');

      const expectedOutput = `\
        expected 'Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky\\nvenison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket\\npastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami\\nshoulder buffalo boudin pork belly salami spare ribs. Bresaola picanha tri-tip,\\nstrip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.\\nStrip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage\\nbresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto\\nshort ribs, biltong sausage boudin turkey.\\n\\nPork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine\\nbeef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,\\nfrankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.\\nPig ground round turducken, prosciutto pastrami ribeye pork ham hock beef\\nmeatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip\\nsteak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage\\nboudin meatball chuck.'
        to equal 'Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky\\nvenison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket\\npastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami\\nshoulder buffalo boudin pork belly salami spare ribs. Bresaola picanha tri-tip,\\nstrip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.\\nStrip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage\\nbresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto\\nshort ribs, biltong boudin sausage turkey.\\n\\nPork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine\\nbeef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,\\nfrankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.\\nPig ground round turducken, prosciutto pastrami ribeye pork ham hock beef\\nmeatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip\\nsteak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage\\nboudin meatball chuck.'

        ... 4 lines omitted ...
         strip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.
         Strip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage
         bresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto
        -short ribs, biltong sausage boudin turkey.
        +short ribs, biltong boudin sausage turkey.
         
         Pork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine
         beef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,
        ... 5 lines omitted ...`.replace(/^ {8}/gm, '');

      expect(() => {
        expect(modifiedParagraphs).toEqual(paragraphs);
      }).toThrow(expectedOutput);
    });

    it('does not provide a diff when comparing against undefined', () => {
      expect(function () {
        expect('blabla').toBeUndefined();
      }).toThrow("expected 'blabla' to be undefined");
    });
  });
});
