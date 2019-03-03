class Context {
  constructor(expect) {
    this.expect = expect;
    this.level = 0;
  }

  child() {
    const child = Object.create(this);
    child.level++;
    return child;
  }
}

module.exports = Context;
