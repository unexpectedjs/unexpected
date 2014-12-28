Asserts deep equality.

<!-- evaluate -->
```javascript
expect({ a: 'b' }, 'to equal', { a: 'b' });
expect(1, 'not to equal', '1');
expect({ one: 1 }, 'not to equal', { one: '1' });
expect(null, 'not to equal', '1');
var now = new Date();
expect(now, 'to equal', now);
expect(now, 'to equal', new Date(now.getTime()));
expect({ now: now }, 'to equal', { now: now });
```
<!-- /evaluate -->

I case of a failing expectation you get a nice object diff when
comparing object.

<!-- evaluate -->
```javascript
expect({ a: { b: 'c'} }, 'to equal', { a: { b: 'd'} });
```

```
expected { a: { b: 'c' } } to equal { a: { b: 'd' } }

{
  a: {
    b: 'c' // should be 'd'
           // -c
           // +d
  }
}
```
<!-- /evaluate -->
