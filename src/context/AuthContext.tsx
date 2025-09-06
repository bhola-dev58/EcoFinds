import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService, { User } from '@/services/apiService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, email: string, password: string, full_name?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // First check if we have stored user data
      const storedUser = await apiService.getStoredUser();
      const storedToken = await apiService.getStoredToken();
      
      if (storedUser && storedToken) {
        // Verify token is still valid
        const verifyResult = await apiService.verifyToken();
        if (verifyResult.success && verifyResult.data?.user) {
          setUser(verifyResult.data.user);
        } else {
          // Token invalid, clear storage
          await apiService.logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      await apiService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const result = await apiService.login(email, password);
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      }
      return { success: result.success, message: result.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string, 
    email: string, 
    password: string, 
    full_name?: string
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const result = await apiService.register({ username, email, password, full_name });
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      }
      return { success: result.success, message: result.message };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const result = await apiService.getProfile();
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const updateProfile = async (updates: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await apiService.updateProfile(updates);
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      }
      return { success: result.success, message: result.message };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Failed to update profile. Please try again.' };
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
