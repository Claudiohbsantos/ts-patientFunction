# Patient Functions - "Currying" object parameters

## The oneliner

Partially apply object receiving functions indefinitely until all required properties are provided without losing type information.

## The short version

This repo shares one way to build and type functions that receive an object type parameter so that calls to the function with partials of it's parameter will recursively return functions that require the missing parameter fields until all required fields are received, at which point the function is executed.

```typescript
import * as t from 'io-ts';

// Given an io-ts codec describing the parameter
type Param = t.TypeOf<typeof Param>;
const Param = t.type({
  a: t.string,
  b: t.boolean,
  c: t.number,
});

// and a function that takes an object with said parameter type
declare const foo: (i: Param) => number[]

// a "patient" version of the function can be generated so that
const patientFoo = makePatient(Param, foo)

// it can be called normally
const r1: number[] = patientFoo({a:'a', b: true, c: 1})
// or the required properties can be provided in separate calls
const r2: number[] = patientFoo({b: true, c: 1})({a: 'later'})
// regardless of order or how many properties are required by parameter
const r3: number[] = patientFoo({c: 1})({b: true})({a: 'later'})
```

When not all properties are provided, the returned function is typed so that only missing properties are accepted by the function.

```typescript
type NeedsC = (i: Partial<{c: number}>) => number[] 
// `needsC` only accepts an object with the `c` property since `a` and `b` were already given
const needsC: NeedsC  = patientFoo({a: 'a', b: true})

// NOTE: The return type on NeedsC on this example is not technically correct
// (and wouldn't compile). In reality it is a conditional type.
```
