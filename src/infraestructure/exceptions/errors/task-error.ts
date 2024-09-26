export const TaskErrors = {
  TASK_NOT_FOUND: {
    code: 1009,
    identifier: 'TASK_NOT_FOUND',
    message: 'Task not found.',
    httpStatus: 404,
  },
  TASK_ALREADY_COMPLETED: {
    code: 1026,
    identifier: 'TASK_ALREADY_COMPLETED',
    message: 'The task has already been completed. It cannot be modified.',
    httpStatus: 400,
  },
  INVALID_STATUS: {
    code: 1012,
    identifier: 'INVALID_STATUS',
    message: 'Invalid task status.',
    httpStatus: 400,
  },
  INVALID_UUID_FORMAT: {
    code: 1020,
    identifier: 'INVALID_UUID_FORMAT',
    message: 'Invalid UUID format for the task.',
    httpStatus: 400,
  },
  VALIDATION_ERROR: {
    code: 1005,
    identifier: 'VALIDATION_ERROR',
    message: 'Validation error in the task data.',
    httpStatus: 400,
  },
  ASSIGNED_USER_NOT_FOUND: {
    code: 1027,
    identifier: 'ASSIGNED_USER_NOT_FOUND',
    message: 'Assigned user for the task not found.',
    httpStatus: 404,
  },
  ACCESS_DENIED: {
    code: 1003,
    identifier: 'ACCESS_DENIED',
    message: 'Access denied when managing tasks.',
    httpStatus: 403,
  },
  INSUFFICIENT_PERMISSIONS: {
    code: 1028,
    identifier: 'INSUFFICIENT_PERMISSIONS',
    message: 'Insufficient permissions for this operation.',
    httpStatus: 403,
  },
};
