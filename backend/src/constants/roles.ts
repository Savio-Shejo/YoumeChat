export const Roles = {
  USER: 'User',
  ADMIN: 'Admin',
} as const;

export type UserRole = (typeof Roles)[keyof typeof Roles];
