// API utility functions for the GCE Automated Results System

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

// Generic API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authentication token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Specific API functions for different modules

// Authentication APIs
export const authApi = {
  login: (credentials: { email: string; password: string; userType: string }) =>
    apiClient.post('/auth/login', credentials),

  logout: () =>
    apiClient.post('/auth/logout'),

  register: (userData: any) =>
    apiClient.post('/auth/register', userData),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),
};

// Student APIs
export const studentApi = {
  getProfile: (studentId: string) =>
    apiClient.get(`/students/${studentId}`),

  updateProfile: (studentId: string, data: any) =>
    apiClient.put(`/students/${studentId}`, data),

  getExams: (studentId: string) =>
    apiClient.get(`/students/${studentId}/exams`),

  getResults: (studentId: string) =>
    apiClient.get(`/students/${studentId}/results`),

  register: (registrationData: any) =>
    apiClient.post('/students', registrationData),
};

// Examination APIs
export const examinationApi = {
  getCenters: (filters?: { region?: string; status?: string }) =>
    apiClient.get('/examinations/centers', filters),

  createCenter: (centerData: any) =>
    apiClient.post('/examinations/centers', centerData),

  updateCenter: (centerId: string, data: any) =>
    apiClient.put(`/examinations/centers/${centerId}`, data),

  deleteCenter: (centerId: string) =>
    apiClient.delete(`/examinations/centers/${centerId}`),

  getSubjects: () =>
    apiClient.get('/examinations/subjects'),

  getGradingConfig: () =>
    apiClient.get('/examinations/grading-config'),

  updateGradingConfig: (config: any) =>
    apiClient.post('/examinations/grading-config', config),
};

// Admin APIs
export const adminApi = {
  getDashboardStats: () =>
    apiClient.get('/admin/dashboard/stats'),

  getUsers: (filters?: any) =>
    apiClient.get('/admin/users', filters),

  createUser: (userData: any) =>
    apiClient.post('/admin/users', userData),

  updateUser: (userId: string, data: any) =>
    apiClient.put(`/admin/users/${userId}`, data),

  deleteUser: (userId: string) =>
    apiClient.delete(`/admin/users/${userId}`),

  getSystemLogs: (filters?: any) =>
    apiClient.get('/admin/logs', filters),

  getBackups: () =>
    apiClient.get('/admin/backups'),

  createBackup: () =>
    apiClient.post('/admin/backups'),
};

// Schools APIs
export const schoolsApi = {
  getDashboardStats: () =>
    apiClient.get('/schools/dashboard/stats'),

  getStudents: (filters?: any) =>
    apiClient.get('/schools/students', filters),

  registerStudent: (studentData: any) =>
    apiClient.post('/schools/students', studentData),

  getResults: (filters?: any) =>
    apiClient.get('/schools/results', filters),

  getCommunications: () =>
    apiClient.get('/schools/communications'),

  sendCommunication: (messageData: any) =>
    apiClient.post('/schools/communications', messageData),
};

// Examiner APIs
export const examinerApi = {
  getScripts: (examinerId: string, filters?: any) =>
    apiClient.get(`/examiners/${examinerId}/scripts`, filters),

  submitMarking: (scriptId: string, markingData: any) =>
    apiClient.post(`/scripts/${scriptId}/marking`, markingData),

  getVerificationTasks: (examinerId: string) =>
    apiClient.get(`/examiners/${examinerId}/verification-tasks`),

  submitVerification: (taskId: string, verificationData: any) =>
    apiClient.post(`/verification-tasks/${taskId}`, verificationData),
};

// Processing APIs
export const processingApi = {
  getResults: (filters?: any) =>
    apiClient.get('/processing/results', filters),

  publishResults: (resultIds: string[]) =>
    apiClient.post('/processing/publish', { resultIds }),

  generateCertificates: (filters?: any) =>
    apiClient.post('/processing/certificates', filters),

  getNotificationTemplates: () =>
    apiClient.get('/processing/notification-templates'),

  sendNotifications: (notificationData: any) =>
    apiClient.post('/processing/notifications', notificationData),
};

export default apiClient;
