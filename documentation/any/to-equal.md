Asserts deep equality.

<!-- evaluate -->
```javascript
expect({ a: 'b' }, 'to equal', { a: 'b' });
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

The assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(1, 'not to equal', '1');
expect({ one: 1 }, 'not to equal', { one: '1' });
expect(null, 'not to equal', '1');
var now = new Date();
var later = new Date(now.getTime() + 42);
expect(now, 'not to equal', later);
expect({ time: now }, 'not to equal', { time: later });
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({ a: { b: 'd'} }, 'not to equal', { a: { b: 'd'} });
```

```
expected { a: { b: 'd' } } not to equal { a: { b: 'd' } }
```
<!-- /evaluate -->
