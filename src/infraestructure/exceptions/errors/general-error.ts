export const GeneralErrors = {
  RESOURCE_NOT_FOUND: {
    code: 1004,
    identifier: 'RESOURCE_NOT_FOUND',
    message: 'Resource not found. The requested resource does not exist.',
    httpStatus: 404,
  },
  VALIDATION_ERROR: {
    code: 1005,
    identifier: 'VALIDATION_ERROR',
    message: 'Validation error.',
    httpStatus: 400,
  },
  MISSING_PARAMETERS: {
    code: 1013,
    identifier: 'MISSING_PARAMETERS',
    message: 'Required parameters were not provided.',
    httpStatus: 400,
  },
  INTERNAL_SERVER_ERROR: {
    code: 1014,
    identifier: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error.',
    httpStatus: 500,
  },
  METHOD_NOT_ALLOWED: {
    code: 1015,
    identifier: 'METHOD_NOT_ALLOWED',
    message: 'HTTP method not allowed for this endpoint.',
    httpStatus: 405,
  },
  UNSUPPORTED_MEDIA_TYPE: {
    code: 1016,
    identifier: 'UNSUPPORTED_MEDIA_TYPE',
    message: 'Unsupported media type.',
    httpStatus: 415,
  },
  RATE_LIMIT_EXCEEDED: {
    code: 1017,
    identifier: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded.',
    httpStatus: 429,
  },
  DATABASE_ERROR: {
    code: 1023,
    identifier: 'DATABASE_ERROR',
    message: 'Database error.',
    httpStatus: 500,
  },
  SERVICE_UNAVAILABLE: {
    code: 1024,
    identifier: 'SERVICE_UNAVAILABLE',
    message: 'Service unavailable.',
    httpStatus: 503,
  },
  INVALID_DATE_FORMAT: {
    code: 1025,
    identifier: 'INVALID_DATE_FORMAT',
    message: 'Invalid date format.',
    httpStatus: 400,
  },
};
