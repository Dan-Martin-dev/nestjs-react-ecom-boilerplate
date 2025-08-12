// User types and interfaces
export const Role = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN'
} as const;
export type Role = typeof Role[keyof typeof Role];

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
