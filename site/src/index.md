---
template: default.ejs
theme: dark
title: Unexpected.js
---

# Welcome to Unexpected
### The extensible BDD assertion toolkit

```javascript
expect({ text: 'foo!' }, 'to equal', { text: 'f00!' });
```

```output
expected { text: 'foo!' } to equal { text: 'f00!' }

{
  text: 'foo!' // should be 'f00!'
               // -foo!
               // +f00!
}
```
