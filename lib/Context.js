class Context {
  constructor() {
    this.level = 0;
  }

  child() {
    const child = Object.create(this);
    child.level++;
    return child;
  }
}

module.exports = Context;
