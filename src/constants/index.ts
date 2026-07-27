/**
 * User Roles for the platform
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES = Object.values(ROLES);

/**
 * Common Statuses
 */
export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  INITIATED: 'INITIATED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DELETED: 'DELETED',
  ARCHIVED: 'ARCHIVED',
  FAIL: 'FAIL',
  SUCCESS: 'SUCCESS',
  DRAFT: 'DRAFT',
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export const ALL_STATUSES = Object.values(STATUS);



export const FULL_PAYMENT_DISCOUNT = 299;