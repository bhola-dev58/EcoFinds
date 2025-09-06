import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, ProductCategory, CartItem, Purchase } from '@/types';

const STORAGE_KEYS = {
  PRODUCTS: 'ecofinds_products',
  CART: 'ecofinds_cart',
  PURCHASES: 'ecofinds_purchases',
};

export class ProductService {
  private static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Product CRUD Operations
  static async getAllProducts(): Promise<Product[]> {
    try {
      const productsJson = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return productsJson ? JSON.parse(productsJson) : [];
    } catch (error) {
      console.error('Get all products error:', error);
      return [];
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const products = await this.getAllProducts();
      return products.find(product => product.id === id) || null;
    } catch (error) {
      console.error('Get product by ID error:', error);
      return null;
    }
  }

  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; product?: Product }> {
    try {
      const newProduct: Product = {
        ...productData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAvailable: true,
      };

      const existingProducts = await this.getAllProducts();
      const updatedProducts = [...existingProducts, newProduct];
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));

      return { success: true, message: 'Product created successfully', product: newProduct };
    } catch (error) {
      console.error('Create product error:', error);
      return { success: false, message: 'Failed to create product. Please try again.' };
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; message: string; product?: Product }> {
    try {
      const existingProducts = await this.getAllProducts();
      const productIndex = existingProducts.findIndex(p => p.id === id);

      if (productIndex === -1) {
        return { success: false, message: 'Product not found' };
      }

      const updatedProduct: Product = {
        ...existingProducts[productIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      existingProducts[productIndex] = updatedProduct;
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(existingProducts));

      return { success: true, message: 'Product updated successfully', product: updatedProduct };
    } catch (error) {
      console.error('Update product error:', error);
      return { success: false, message: 'Failed to update product. Please try again.' };
    }
  }

  static async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const existingProducts = await this.getAllProducts();
      const filteredProducts = existingProducts.filter(p => p.id !== id);

      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filteredProducts));
      return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
      console.error('Delete product error:', error);
      return { success: false, message: 'Failed to delete product. Please try again.' };
    }
  }

  static async getProductsBySeller(sellerId: string): Promise<Product[]> {
    try {
      const products = await this.getAllProducts();
      return products.filter(product => product.sellerId === sellerId);
    } catch (error) {
      console.error('Get products by seller error:', error);
      return [];
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const products = await this.getAllProducts();
      const lowercaseQuery = query.toLowerCase();
      
      return products.filter(product => 
        product.isAvailable && (
          product.title.toLowerCase().includes(lowercaseQuery) ||
          product.description.toLowerCase().includes(lowercaseQuery)
        )
      );
    } catch (error) {
      console.error('Search products error:', error);
      return [];
    }
  }

  static async filterByCategory(category: ProductCategory | null): Promise<Product[]> {
    try {
      const products = await this.getAllProducts();
      
      if (!category) {
        return products.filter(product => product.isAvailable);
      }

      return products.filter(product => product.isAvailable && product.category === category);
    } catch (error) {
      console.error('Filter by category error:', error);
      return [];
    }
  }

  // Cart Operations
  static async getCart(): Promise<CartItem[]> {
    try {
      const cartJson = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      return cartJson ? JSON.parse(cartJson) : [];
    } catch (error) {
      console.error('Get cart error:', error);
      return [];
    }
  }

  static async addToCart(product: Product, quantity: number = 1): Promise<{ success: boolean; message: string }> {
    try {
      const cart = await this.getCart();
      const existingItemIndex = cart.findIndex(item => item.product.id === product.id);

      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        const newCartItem: CartItem = {
          id: this.generateId(),
          product,
          quantity,
          addedAt: new Date().toISOString(),
        };
        cart.push(newCartItem);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      return { success: true, message: 'Product added to cart successfully' };
    } catch (error) {
      console.error('Add to cart error:', error);
      return { success: false, message: 'Failed to add product to cart. Please try again.' };
    }
  }

  static async removeFromCart(productId: string): Promise<{ success: boolean; message: string }> {
    try {
      const cart = await this.getCart();
      const filteredCart = cart.filter(item => item.product.id !== productId);

      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(filteredCart));
      return { success: true, message: 'Product removed from cart successfully' };
    } catch (error) {
      console.error('Remove from cart error:', error);
      return { success: false, message: 'Failed to remove product from cart. Please try again.' };
    }
  }

  static async updateCartQuantity(productId: string, quantity: number): Promise<{ success: boolean; message: string }> {
    try {
      const cart = await this.getCart();
      const itemIndex = cart.findIndex(item => item.product.id === productId);

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          cart.splice(itemIndex, 1);
        } else {
          cart[itemIndex].quantity = quantity;
        }

        await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        return { success: true, message: 'Cart updated successfully' };
      }

      return { success: false, message: 'Product not found in cart' };
    } catch (error) {
      console.error('Update cart quantity error:', error);
      return { success: false, message: 'Failed to update cart. Please try again.' };
    }
  }

  static async clearCart(): Promise<{ success: boolean; message: string }> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
      return { success: true, message: 'Cart cleared successfully' };
    } catch (error) {
      console.error('Clear cart error:', error);
      return { success: false, message: 'Failed to clear cart. Please try again.' };
    }
  }

  // Purchase Operations
  static async getPurchases(): Promise<Purchase[]> {
    try {
      const purchasesJson = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASES);
      return purchasesJson ? JSON.parse(purchasesJson) : [];
    } catch (error) {
      console.error('Get purchases error:', error);
      return [];
    }
  }

  static async getPurchasesByUser(userId: string): Promise<Purchase[]> {
    try {
      const purchases = await this.getPurchases();
      return purchases.filter(purchase => purchase.buyerId === userId);
    } catch (error) {
      console.error('Get purchases by user error:', error);
      return [];
    }
  }

  static async purchaseProduct(productId: string, buyerId: string): Promise<{ success: boolean; message: string }> {
    try {
      const product = await this.getProductById(productId);
      
      if (!product) {
        return { success: false, message: 'Product not found' };
      }

      if (!product.isAvailable) {
        return { success: false, message: 'Product is no longer available' };
      }

      if (product.sellerId === buyerId) {
        return { success: false, message: 'You cannot purchase your own product' };
      }

      // Create purchase record
      const purchase: Purchase = {
        id: this.generateId(),
        productId: product.id,
        product,
        buyerId,
        sellerId: product.sellerId,
        price: product.price,
        purchaseDate: new Date().toISOString(),
        status: 'completed',
      };

      // Update product availability
      await this.updateProduct(productId, { isAvailable: false });

      // Add to purchases
      const purchases = await this.getPurchases();
      purchases.push(purchase);
      await AsyncStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));

      // Remove from cart if present
      await this.removeFromCart(productId);

      return { success: true, message: 'Product purchased successfully' };
    } catch (error) {
      console.error('Purchase product error:', error);
      return { success: false, message: 'Failed to purchase product. Please try again.' };
    }
  }

  // Utility methods
  static getCategories(): { value: ProductCategory; label: string }[] {
    return [
      { value: 'electronics', label: 'Electronics' },
      { value: 'clothing', label: 'Clothing & Fashion' },
      { value: 'home-garden', label: 'Home & Garden' },
      { value: 'books', label: 'Books & Media' },
      { value: 'sports', label: 'Sports & Recreation' },
      { value: 'toys', label: 'Toys & Games' },
      { value: 'automotive', label: 'Automotive' },
      { value: 'health-beauty', label: 'Health & Beauty' },
      { value: 'music', label: 'Musical Instruments' },
      { value: 'other', label: 'Other' },
    ];
  }
}
