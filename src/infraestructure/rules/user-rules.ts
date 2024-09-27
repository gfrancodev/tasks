import {
  ConditionalAccessConfig,
  ConditionalAccessContext,
} from '../decorators/conditional-access-decorator';

export const canAccessUserOwnData = (): ConditionalAccessConfig => ({
  condition: (context: ConditionalAccessContext) => isUserAccessingOwnData(context),
  message: 'You can only access or modify your own data.',
});

export const isUserAccessingOwnData = (context: Partial<ConditionalAccessContext>): boolean => {
  const { user, params } = context;
  if (user?.role !== 'USER') {
    return true;
  }
  return user?.role === 'USER' && user?.id === params?.id && params?.companyId == user?.company_id;
};

export const canAccessAdminOwnData = (): ConditionalAccessConfig => ({
  condition: (context: ConditionalAccessContext) => isUserAccessingOwnData(context),
  message: 'You can only access or modify your own data if you are from your company.',
});

export const isAdminAccessingOwnData = (context: Partial<ConditionalAccessContext>): boolean => {
  const { user, params } = context;
  return user?.role === 'ADMIN' && params?.companyId == user?.company_id;
};
