---
template: default.ejs
theme: dark
---

# Welcome to Unexpected
### The extensible BDD assertion toolkit

<!-- evaluate -->
```javascript
expect({ text: 'foo!' }, 'to equal', { text: 'f00!' });
```

```
expected { text: 'foo!' } to equal { text: 'f00!' }

{
  text: 'foo!' // should be 'f00!'
               // -foo!
               // +f00!
}
```
<!-- /evaluate -->
