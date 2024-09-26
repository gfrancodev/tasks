export const UserErrors = {
  USER_NOT_FOUND: {
    code: 1008,
    identifier: 'USER_NOT_FOUND',
    message: 'User not found.',
    httpStatus: 404,
  },
  INVALID_ROLE: {
    code: 1011,
    identifier: 'INVALID_ROLE',
    message: 'Invalid role when creating or updating a user.',
    httpStatus: 400,
  },
  DUPLICATE_ENTRY: {
    code: 1006,
    identifier: 'DUPLICATE_ENTRY',
    message: 'The user you are trying to create already exists.',
    httpStatus: 409,
  },
  EMAIL_ALREADY_IN_USE: {
    code: 1019,
    identifier: 'EMAIL_ALREADY_IN_USE',
    message: 'The provided email address is already registered.',
    httpStatus: 409,
  },
  USER_ID_MISMATCH: {
    code: 1022,
    identifier: 'USER_ID_MISMATCH',
    message: 'You do not have permission to access another user’s data.',
    httpStatus: 403,
  },
  ASSIGNED_USER_NOT_FOUND: {
    code: 1027,
    identifier: 'ASSIGNED_USER_NOT_FOUND',
    message: 'Assigned user not found.',
    httpStatus: 404,
  },
  VALIDATION_ERROR: {
    code: 1005,
    identifier: 'VALIDATION_ERROR',
    message: 'Validation error in the user data.',
    httpStatus: 400,
  },
  ACCESS_DENIED: {
    code: 1003,
    identifier: 'ACCESS_DENIED',
    message: 'Access denied when managing users.',
    httpStatus: 403,
  },
  INSUFFICIENT_PERMISSIONS: {
    code: 1028,
    identifier: 'INSUFFICIENT_PERMISSIONS',
    message: 'Insufficient permissions for this operation.',
    httpStatus: 403,
  },
  PASSWORD_TOO_WEAK: {
    code: 1018,
    identifier: 'PASSWORD_TOO_WEAK',
    message: 'The provided password is too weak.',
    httpStatus: 400,
  },
};
