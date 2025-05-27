import { useApi, useMutation } from './useApi';
import { studentApi } from '../api';

// Student profile hook
export function useStudentProfile(studentId: string) {
  return useApi(
    () => studentApi.getProfile(studentId),
    [studentId]
  );
}

// Student exams hook
export function useStudentExams(studentId: string) {
  return useApi(
    () => studentApi.getExams(studentId),
    [studentId]
  );
}

// Student results hook
export function useStudentResults(studentId: string) {
  return useApi(
    () => studentApi.getResults(studentId),
    [studentId]
  );
}

// Student registration mutation
export function useStudentRegistration() {
  return useMutation();
}

// Student profile update mutation
export function useStudentProfileUpdate() {
  return useMutation();
}
