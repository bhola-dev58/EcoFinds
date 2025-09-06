import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService, { Product, CartItem } from '@/services/apiService';
import { useAuth } from './AuthContext';

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  isLoading: boolean;
  addToCart: (product: Product) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (cartItemId: number) => Promise<{ success: boolean; message?: string }>;
  clearCart: () => Promise<{ success: boolean; message?: string }>;
  refreshProducts: () => Promise<void>;
  refreshCart: () => Promise<void>;
  searchProducts: (query: string, category?: string) => Promise<Product[]>;
  createProduct: (productData: FormData) => Promise<{ success: boolean; message?: string }>;
  updateProduct: (id: number, productData: FormData) => Promise<{ success: boolean; message?: string }>;
  deleteProduct: (id: number) => Promise<{ success: boolean; message?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Refresh cart when user changes
    if (user) {
      refreshCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await refreshProducts();
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      const response = await apiService.getProducts({ limit: 100 });
      if (response.success && response.data?.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Failed to refresh products:', error);
    }
  };

  const refreshCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }

    try {
      const response = await apiService.getCart();
      if (response.success && response.data?.cart) {
        setCart(response.data.cart);
      }
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    }
  };

  const searchProducts = async (query: string, category?: string): Promise<Product[]> => {
    try {
      const params: any = { limit: 100 };
      if (query) params.search = query;
      if (category) params.category = category;

      const response = await apiService.getProducts(params);
      if (response.success && response.data?.products) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.error('Search products error:', error);
      return [];
    }
  };

  const addToCart = async (product: Product): Promise<{ success: boolean; message?: string }> => {
    if (!user) {
      return { success: false, message: 'Please log in to add items to cart' };
    }

    try {
      const response = await apiService.addToCart(product.id);
      if (response.success) {
        await refreshCart();
      }
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Add to cart error:', error);
      return { success: false, message: 'Failed to add item to cart' };
    }
  };

  const removeFromCart = async (cartItemId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiService.removeFromCart(cartItemId);
      if (response.success) {
        await refreshCart();
      }
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Remove from cart error:', error);
      return { success: false, message: 'Failed to remove item from cart' };
    }
  };

  const clearCart = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiService.clearCart();
      if (response.success) {
        await refreshCart();
      }
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Clear cart error:', error);
      return { success: false, message: 'Failed to clear cart' };
    }
  };

  const createProduct = async (productData: FormData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiService.createProduct(productData);
      if (response.success) {
        await refreshProducts();
      }
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Create product error:', error);
      return { success: false, message: 'Failed to create product' };
    }
  };

  const updateProduct = async (id: number, productData: FormData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiService.updateProduct(id, productData);
      if (response.success) {
        await refreshProducts();
      }
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Update product error:', error);
      return { success: false, message: 'Failed to update product' };
    }
  };

  const deleteProduct = async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiService.deleteProduct(id);
      if (response.success) {
        await refreshProducts();
        await refreshCart(); // Remove from cart if it was there
      }
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Delete product error:', error);
      return { success: false, message: 'Failed to delete product' };
    }
  };

  const contextValue: AppContextType = {
    products,
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    clearCart,
    refreshProducts,
    refreshCart,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
