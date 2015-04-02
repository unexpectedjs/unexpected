## Types

Unexpected comes with a type system that is used to explain how
different types are compared, diffed, inspected and is also used to
limit the scope of assertions.

The following types are provided by out of the box by Unexpected:
`any`, `arguments`, `array`, `array-like`, `binaryArray`, `boolean`,
`Buffer`, `date`, `Error`, `function`, `Int8Array`, `Int16Array`,
`Int32Array`, `NaN`, `null`, `number`, `object`, `regexp`, `string`,
`Uint8Array`, `Uint16Array`, `Uint32Array`, and `undefined`.

### expect.addType(typeDefinition)

Unexpected can be extended with knowledge about new types by calling
the `addType` method with a type definition. The type definition must
implement the required parts of the following interface:

Required members:

* __name__: `String` - the name of the type.
* __identify__: `boolean function(value)` - a function deciding if the type
  should be used for the given value.

Note that your type has the option to take precedence over all the built-in
types. Test subjects will be tested against the most recently defined type
first, so `identify` functions should take care not to break with `undefined`,
`null` and so on.

Optional members:

* __base__: `String` - the name of the base type. Defaults to `any`.
* __equal__: `boolean function(a, b, equal)` -
  a function capable of comparing two values of this type for
  equality. If not specified it is inherited from the base type.
* __inspect__: `function(value, depth, output, inspect)` -
  a function capable of inspecting a value of this type. If not
  specified it is inherited from the base type.
* __diff__: `comparison function(actual, expected, output, diff, inspect)` -
  a function producing a comparison between two values of this
  type. If not specified it is inherited from the base type.

### Example

Adding new types to the system is best explained by an example. Let's
say we wanted to add first class support for a `Person` type:

```javascript
function Person(name, age) {
    this.name = name;
    this.age = age;
}
```

We start out by creating a basic type for handling `Person`
instances. The name of the type should be `Person` and it should
inherit from the built-in `object` type. Furthermore we add an
`identify` method that will recognize `Person` instances.

```javascript
expect.addType({
    name: 'Person',
    base: 'object',
    identify: function (value) {
        return value instanceof Person;
    }
});
```

When you specify a base type, you inherit the optional members you
didn't implement. In this case we inherited the methods `equal`,
`inspect` and `diff` from the `object` type.

Imagine that we make a failing expectation on a `Person` instance:

```javascript
expect(new Person('John Doe', 42), 'to equal', new Person('Jane Doe', 24));
```

```output
expected Person({ name: 'John Doe', age: 42 }) to equal Person({ name: 'Jane Doe', age: 24 })

Person({
  name: 'John Doe', // should equal 'Jane Doe'
                    // -John Doe
                    // +Jane Doe
  age: 42 // should equal 24
})
```

That is already quite helpful, but it would be even nicer if the
stringification of `Person` instances could read as valid calls to the
constructor. We can fix that by implementing an `inspect` method on the type.

```javascript
expect.addType({
    name: 'Person',
    base: 'object',
    identify: function (value) {
        return value instanceof Person;
    },
    inspect: function (person, depth, output, inspect) {
       output.text('new Person(')
             .append(inspect(person.name, depth))
             .text(', ')
             .append(inspect(person.age, depth))
             .text(')');
    }
});
```

Now we get the following output:

```javascript
expect(new Person('John Doe', 42), 'to equal', new Person('Jane Doe', 24));
```

```output
expected new Person('John Doe', 42) to equal new Person('Jane Doe', 24)

Person({
  name: 'John Doe', // should equal 'Jane Doe'
                    // -John Doe
                    // +Jane Doe
  age: 42 // should equal 24
})
```

That is a bit better, let me explain how it works. The `inspect`
method is called with the value to be inspected, the depth this type
should be inspected with, an output the inspected value should be
written to, and an inspect function that can be used to recursively
inspect members. The output is an instance of
[magicpen](https://github.com/unexpectedjs/magicpen) extended with a
number of [styles](https://github.com/unexpectedjs/unexpected/blob/master/lib/styles.js).

We write `new Person(` without styling, then we append the inspected
`name`, write a `, `, inspect the `age` and finish with the closing
parenthesis. When `inspect` is called without a depth parameter it
defaults to `depth-1`. Values inspected with depth zero will be
inspected as `...`. In this case we always want the name so we forward the
same depth to the `inspect` function.

Let's say we wanted `Person` instances only to be compared by name and not by
age. Then we need to override the `equal` method:

```javascript
expect.addType({
    name: 'Person',
    base: 'object',
    identify: function (value) {
        return value instanceof Person;
    },
    inspect: function (person, depth, output, inspect) {
       output.text('new Person(')
             .append(inspect(person.name, depth))
             .text(', ')
             .append(inspect(person.age, depth))
             .text(')');
    },
    equal: function (a, b, equal) {
        return a === b || equal(a.name, b.name);
    }
});
```

This will produce the same output as above, but that means the diff if
wrong. It states that the age should be changed. We can fix that the
following way:

```javascript
expect.addType({
    name: 'Person',
    base: 'object',
    identify: function (value) {
        return value instanceof Person;
    },
    inspect: function (person, depth, output, inspect) {
       output.text('new Person(')
             .append(inspect(person.name, depth))
             .text(', ')
             .append(inspect(person.age, depth))
             .text(')');
    },
    equal: function (a, b, equal) {
        return a === b || equal(a.name, b.name);
    },
    diff: function (actual, expected, output, diff, inspect) {
        return this.baseType.diff({name: actual.name}, {name: expected.name});
    }
});
```

```javascript
expect(new Person('John Doe', 42), 'to equal', new Person('Jane Doe', 24));
```

```output
expected new Person('John Doe', 42) to equal new Person('Jane Doe', 24)

{
  name: 'John Doe' // should equal 'Jane Doe'
                   // -John Doe
                   // +Jane Doe
}
```

The above `diff` method just calls the `diff` method on the base type
with objects that only contain the name. The `object` diff will take
care of all the hard work. We could also have called the `diff`
function we got as an argument, but that will go off detecting the
types of the parameters, therefore it is faster to call `diff` method
on the base directly when you know it is the one you need.

You could also do something really custom as seen below:

```javascript
var inlineDiff = true; // used to change inlining in a later example

expect.addType({
    name: 'Person',
    base: 'object',
    identify: function (value) {
        return value instanceof Person;
    },
    inspect: function (person, depth, output, inspect) {
       output.text('new Person(')
             .append(inspect(person.name, depth))
             .text(', ')
             .append(inspect(person.age, depth))
             .text(')');
    },
    equal: function (a, b, equal) {
        return a === b || equal(a.name, b.name);
    },
    diff: function (actual, expected, output, diff, inspect) {
        var nameDiff = diff(actual.name, expected.name);

        output.text('new Person(')
              .nl()
              .indentLines();

        if (nameDiff && nameDiff.inline) {
            output.append(nameDiff.diff);
        } else {
            output.i().append(inspect(actual.name)).text(',').sp()
                  .annotationBlock(function () {
                      this.error('should be ').append(inspect(expected.name));
                      if (nameDiff) {
                          this.nl().append(nameDiff.diff);
                      }
                  })
                  .nl();
        }

        output.i().append(inspect(actual.age))
              .outdentLines()
              .nl()
              .text(')');

        return {
            inline: inlineDiff,
            diff: output
        };
    }
});
```

That would produce the following output.

```javascript
expect(new Person('John Doe', 42), 'to equal', new Person('Jane Doe', 24));
```

```output
expected new Person('John Doe', 42) to equal new Person('Jane Doe', 24)

new Person(
  'John Doe', // should be 'Jane Doe'
              // -John Doe
              // +Jane Doe
  42
)
```

This is a rather complicated example and I won't go though the details,
but I would like to comment on the `inline` flag. When we diff objects
against each other, the values of the keys will be diffed against each
other. That means diffs are inserted into the containing
structure. You can control this behavior using the `inline` flag. If
the child diff is inline, it means that it will be appended directly
into the parent; otherwise the diff will be inserted in an annotation
block. The outputs below shows the contrast between setting the
`Person` diff to inline or not.

```javascript
inlineDiff = true;
expect(
  {'John Doe': new Person('John Doe', 42), 'Jane Doe': new Person('Janie Doe', 24)},
  'to equal',
  {'John Doe': new Person('John Doe', 42), 'Jane Doe': new Person('Jane Doe', 24)}
);
```

```output
expected
{
  'John Doe': new Person('John Doe', 42),
  'Jane Doe': new Person('Janie Doe', 24)
}
to equal
{
  'John Doe': new Person('John Doe', 42),
  'Jane Doe': new Person('Jane Doe', 24)
}

{
  'John Doe': new Person('John Doe', 42),
  'Jane Doe': new Person(
    'Janie Doe', // should be 'Jane Doe'
                 // -Janie Doe
                 // +Jane Doe
    24
  )
}
```

```javascript
inlineDiff = false;
expect(
  {'John Doe': new Person('John Doe', 42), 'Jane Doe': new Person('Janie Doe', 24)},
  'to equal',
  {'John Doe': new Person('John Doe', 42), 'Jane Doe': new Person('Jane Doe', 24)}
);
```

```output
expected
{
  'John Doe': new Person('John Doe', 42),
  'Jane Doe': new Person('Janie Doe', 24)
}
to equal
{
  'John Doe': new Person('John Doe', 42),
  'Jane Doe': new Person('Jane Doe', 24)
}

{
  'John Doe': new Person('John Doe', 42),
  'Jane Doe': new Person('Janie Doe', 24) // should equal new Person('Jane Doe', 24)
                                          // new Person(
                                          //   'Janie Doe', // should be 'Jane Doe'
                                          //                // -Janie Doe
                                          //                // +Jane Doe
                                          //   24
                                          // )
}
```

Now that we have implemented a type, we can start adding assertions to
it. These assertions will only work on this type or types inheriting
from the type.

```javascript
expect.addAssertion('Person', 'to be above legal age', function (expect, subject) {
    expect(subject.age, 'to be greater than or equal to', 18);
});

expect(new Person('Jane Doe', 24), 'to be above legal age');
```

Because `Person` inherits from `object` you can use all assertion
defined for `object` or any of its ancestors. Here is an example:

```javascript
expect(new Person('Jane Doe', 24), 'to have keys', 'name', 'age');
expect(new Person('Jane Doe', 24), 'to satisfy', {
    name: expect.it('to be a string').and('not to be empty'),
    age: expect.it('to be a number').and('not to be negative')
});
```

The best resource for learning more about custom types is to look at
how the predefined types are built:

[lib/types.js](https://github.com/unexpectedjs/unexpected/blob/master/lib/types.js)
