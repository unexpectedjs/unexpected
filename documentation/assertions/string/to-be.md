Asserts `===` equality.

```js
expect('Hello', 'to be', 'Hello');
```

In case of a failing expectation you get the following output:

```js
expect('Hello beautiful!', 'to be', 'Hello world!');
```

```output
expected 'Hello beautiful!' to be 'Hello world!'

-Hello beautiful!
+Hello world!
```

This assertion can be negated using the `not` flag:

```js
expect('Hello', 'not to be', 'Hello world!');
expect('1', 'not to be', 1);
```

In case of a failing expectation you get the following output:

```js
expect('Hello world!', 'not to be', 'Hello world!');
```

```output
expected 'Hello world!' not to be 'Hello world!'
```

If you compare large strings, we truncate the similar parts:

```js
const text = `\
Bacon ipsum amet tri-tip kielbasa kevin spare RIBS. Sirloin chuck jerky
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
Pig ground round turducken, pastrami prosciutto ribeye pork ham hock beef
meatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip
steak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage
boudin meatball chuck.`;

const expectedText = `\
Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky
venison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket
pastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami
shoulder buffalo boudin pork belly salami spare ribs. Bresaola picanha tri-tip,
strip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.
Strip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage
bresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto
short ribs, biltong boudin sausage turkey.

Pork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine
beef ribs. Prosciutto boudin pancetta ribs beef short loin porchetta pastrami,
frankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.
Pig ground round turducken, pastrami prosciutto ribeye pork ham hock beef
meatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip
steak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage
boudin meatball chuck.`;

expect(text, 'to be', expectedText);
```

<!-- prettier-ignore -->
```output
expected 'Bacon ipsum amet tri-tip kielbasa kevin spare RIBS. Sirloin chuck jerky\nvenison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket\npastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami\nshoulder buffalo boudin pork belly salami spare ribs. Bresaola picanha tri-tip,\nstrip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.\nStrip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage\nbresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto\nshort ribs, biltong boudin sausage turkey.\n\nPork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine\nbeef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,\nfrankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.\nPig ground round turducken, pastrami prosciutto ribeye pork ham hock beef\nmeatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip\nsteak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage\nboudin meatball chuck.'
to be 'Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky\nvenison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket\npastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami\nshoulder buffalo boudin pork belly salami spare ribs. Bresaola picanha tri-tip,\nstrip steak swine short loin rump corned beef doner chuck sirloin burgdoggen.\nStrip steak fatback frankfurter salami pastrami short ribs spare ribs, sausage\nbresaola porchetta turducken shoulder brisket. Tri-tip beef ribs prosciutto\nshort ribs, biltong boudin sausage turkey.\n\nPork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine\nbeef ribs. Prosciutto boudin pancetta ribs beef short loin porchetta pastrami,\nfrankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.\nPig ground round turducken, pastrami prosciutto ribeye pork ham hock beef\nmeatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip\nsteak pastrami ham hock beef spare ribs shank kevin bacon. Pork loin sausage\nboudin meatball chuck.'

-Bacon ipsum amet tri-tip kielbasa kevin spare RIBS. Sirloin chuck jerky
+Bacon ipsum dolor amet tri-tip kielbasa kevin spare ribs. Sirloin chuck jerky
 venison leberkas. T-bone alcatra short loin short ribs spare ribs rump, brisket
 pastrami frankfurter corned beef kielbasa fatback cupim andouille. Pastrami
 shoulder buffalo boudin pork belly salami spare ribs. Bresaola picanha tri-tip,
... 3 lines omitted ...
 short ribs, biltong boudin sausage turkey.
 
 Pork chop venison beef ribs leberkas pork filet mignon. Boudin leberkas swine
-beef ribs. Prosciutto boudin pancetta beef ribs short loin porchetta pastrami,
+beef ribs. Prosciutto boudin pancetta ribs beef short loin porchetta pastrami,
 frankfurter corned beef. Leberkas buffalo alcatra, chuck pancetta sirloin pig.
 Pig ground round turducken, pastrami prosciutto ribeye pork ham hock beef
 meatloaf turkey kielbasa. Tenderloin porchetta biltong burgdoggen sirloin, strip
... 2 lines omitted ...
```
