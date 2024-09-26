export const AuthErrors = {
  AUTHENTICATION_FAILED: {
    code: 1000,
    identifier: 'AUTHENTICATION_FAILED',
    message: 'Invalid credentials. The provided email or password is incorrect.',
    httpStatus: 401,
  },
  TOKEN_EXPIRED: {
    code: 1001,
    identifier: 'TOKEN_EXPIRED',
    message: 'Token has expired. You need to log in again to obtain a new token.',
    httpStatus: 401,
  },
  TOKEN_INVALID: {
    code: 1002,
    identifier: 'TOKEN_INVALID',
    message: 'Invalid JWT token.',
    httpStatus: 401,
  },
  ACCESS_DENIED: {
    code: 1003,
    identifier: 'ACCESS_DENIED',
    message: 'Access denied. You do not have permission to access this resource.',
    httpStatus: 403,
  },
  INVALID_CREDENTIALS_FORMAT: {
    code: 1029,
    identifier: 'INVALID_CREDENTIALS_FORMAT',
    message: 'Invalid credentials format. The email or password is not in the correct format.',
    httpStatus: 400,
  },
  SESSION_EXPIRED: {
    code: 1030,
    identifier: 'SESSION_EXPIRED',
    message: 'Session expired. Please log in again.',
    httpStatus: 401,
  },
};
