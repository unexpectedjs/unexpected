# expect.freeze()

Prevents further assertions, types, styles, plugins, and themes from being added to the instance.
Once frozen, the [`addAssertion`](../addAssertion/), [`addType`](../addType/),
[`addStyle`](../addStyle/), [`installTheme`](../installTheme/), and [`use`](../use/) methods will
throw an exception.

[Cloning](../clone/) a frozen instance is allowed, and clones will not be frozen initially.
Creating a [child](../child/) is also possible, but the child won't support `exportAssertion`,
`exportType`, and `exportStyle` because the parent `expect` is frozen. This means that some
plugins cannot be installed into the child. To get around that, create a clone first.

The plan is to make the top-level `expect` (the main export of `require('unexpected')`)
frozen as of Unexpected 11. The idea behind that is to help prevent multiple files in a
test suite from affecting each other by forcing each file to create its own isolated clone.
