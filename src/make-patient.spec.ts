import { makePatient } from './make-patient';
import * as t from 'io-ts';
import {expectTypeOf} from 'expect-type'

type GreetInput = t.TypeOf<typeof GreetInput>;
const GreetInput = t.type({
  greeting: t.string,
  name: t.string,
  excitedness: t.number,
});

const greet = (i: GreetInput) => `${i.greeting} ${i.name}${'!'.repeat(i.excitedness)}`

describe('required fields', () => {
    it('should generate functions until all fields are provided', () => {
        const pGreet = makePatient(GreetInput, greet)

        expect(typeof pGreet).toEqual('function')

        expect(typeof pGreet({name: 'Claudio', greeting: 'Hello'})).toEqual('function')
        expect(typeof pGreet({name: 'Claudio', excitedness: 2})).toEqual('function')
        expect(typeof pGreet({greeting: 'Hello', excitedness: 2})).toEqual('function')
        expect(typeof pGreet({greeting: 'Hello', name: 'Claudio'})).toEqual('function')
        expect(typeof pGreet({excitedness: 2, greeting: 'Hello'})).toEqual('function')
        expect(typeof pGreet({excitedness: 2, name: 'Claudio'})).toEqual('function')

        expect(typeof pGreet({name: 'Claudio'})({greeting: 'Hello'})).toEqual('function')
        expect(typeof pGreet({name: 'Claudio'})({excitedness: 2})).toEqual('function')
        expect(typeof pGreet({greeting: 'Hello'})({excitedness: 2})).toEqual('function')
        expect(typeof pGreet({greeting: 'Hello'})({name: 'Claudio'})).toEqual('function')
        expect(typeof pGreet({excitedness: 2})({greeting: 'Hello'})).toEqual('function')
        expect(typeof pGreet({excitedness: 2})({name: 'Claudio'})).toEqual('function')
    });

    it('should execute function once all fields are provided', () => {
        const pGreet = makePatient(GreetInput, greet)

        expect(pGreet({name: 'Claudio', greeting: 'Hello', excitedness: 2})).toEqual('Hello Claudio!!')

        expect(pGreet({name: 'Claudio', greeting: 'Hello'})({excitedness: 2})).toEqual('Hello Claudio!!')
        expect(pGreet({name: 'Claudio', excitedness: 2})({greeting: 'Hello'})).toEqual('Hello Claudio!!')
        expect(pGreet({greeting: 'Hello', excitedness: 2})({name: 'Claudio'})).toEqual('Hello Claudio!!')
        expect(pGreet({greeting: 'Hello', name: 'Claudio'})({excitedness: 2})).toEqual('Hello Claudio!!')
        expect(pGreet({excitedness: 2, greeting: 'Hello'})({name: 'Claudio'})).toEqual('Hello Claudio!!')
        expect(pGreet({excitedness: 2, name: 'Claudio'})({greeting: 'Hello'})).toEqual('Hello Claudio!!')

        expect(pGreet({name: 'Claudio'})({greeting: 'Hello'})({excitedness: 2})).toEqual('Hello Claudio!!')
        expect(pGreet({name: 'Claudio'})({excitedness: 2})({greeting: 'Hello'})).toEqual('Hello Claudio!!')
        expect(pGreet({greeting: 'Hello'})({excitedness: 2})({name: 'Claudio'})).toEqual('Hello Claudio!!')
        expect(pGreet({greeting: 'Hello'})({name: 'Claudio'})({excitedness: 2})).toEqual('Hello Claudio!!')
        expect(pGreet({excitedness: 2})({greeting: 'Hello'})({name: 'Claudio'})).toEqual('Hello Claudio!!')
        expect(pGreet({excitedness: 2})({name: 'Claudio'})({greeting: 'Hello'})).toEqual('Hello Claudio!!')
    });
})

type FancyGreetInput = t.TypeOf<typeof FancyGreetInput>
const FancyGreetInput = t.intersection([
    GreetInput,
    t.partial({
        decoration: t.string
    })
])
const fancyGreet = (i: FancyGreetInput) => `${i.decoration ?? ''}${i.greeting} ${i.name}${'!'.repeat(i.excitedness)}${i.decoration ?? ''}`

describe('optional fields', () => {
    it('should retain optional fields', () => {
        const pFancyGreet = makePatient(FancyGreetInput, fancyGreet)
        expect(pFancyGreet({name: 'Claudio', greeting: 'Hello', excitedness: 2, decoration: '-_-'})).toEqual('-_-Hello Claudio!!-_-')
        expect(pFancyGreet({name: 'Claudio', greeting: 'Hello', decoration: '-_-'})({excitedness: 2})).toEqual('-_-Hello Claudio!!-_-')
    })

    it('should execute as soon as all required fields are received', () => {
        const pFancyGreet = makePatient(FancyGreetInput, fancyGreet)
        expect(pFancyGreet({name: 'Claudio', greeting: 'Hello'})({excitedness: 2})).toEqual('Hello Claudio!!')
    })
})

describe('types', () => {
    it('should adjust parameter type according to already provided fields', () => {
        const pFancyGreet = makePatient(FancyGreetInput, fancyGreet)
        // initially, patient funciton should accept a Partial of the required params
        expectTypeOf(pFancyGreet).parameter(0).toMatchTypeOf<Partial<FancyGreetInput>>()

        // @ts-expect-error: This should not be true, the parameter initially includes the 'name' field
        expectTypeOf(pFancyGreet).parameter(0).toEqualTypeOf<Partial<Omit<FancyGreetInput, 'name'>>>()

        // After it's been provided the 'name' parameter should not be allowed in the object again
        expectTypeOf(pFancyGreet({name: 'Claudio'})).parameter(0).toEqualTypeOf<Partial<Omit<FancyGreetInput, 'name'>>>()
    })

    it('should retain return type', () => {
        const pFancyGreet = makePatient(FancyGreetInput, fancyGreet)
        const result = pFancyGreet({name: 'Claudio', greeting: 'Hello', excitedness: 2, decoration: '-_-'})
        expectTypeOf(result).toEqualTypeOf<ReturnType<typeof fancyGreet>>()
    })
})