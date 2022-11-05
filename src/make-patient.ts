import { Type } from 'io-ts';

/**
 * Given an object `R` and a `Partial<R> P`, describe the a complementary type `C` so that `P & C extends R`
 */
type RecordComplement<R extends Record<string, any>, P extends Partial<R>> = {
  [K in Exclude<keyof R, keyof P>]: R[K];
};

/**
 * Recursive function that produces new functions that capture partials of the object parameter `I`
 * until all required fields are received, executing then and returning `R`
 */
export type PatientFunction<I extends Record<string, any>, R, PC extends Partial<I> = {}> = <
  P extends Partial<RecordComplement<I, PC>>
>(
  i: P
) => P & PC extends I ? R : PatientFunction<I, R, PC & P>;

/**
 * Make a patient function out of a function that receives an object as a parameter.
 * The generated function will recursively generate functions until all required fileds of the parameter
 * are received, executing then.
 *
 * For example:
 * ```
 * import * as t from 'io-ts';
 * const PCodec = t.type({a: t.number, b: t.string})
 * type PCodec = t.TypeOf<typeof PCodec>
 * const foo = (p: PCodec) => p.b.length === p.a
 * const pFoo = makePatient(PCodec, foo)
 *
 * const r1: boolean = pFoo({a: 1, b: 'full'})
 * const r2: boolean = pFoo({a: 1})({b: 'full'})
 * const r3: boolean = pFoo({b: 'full'})({a: 1})
 * ```
 */
export const makePatient = <I extends Record<string, any>, R>(
  codec: Type<I>,
  f: (p: I) => R
): PatientFunction<I, R> => {
  const patient = (i) => {
    if (codec.is(i)) return f(i);
    return (i2) => patient({ ...i, ...i2 });
  };
  return patient as any;
};
