import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductService } from '@/services/productService';
import { Product, ProductCategory, CartItem, Purchase, AppContextType } from '@/types';
import { useAuth } from './AuthContext';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [allProducts, cartItems, userPurchases] = await Promise.all([
        ProductService.getAllProducts(),
        ProductService.getCart(),
        user ? ProductService.getPurchasesByUser(user.id) : Promise.resolve([]),
      ]);

      setProducts(allProducts);
      setCart(cartItems);
      setPurchases(userPurchases);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const refreshProducts = async () => {
    try {
      const allProducts = await ProductService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Failed to refresh products:', error);
    }
  };

  const refreshCart = async () => {
    try {
      const cartItems = await ProductService.getCart();
      setCart(cartItems);
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    }
  };

  const refreshPurchases = async () => {
    if (!user) return;
    
    try {
      const userPurchases = await ProductService.getPurchasesByUser(user.id);
      setPurchases(userPurchases);
    } catch (error) {
      console.error('Failed to refresh purchases:', error);
    }
  };

  const addToCart = async (product: Product): Promise<void> => {
    try {
      const result = await ProductService.addToCart(product);
      if (result.success) {
        await refreshCart();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string): Promise<void> => {
    try {
      const result = await ProductService.removeFromCart(productId);
      if (result.success) {
        await refreshCart();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number): Promise<void> => {
    try {
      const result = await ProductService.updateCartQuantity(productId, quantity);
      if (result.success) {
        await refreshCart();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Update cart quantity error:', error);
      throw error;
    }
  };

  const clearCart = async (): Promise<void> => {
    try {
      const result = await ProductService.clearCart();
      if (result.success) {
        await refreshCart();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const result = await ProductService.createProduct(product);
      if (result.success) {
        await refreshProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Create product error:', error);
      return false;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    try {
      const result = await ProductService.updateProduct(id, updates);
      if (result.success) {
        await refreshProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update product error:', error);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const result = await ProductService.deleteProduct(id);
      if (result.success) {
        await refreshProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete product error:', error);
      return false;
    }
  };

  const searchProducts = (query: string): Product[] => {
    if (!query.trim()) {
      return products.filter(product => product.isAvailable);
    }

    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.isAvailable && (
        product.title.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  const filterByCategory = (category: ProductCategory | null): Product[] => {
    if (!category) {
      return products.filter(product => product.isAvailable);
    }

    return products.filter(product => product.isAvailable && product.category === category);
  };

  const purchaseProduct = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await ProductService.purchaseProduct(productId, user.id);
      if (result.success) {
        await Promise.all([refreshProducts(), refreshCart(), refreshPurchases()]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Purchase product error:', error);
      return false;
    }
  };

  const contextValue: AppContextType = {
    products,
    cart,
    purchases,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    filterByCategory,
    purchaseProduct,
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
