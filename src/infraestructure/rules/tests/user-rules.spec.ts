import { describe, it, expect } from 'vitest';
import {
  canAccessUserOwnData,
  isUserAccessingOwnData,
  canAccessAdminOwnData,
  isAdminAccessingOwnData,
} from '../user-rules';
import { ConditionalAccessContext } from '../../decorators/conditional-access-decorator';

describe('User Rules', () => {
  describe('canAccessUserOwnData', () => {
    it('should return a ConditionalAccessConfig', () => {
      const result = canAccessUserOwnData();
      expect(result).toHaveProperty('condition');
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('You can only access or modify your own data.');
    });

    it('should use isUserAccessingOwnData as the condition', () => {
      const result = canAccessUserOwnData();
      const mockContext = {} as ConditionalAccessContext;
      expect(result.condition(mockContext)).toBe(isUserAccessingOwnData(mockContext));
    });
  });

  describe('isUserAccessingOwnData', () => {
    it('should return true if user role is not USER', () => {
      const context: Partial<ConditionalAccessContext> = {
        user: { role: 'ADMIN', id: '1', company_id: '1' },
        params: { id: '2', companyId: '2' },
      } as any;
      expect(isUserAccessingOwnData(context)).toBe(true);
    });

    it('should return true if user is accessing own data', () => {
      const context: Partial<ConditionalAccessContext> = {
        user: { role: 'USER', id: '1', company_id: '1' },
        params: { id: '1', companyId: '1' },
      } as any;
      expect(isUserAccessingOwnData(context)).toBe(true);
    });

    it('should return false if user is accessing other user data', () => {
      const context: Partial<ConditionalAccessContext> = {
        user: { role: 'USER', id: '1', company_id: '1' },
        params: { id: '2', companyId: '1' },
      } as any;
      expect(isUserAccessingOwnData(context)).toBe(false);
    });

    it('should return false if company IDs do not match', () => {
      const context: Partial<ConditionalAccessContext> = {
        user: { role: 'USER', id: '1', company_id: '1' },
        params: { id: '1', companyId: '2' },
      } as any;
      expect(isUserAccessingOwnData(context)).toBe(false);
    });
  });

  describe('canAccessAdminOwnData', () => {
    it('should return a ConditionalAccessConfig', () => {
      const result = canAccessAdminOwnData();
      expect(result).toHaveProperty('condition');
      expect(result).toHaveProperty('message');
      expect(result.message).toBe(
        'You can only access or modify your own data if you are from your company.',
      );
    });

    it('should use isUserAccessingOwnData as the condition', () => {
      const result = canAccessAdminOwnData();
      const mockContext = {} as ConditionalAccessContext;
      expect(result.condition(mockContext)).toBe(isUserAccessingOwnData(mockContext));
    });
  });

  describe('isAdminAccessingOwnData', () => {
    it('should return true if admin is accessing data from own company', () => {
      const context: Partial<ConditionalAccessContext> = {
        user: { role: 'ADMIN', company_id: '1' },
        params: { companyId: '1' },
      } as any;
      expect(isAdminAccessingOwnData(context)).toBe(true);
    });

    it('should return false if admin is accessing data from different company', () => {
      const context: Partial<ConditionalAccessContext> = {
        user: { role: 'ADMIN', company_id: '1' },
        params: { companyId: '2' },
      } as any;
      expect(isAdminAccessingOwnData(context)).toBe(false);
    });

    it('should return false if user is not an admin', () => {
      const context: Partial<ConditionalAccessContext> = {
        user: { role: 'USER', company_id: '1' },
        params: { companyId: '1' },
      } as any;
      expect(isAdminAccessingOwnData(context)).toBe(false);
    });
  });
});
