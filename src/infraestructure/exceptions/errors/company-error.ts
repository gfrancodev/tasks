export const CompanyErrors = {
  COMPANY_NOT_FOUND: {
    code: 1007,
    identifier: 'COMPANY_NOT_FOUND',
    message: 'Company not found.',
    httpStatus: 404,
  },
  INVALID_UUID_FORMAT: {
    code: 1020,
    identifier: 'INVALID_UUID_FORMAT',
    message: 'Invalid UUID format for the company.',
    httpStatus: 400,
  },
  DUPLICATE_ENTRY: {
    code: 1006,
    identifier: 'DUPLICATE_ENTRY',
    message: 'The company you are trying to create already exists.',
    httpStatus: 409,
  },
  COMPANY_ID_MISMATCH: {
    code: 1021,
    identifier: 'COMPANY_ID_MISMATCH',
    message: 'Company ID does not match yours.',
    httpStatus: 403,
  },
  VALIDATION_ERROR: {
    code: 1005,
    identifier: 'VALIDATION_ERROR',
    message: 'Validation error in the company data.',
    httpStatus: 400,
  },
  ACCESS_DENIED: {
    code: 1003,
    identifier: 'ACCESS_DENIED',
    message: 'Access denied when managing companies.',
    httpStatus: 403,
  },
  DATABASE_ERROR: {
    code: 1023,
    identifier: 'DATABASE_ERROR',
    message: 'Database error when accessing companies.',
    httpStatus: 500,
  },
};
