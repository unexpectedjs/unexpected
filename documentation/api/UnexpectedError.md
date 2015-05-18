When assertions fails in Unexpected they yield an
`UnexpectedError`. This instance has several convenience methods for
retrieving information about the error.

### getErrorMessage()

Returns the error message as a
[magicpen](https://github.com/sunesimonsen/magicpen) instance. The
method uses the assertion error modes to produce the correct
error message.

### parent

When assertions delegate to nested `expect` calls the errors that are
thrown on each level are chained together through the `parent`
property.
