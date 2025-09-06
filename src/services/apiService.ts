import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  profile_image?: string;
  created_at: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition_rating: 'poor' | 'fair' | 'good' | 'excellent';
  images: string[];
  location?: string;
  is_available: boolean;
  is_featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  seller?: {
    username: string;
    name: string;
    email?: string;
    phone?: string;
  };
  sellerId?: number;
}

export interface Category {
  id: number;
  name: string;
  value: string;
  description?: string;
  icon?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  title: string;
  price: number;
  images: string[];
  quantity: number;
  seller_username: string;
  added_at: string;
}

export interface AuthData {
  user: User;
  token: string;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:3000/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth Methods
  async login(email: string, password: string): Promise<ApiResponse<AuthData>> {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      if (response.data.success && response.data.data.token) {
        await AsyncStorage.setItem('auth_token', response.data.data.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
  }): Promise<ApiResponse<AuthData>> {
    try {
      const response = await this.api.post('/auth/register', userData);
      if (response.data.success && response.data.data.token) {
        await AsyncStorage.setItem('auth_token', response.data.data.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    }
  }

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await this.api.get('/auth/verify');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await this.api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Product Methods
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    condition?: string;
    seller_id?: number;
  }): Promise<ApiResponse<{ products: Product[]; pagination: any }>> {
    try {
      const response = await this.api.get('/products', { params });
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getProduct(id: number): Promise<ApiResponse<{ product: Product }>> {
    try {
      const response = await this.api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async createProduct(productData: FormData): Promise<ApiResponse<{ product: Product }>> {
    try {
      const response = await this.api.post('/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateProduct(id: number, productData: FormData): Promise<ApiResponse<{ product: Product }>> {
    try {
      const response = await this.api.put(`/products/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteProduct(id: number): Promise<ApiResponse> {
    try {
      const response = await this.api.delete(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Category Methods
  async getCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
    try {
      const response = await this.api.get('/categories');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Cart Methods
  async getCart(): Promise<ApiResponse<{ cart: CartItem[] }>> {
    try {
      const response = await this.api.get('/cart');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async addToCart(product_id: number, quantity: number = 1): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/cart/add', { product_id, quantity });
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async removeFromCart(cartItemId: number): Promise<ApiResponse> {
    try {
      const response = await this.api.delete(`/cart/${cartItemId}`);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async clearCart(): Promise<ApiResponse> {
    try {
      const response = await this.api.delete('/cart');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // User Methods
  async updateProfile(profileData: {
    full_name?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await this.api.put('/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getMyProducts(): Promise<ApiResponse<{ products: Product[] }>> {
    try {
      const response = await this.api.get('/users/my-products');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Utility Methods
  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  private handleError(error: any): ApiResponse {
    console.error('API Error:', error);
    
    if (error.response?.data) {
      return error.response.data;
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        success: false,
        message: 'Network error. Please check your internet connection and make sure the backend server is running.',
      };
    }
    
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
    };
  }
}

export const apiService = new ApiService();
export default apiService;
