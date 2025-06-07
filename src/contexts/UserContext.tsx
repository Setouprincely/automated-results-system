'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  userType: 'student' | 'teacher' | 'examiner' | 'admin';
  examLevel?: 'O Level' | 'A Level';
  profilePicturePath?: string;
  candidateNumber?: string;
  schoolCenterNumber?: string;
  region?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female';
  registrationStatus?: string;
  examCenter?: string;
  centerCode?: string;
  schoolName?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<UserInfo>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user info from localStorage
  const getStoredUserInfo = (): Partial<UserInfo> | null => {
    if (typeof window === 'undefined') return null;

    try {
      const userId = localStorage.getItem('userId');
      const userType = localStorage.getItem('userType');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const examLevel = localStorage.getItem('examLevel');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !userType || !authToken) {
        return null;
      }

      return {
        id: userId,
        userType: userType as 'student' | 'teacher' | 'examiner' | 'admin',
        fullName: userName || '',
        email: userEmail || '',
        examLevel: examLevel as 'O Level' | 'A Level' | undefined
      };
    } catch (error) {
      console.error('Error reading user info from localStorage:', error);
      return null;
    }
  };

  // Fetch complete user data from API
  const fetchUserData = async (userId: string, userType: string, examLevel?: string): Promise<UserInfo | null> => {
    try {
      console.log(`🔍 Fetching user data for: ${userId} (${userType}, ${examLevel || 'N/A'})`);

      let apiUrl = '';

      // Determine API endpoint based on user type
      switch (userType) {
        case 'student':
          apiUrl = `/api/students/${userId}`;
          if (examLevel) {
            apiUrl += `?examLevel=${encodeURIComponent(examLevel)}`;
          }
          break;
        case 'teacher':
          apiUrl = `/api/teachers/${userId}`;
          break;
        case 'examiner':
          apiUrl = `/api/examiners/${userId}`;
          break;
        case 'admin':
          apiUrl = `/api/admin/${userId}`;
          break;
        default:
          throw new Error(`Unknown user type: ${userType}`);
      }

      console.log(`📡 Making API request to: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          logout();
          throw new Error('Authentication expired. Please login again.');
        }
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📊 API Response:`, data);

      if (data.success) {
        console.log(`✅ User data fetched successfully:`, {
          id: data.data.id,
          fullName: data.data.fullName,
          email: data.data.email,
          examLevel: data.data.examLevel,
          schoolCenterNumber: data.data.schoolCenterNumber
        });
        return data.data;
      } else {
        console.log(`❌ API Error:`, data.message);
        throw new Error(data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  // Load user data on mount
  const loadUser = async () => {
    console.log(`🔄 Loading user data...`);
    setLoading(true);
    setError(null);

    try {
      const storedInfo = getStoredUserInfo();
      console.log(`📱 Stored user info:`, storedInfo);

      if (!storedInfo || !storedInfo.id || !storedInfo.userType) {
        console.log(`❌ No valid stored user info found`);
        setUser(null);
        setLoading(false);
        return;
      }

      // Set basic info immediately from localStorage for faster UI response
      console.log(`⚡ Setting basic user info from localStorage`);
      setUser(storedInfo as UserInfo);

      // Fetch complete data from API to get all registration details
      try {
        console.log(`🌐 Fetching complete user data from API...`);
        const completeUserData = await fetchUserData(
          storedInfo.id!,
          storedInfo.userType!,
          storedInfo.examLevel
        );

        if (completeUserData) {
          console.log(`✅ Complete user data loaded, updating context`);
          setUser(completeUserData);

          // Update localStorage with fresh data
          if (typeof window !== 'undefined') {
            localStorage.setItem('userName', completeUserData.fullName);
            localStorage.setItem('userEmail', completeUserData.email);
            if (completeUserData.examLevel) {
              localStorage.setItem('examLevel', completeUserData.examLevel);
            }
          }
        }
      } catch (apiError) {
        console.warn('⚠️ Failed to fetch complete user data, using stored info:', apiError);
        // Keep the stored info if API fails - better than nothing
      }
    } catch (error) {
      console.error('❌ Error loading user:', error);
      setError(error instanceof Error ? error.message : 'Failed to load user data');
      setUser(null);
    } finally {
      setLoading(false);
      console.log(`🏁 User loading complete`);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!user) return;

    try {
      const completeUserData = await fetchUserData(
        user.id,
        user.userType,
        user.examLevel
      );

      if (completeUserData) {
        setUser(completeUserData);

        // Update localStorage with fresh data
        localStorage.setItem('userName', completeUserData.fullName);
        localStorage.setItem('userEmail', completeUserData.email);
        if (completeUserData.examLevel) {
          localStorage.setItem('examLevel', completeUserData.examLevel);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh user data');
    }
  };

  // Update user data locally
  const updateUser = (updates: Partial<UserInfo>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    // Update localStorage
    if (updates.fullName) localStorage.setItem('userName', updates.fullName);
    if (updates.email) localStorage.setItem('userEmail', updates.email);
    if (updates.examLevel) localStorage.setItem('examLevel', updates.examLevel);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setError(null);

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('examLevel');
    }

    // Redirect to login
    window.location.href = '/auth/Login';
  };

  // Load user on mount and when localStorage changes
  useEffect(() => {
    loadUser();

    // Listen for storage changes (e.g., login in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'userId') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: UserContextType = {
    user,
    loading,
    error,
    refreshUser,
    updateUser,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
