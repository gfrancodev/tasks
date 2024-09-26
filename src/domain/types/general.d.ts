declare namespace General {
  /**
   * Creates a new type by replacing the type of property `K` in type `T` with `NewType`.
   *
   * This utility type allows you to take an existing type `T` and produce a new type where
   * the property `K` has its type replaced with `NewType`. All other properties remain unchanged.
   *
   * @typeParam T - The original type containing the property to be replaced.
   * @typeParam K - The key of the property in `T` whose type you want to replace. Must be a key of `T`.
   * @typeParam NewType - The new type that you want to assign to property `K`.
   *
   * @example
   * ```typescript
   * interface OriginalType {
   *   id: number;
   *   name: string;
   *   active: boolean;
   * }
   *
   * type ModifiedType = General.ReplacePropertyType<OriginalType, 'id', string>;
   * // Resulting type:
   * // {
   * //   id: string;
   * //   name: string;
   * //   active: boolean;
   * // }
   * ```
   */
  export type ReplacePropertyType<T, K extends keyof T, NewType> = Omit<T, K> & {
    [P in K]: NewType;
  };

  /**
   * Asserts that two types `T` and `Expected` are exactly equal.
   *
   * This type evaluates to `true` if `T` and `Expected` are exactly the same type,
   * considering their structure and properties. If they are not the same, it evaluates to `false`.
   *
   * @typeParam T - The first type to compare.
   * @typeParam Expected - The second type to compare against the first.
   *
   * @example
   * ```typescript
   * type A = { name: string };
   * type B = { name: string };
   *
   * type Test = General.AssertEqual<A, B>; // Evaluates to true
   *
   * type C = { name: string; age: number };
   * type D = { name: string };
   *
   * type Test2 = General.AssertEqual<C, D>; // Evaluates to false
   * ```
   */
  export type AssertEqual<T, Expected> = T extends Expected
    ? Expected extends T
      ? true
      : false
    : false;

  /**
   * Ensures that the type `T` extends `true`.
   *
   * This utility type is used to enforce that a given type condition resolves to `true`.
   * If `T` does not extend `true`, a TypeScript compilation error will occur.
   *
   * @typeParam T - The type to assert as `true`.
   *
   * @example
   * ```typescript
   * type Condition = General.AssertEqual<number, number>; // Evaluates to true
   *
   * type Test = General.IsTrue<Condition>; // Resolves successfully
   *
   * type FalseCondition = General.AssertEqual<number, string>; // Evaluates to false
   *
   * // The following line will cause a TypeScript error
   * // type TestError = General.IsTrue<FalseCondition>;
   * ```
   */
  export type IsTrue<T extends true> = T;
}
