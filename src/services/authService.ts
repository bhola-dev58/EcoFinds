import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

const STORAGE_KEYS = {
  USER: 'ecofinds_user',
  USERS: 'ecofinds_users',
};

export class AuthService {
  private static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  static async register(email: string, password: string, username: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Validation
      if (!this.validateEmail(email)) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      if (!this.validatePassword(password)) {
        return { success: false, message: 'Password must be at least 6 characters long' };
      }

      if (username.trim().length < 2) {
        return { success: false, message: 'Username must be at least 2 characters long' };
      }

      // Check if user already exists
      const existingUsers = await this.getAllUsers();
      const userExists = existingUsers.some(user => user.email.toLowerCase() === email.toLowerCase());

      if (userExists) {
        return { success: false, message: 'User with this email already exists' };
      }

      // Create new user
      const newUser: User = {
        id: this.generateId(),
        email: email.toLowerCase(),
        username: username.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store user data
      const updatedUsers = [...existingUsers, newUser];
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));

      // Store password separately (in a real app, this would be hashed)
      await AsyncStorage.setItem(`password_${newUser.id}`, password);

      return { success: true, message: 'Registration successful', user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  static async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      if (!this.validateEmail(email)) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      const existingUsers = await this.getAllUsers();
      const user = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Check password (in a real app, this would be properly hashed and compared)
      const storedPassword = await AsyncStorage.getItem(`password_${user.id}`);
      if (storedPassword !== password) {
        return { success: false, message: 'Invalid password' };
      }

      // Store current user
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      return { success: true, message: 'Login successful', user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const existingUsers = await this.getAllUsers();
      const userIndex = existingUsers.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return { success: false, message: 'User not found' };
      }

      const updatedUser: User = {
        ...existingUsers[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      existingUsers[userIndex] = updatedUser;
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(existingUsers));
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      return { success: true, message: 'Profile updated successfully', user: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Failed to update profile. Please try again.' };
    }
  }

  private static async getAllUsers(): Promise<User[]> {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }
}
