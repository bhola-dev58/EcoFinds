import apiService, { Product, Category } from './apiService';

export class ProductService {
  // Get all categories
  static async getCategories(): Promise<Array<{ label: string; value: string; icon?: string }>> {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data?.categories) {
        return response.data.categories.map(cat => ({
          label: cat.name,
          value: cat.value,
          icon: cat.icon
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get all products
  static async getAllProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    condition?: string;
    seller_id?: number;
  }): Promise<Product[]> {
    try {
      const response = await apiService.getProducts(params);
      if (response.success && response.data?.products) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Get single product
  static async getProductById(id: number): Promise<Product | null> {
    try {
      const response = await apiService.getProduct(id);
      if (response.success && response.data?.product) {
        return response.data.product;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Search products
  static async searchProducts(query: string, category?: string): Promise<Product[]> {
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
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Filter products by category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await apiService.getProducts({ category, limit: 100 });
      if (response.success && response.data?.products) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  // Get products by seller
  static async getProductsBySeller(sellerId: number): Promise<Product[]> {
    try {
      const response = await apiService.getProducts({ seller_id: sellerId, limit: 100 });
      if (response.success && response.data?.products) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.error('Error fetching products by seller:', error);
      return [];
    }
  }
}

export default ProductService;
