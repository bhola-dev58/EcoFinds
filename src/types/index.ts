export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  price: number;
  imageUrl?: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  isAvailable: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface Purchase {
  id: string;
  productId: string;
  product: Product;
  buyerId: string;
  sellerId: string;
  price: number;
  purchaseDate: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export type ProductCategory = 
  | 'electronics'
  | 'clothing'
  | 'home-garden'
  | 'books'
  | 'sports'
  | 'toys'
  | 'automotive'
  | 'health-beauty'
  | 'music'
  | 'other';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

export interface AppContextType {
  products: Product[];
  cart: CartItem[];
  purchases: Purchase[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  searchProducts: (query: string) => Product[];
  filterByCategory: (category: ProductCategory | null) => Product[];
  purchaseProduct: (productId: string) => Promise<boolean>;
}

export interface RootStackParamList {
  AuthStack: undefined;
  MainTabs: undefined;
}

export interface AuthStackParamList {
  Login: undefined;
  Register: undefined;
}

export interface MainTabsParamList {
  Home: undefined;
  Browse: undefined;
  AddProduct: undefined;
  Cart: undefined;
  Profile: undefined;
}

export interface ProductStackParamList {
  ProductList: undefined;
  ProductDetail: { productId: string };
}

export interface ProfileStackParamList {
  ProfileMain: undefined;
  MyProducts: undefined;
  PurchaseHistory: undefined;
  EditProfile: undefined;
}
