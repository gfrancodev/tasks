import { describe, it, expect } from 'vitest';
import { General } from './general-types';

describe('General Types', () => {
  describe('ReplacePropertyType', () => {
    it('should replace the type of a single property', () => {
      interface OriginalType {
        id: number;
        name: string;
        active: boolean;
      }

      type ModifiedType = General.ReplacePropertyType<OriginalType, 'id', string>;

      type Test1 = General.IsTrue<General.AssertEqual<ModifiedType['id'], string>>;
      type Test2 = General.IsTrue<General.AssertEqual<ModifiedType['name'], string>>;
      type Test3 = General.IsTrue<General.AssertEqual<ModifiedType['active'], boolean>>;

      const test1: Test1 = true;
      const test2: Test2 = true;
      const test3: Test3 = true;

      expect(test1).toBe(true);
      expect(test2).toBe(true);
      expect(test3).toBe(true);
    });

    it('should replace the type of multiple properties', () => {
      interface OriginalType {
        id: number;
        name: string;
        active: boolean;
        createdAt: Date;
      }

      type ModifiedType = General.ReplacePropertyType<OriginalType, 'id' | 'createdAt', string>;

      type Test1 = General.IsTrue<General.AssertEqual<ModifiedType['id'], string>>;
      type Test2 = General.IsTrue<General.AssertEqual<ModifiedType['createdAt'], string>>;
      type Test3 = General.IsTrue<General.AssertEqual<ModifiedType['name'], string>>;
      type Test4 = General.IsTrue<General.AssertEqual<ModifiedType['active'], boolean>>;

      const test1: Test1 = true;
      const test2: Test2 = true;
      const test3: Test3 = true;
      const test4: Test4 = true;

      expect(test1).toBe(true);
      expect(test2).toBe(true);
      expect(test3).toBe(true);
      expect(test4).toBe(true);
    });

    it('should work with optional properties', () => {
      interface OriginalType {
        id: number;
        name?: string;
        active: boolean;
      }

      type ModifiedType = General.ReplacePropertyType<OriginalType, 'name', string>;

      type Test1 = General.IsTrue<General.AssertEqual<ModifiedType['name'], string>>;
      type Test2 = General.IsTrue<General.AssertEqual<ModifiedType['id'], number>>;
      type Test3 = General.IsTrue<General.AssertEqual<ModifiedType['active'], boolean>>;

      const test1: Test1 = true;
      const test2: Test2 = true;
      const test3: Test3 = true;

      expect(test1).toBe(true);
      expect(test2).toBe(true);
      expect(test3).toBe(true);
    });

    it('should handle readonly properties', () => {
      interface OriginalType {
        readonly id: number;
        name: string;
        active: boolean;
      }

      type ModifiedType = General.ReplacePropertyType<OriginalType, 'id', string>;

      type Test1 = General.IsTrue<General.AssertEqual<ModifiedType['id'], string>>;

      const test1: Test1 = true;
      const test2: IsTrue<General.AssertEqual<typeof test2, true>> = true;

      expect(test1).toBe(true);
      expect(test2).toBe(true);
    });

    it('should ensure the original type is not modified', () => {
      interface OriginalType {
        id: number;
        name: string;
      }

      type ModifiedType = General.ReplacePropertyType<OriginalType, 'id', string>;

      type Test1 = General.IsTrue<General.AssertEqual<OriginalType['id'], number>>;
      type Test2 = General.IsTrue<General.AssertEqual<ModifiedType['id'], string>>;

      const test1: Test1 = true;
      const test2: Test2 = true;

      expect(test1).toBe(true);
      expect(test2).toBe(true);
    });
  });

  describe('AssertEqual', () => {
    it('should return true for identical types', () => {
      type TypeA = { id: number; name: string };
      type TypeB = { id: number; name: string };

      type Test = General.IsTrue<General.AssertEqual<TypeA, TypeB>>;

      const test: Test = true;
      expect(test).toBe(true);
    });

    it('should return false for different types', () => {
      type TypeA = { id: number; name: string };
      type TypeB = { id: number; name: string; active: boolean };

      type Test = General.AssertEqual<TypeA, TypeB>;
      const test: Test = false;
      expect(test).toBe(false);
    });

    it('should consider types with different property types as different', () => {
      type TypeA = { id: number; name: string };
      type TypeB = { id: number; name: number };

      type Test = General.AssertEqual<TypeA, TypeB>;
      const test: Test = false;
      expect(test).toBe(false);
    });

    it('should consider union types correctly', () => {
      type TypeA = string | number;
      type TypeB = number | string;

      type Test = General.IsTrue<General.AssertEqual<TypeA, TypeB>>;

      const test: Test = true;
      expect(test).toBe(true);
    });

    it('should consider optional properties', () => {
      type TypeA = { id: number; name?: string };
      type TypeB = { id: number; name?: string };

      type Test = General.IsTrue<General.AssertEqual<TypeA, TypeB>>;

      const test: Test = true;
      expect(test).toBe(true);
    });

    it('should consider types different when one property is optional and the other is not', () => {
      type TypeA = { id: number; name: string };
      type TypeB = { id: number; name?: string };

      type Test = General.AssertEqual<TypeA, TypeB>;
      const test: Test = false;
      expect(test).toBe(false);
    });
  });
});
