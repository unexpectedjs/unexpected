## expect.withError(function () { ... }, function (err) {})

In some situations you want to modify an error thrown from
unexpected. This method handles all the details for you.

Notice that this method is only available inside
[expect.addAssertion](/api/addAssertion).

The standard case is to attach a diff or change the error message of
an error being thrown.

```js
function Person(options) {
  this.name = options.name;
  this.gender = options.gender;
}

Person.prototype.genderSign = function () {
  switch (this.gender) {
  case 'female': return '♀';
  case 'male': return '♂';
  default: return '⚧';
  }
};

expect.addAssertion('to have same gender as', function (expect, subject, value) {
  expect.withError(function () {
    expect(subject.gender, 'to be', value.gender);
  }, function (e) {
    expect.fail({
      diff: function (output) {
        return {
          inline: false,
          diff: output.bold(subject.genderSign()).text(' ≠ ').bold(value.genderSign())
        };
      }
    });
  });
});

expect(new Person({ name: 'John Doe', gender: 'male' }),
       'to have same gender as',
       new Person({ name: 'Jane Doe', gender: 'female' }));
```

```output
expected Person({ name: 'John Doe', gender: 'male' }) to have same gender as Person({ name: 'Jane Doe', gender: 'female' })

♂ ≠ ♀
```

The method also supports asynchronous assertion the following way:

```js#evaluate:false
expect.addAssertion('delegating to an asynchronous assertion', function (expect, subject) {
  return expect.withError(function () {
    return expect(subject, 'asynchronous expectation');
  }, function (e) {
    expect.fail({
      diff: function (output) {
        return {
          inline: true,
          diff: output.text('Cool a diff attached to an asynchronous failure!')
        };
      }
    });
  });
});
```
