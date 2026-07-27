export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    USER_NOT_FOUND: 'User not found',
    INCORRECT_PASSWORD: 'Incorrect password',
    PROVIDE_CREDENTIALS: 'Please provide email and password',
    PASSWORD_CHANGED: 'Password changed successfully',
    INCORRECT_CURRENT_PASSWORD: 'Incorrect current password',
    ACCOUNT_DEACTIVATED: 'User account is deactivated.',
    UNAUTHORIZED: 'You are not logged in! Please log in to get access.',
    TOKEN_INVALID: 'Invalid or expired token',
    FORBIDDEN: 'You do not have permission to perform this action',
    OTP_SENT: 'OTP sent successfully to email and mobile',
    OTP_REQUIRED: 'OTP is required',
    OTP_INVALID: 'Invalid or expired OTP',
    OTP_VERIFIED: 'OTP verified successfully',
    LOGOUT_SUCCESS: 'Logged out successfully',
    TOKEN_NOT_PROVIDED: 'Token not provided',
    SESSION_EXPIRED: 'Session expired or logged out from another device.',
    TOKEN_EXPIRED: 'Unauthorized: Token has expired',
    ACCESS_DENIED: (roles: string) =>
      `Access Denied: Only ${roles} can access this facility.`,
  },
  USER: {
    CREATED: 'User created successfully',
    NOT_FOUND: 'User not found',
    ROLE_INVALID: 'Invalid role name',
    ROLES_SEEDED: 'Roles seeded successfully',
    ROLE_NOT_FOUND: 'Role not found',
    EMAIL_EXISTS: 'Email already exists',
    DUPLICATE_FIELD: 'Duplicate field value entered',
    HEAD_EXISTS: (dept: string) =>
      `A Head for ${dept} department already exists.`,
    SUPER_ADMIN_CREATED: 'Super Admin created successfully',
    STATUS_UPDATED: 'User status updated successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
  },

  COMMON: {
    SUCCESS: 'Operation successful',
    ERROR: 'An error occurred',
    VALIDATION_ERROR: 'Validation error',
  },
  VALIDATION: {
    INVALID_ROLE: (roles: string[]) =>
      `Invalid or missing Role. Allowed: ${roles.join(', ')}`,
    DEPARTMENT_REQUIRED: 'Department is required for this role.',
    INVALID_DEPARTMENT: (depts: string[]) =>
      `Invalid Department. Allowed: ${depts.join(', ')}`,
    STATUS_REQUIRED: 'Status is required and must be a string',
    INVALID_STATUS: (statuses: string[]) =>
      `Invalid status. Allowed: ${statuses.join(', ')}`,
    INVALID_SECRET_KEY: 'Forbidden: Invalid Secret Key',
  },
  CITY: {
    CREATED: 'City created successfully',
    UPDATED: 'City updated successfully',
    DELETED: 'City deleted successfully',
    NOT_FOUND: 'City not found',
    ALREADY_EXISTS:
      'City with this name already exists in the state and country',
  },
  LOCATION: {
    CREATED: 'Location created successfully',
    UPDATED: 'Location updated successfully',
    DELETED: 'Location deleted successfully',
    NOT_FOUND: 'Location not found',
    ALREADY_EXISTS: 'Location with this name already exists in the city',
  },
  WORKSHOP: {
    CREATED: 'Workshop created successfully',
    CREATED_WITH_USER: 'User and Workshop created successfully',
    UPDATED: 'Workshop updated successfully',
    DELETED: 'Workshop deleted successfully',
    NOT_FOUND: 'Workshop not found',
    ALREADY_EXISTS: 'Workshop with this slug already exists',
    ALREADY_OWNER: 'User already owns a workshop',
  },
  WORKSHOP_LOCATION: {
    CREATED: 'Workshop location added successfully',
    UPDATED: 'Workshop location updated successfully',
    DELETED: 'Workshop location removed successfully',
    NOT_FOUND: 'Workshop location not found',
    ALREADY_EXISTS: 'This location is already assigned to the workshop',
  },
  BRAND: {
    CREATED: 'Brand created successfully',
    UPDATED: 'Brand updated successfully',
    DELETED: 'Brand deleted successfully',
    NOT_FOUND: 'Brand not found',
    ALREADY_EXISTS: 'Brand with this name or slug already exists',
  },
  CAR_MODEL: {
    CREATED: 'Car model created successfully',
    UPDATED: 'Car model updated successfully',
    DELETED: 'Car model deleted successfully',
    NOT_FOUND: 'Car model not found',
    ALREADY_EXISTS: 'Car model with this name or slug already exists for the brand',
  },
  CATEGORY: {
    CREATED: 'Category created successfully',
    UPDATED: 'Category updated successfully',
    DELETED: 'Category deleted successfully',
    NOT_FOUND: 'Category not found',
    ALREADY_EXISTS: 'Category with this name or slug already exists',
  },
  PRODUCT: {
    CREATED: 'Product created successfully',
    UPDATED: 'Product updated successfully',
    DELETED: 'Product deleted successfully',
    NOT_FOUND: 'Product not found',
    ALREADY_EXISTS: 'Product with this SKU or slug already exists',
  },
  GLASS_TYPE: {
    CREATED: 'Glass type created successfully',
    UPDATED: 'Glass type updated successfully',
    DELETED: 'Glass type deleted successfully',
    NOT_FOUND: 'Glass type not found',
    ALREADY_EXISTS: 'Glass type with this name or slug already exists',
  },
  JOB: {
    NOT_FOUND: 'Job not found',
  },
  KYC: {
    SUBMITTED: 'KYC submitted successfully',
    UPDATED: 'KYC updated successfully',
    NOT_FOUND: 'KYC record not found',
    STATUS_UPDATED: 'KYC status updated successfully',
    DOCUMENT_STATUS_UPDATED: 'Document status updated successfully',
  },
};



export const STATUS = {
  SUCCESS: 'success',
  FAIL: 'fail',
  ERROR: 'error',
};
