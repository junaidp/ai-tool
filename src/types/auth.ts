import { UserRole } from './roles';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  companyId: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, companyName: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  isActive?: boolean;
}

export { UserRole };
