import { useApi, useMutation } from './useApi';
import { adminApi } from '../api';

// Admin dashboard stats hook
export function useAdminDashboardStats() {
  return useApi(
    () => adminApi.getDashboardStats(),
    []
  );
}

// Admin users management hook
export function useAdminUsers(filters?: any) {
  return useApi(
    () => adminApi.getUsers(filters),
    [filters]
  );
}

// Admin user creation mutation
export function useCreateUser() {
  return useMutation();
}

// Admin user update mutation
export function useUpdateUser() {
  return useMutation();
}

// Admin user deletion mutation
export function useDeleteUser() {
  return useMutation();
}

// System logs hook
export function useSystemLogs(filters?: any) {
  return useApi(
    () => adminApi.getSystemLogs(filters),
    [filters]
  );
}

// Backup management hooks
export function useBackups() {
  return useApi(
    () => adminApi.getBackups(),
    []
  );
}

export function useCreateBackup() {
  return useMutation();
}
