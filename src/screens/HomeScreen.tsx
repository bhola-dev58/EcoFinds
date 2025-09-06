import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { CollapsibleMenu } from '@/components/CollapsibleMenu';
import { ProductService } from '@/services/productService';
import { Product, ProductCategory } from '@/types';

interface HomeScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { products, cart } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchResultCount, setSearchResultCount] = useState(0);

  const availableProducts = products.filter(p => p.isAvailable);
  const recentProducts = availableProducts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const categories = ProductService.getCategories();

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products]);

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts([]);
      setSearchResultCount(0);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = availableProducts.filter(product => 
      product.title.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredProducts(filtered);
    setSearchResultCount(filtered.length);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Browse', {
        screen: 'BrowseMain',
        params: { initialSearchQuery: searchQuery }
      });
    }
  };

  // Header Component with Menu and Logo
  const Header = () => (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      <View style={styles.topNavBar}>
        <CollapsibleMenu navigation={navigation} />
        
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoIcon}>🛒</Text>
          </View>
          <Text style={styles.logoText}>EcoFinds</Text>
        </View>
        
        <View style={styles.headerActions}>
          {user ? (
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => navigation.navigate('Cart')}
            >
              <Text style={styles.cartIcon}>🛒</Text>
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('AuthStack', { screen: 'Login' })}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.brandingSection}>
        <Text style={styles.welcomeText}>
          {user ? `Welcome back, ${user.username}!` : 'Welcome to EcoFinds'} 👋
        </Text>
        <Text style={styles.tagline}>
          Discover unique pre-loved treasures and give items a second life
        </Text>
      </View>
    </View>
  );

  // Search Bar Component
  const SearchBar = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
      {searchQuery.length > 0 && (
        <Text style={styles.searchResults}>
          {searchResultCount === 0 
            ? `No products found for "${searchQuery}"` 
            : `${searchResultCount} ${searchResultCount === 1 ? 'product' : 'products'} found`
          }
        </Text>
      )}
    </View>
  );

  // Banner Image Component
  const BannerImage = () => (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerImagePlaceholder}>
        <Text style={styles.bannerText}>Banner Image</Text>
      </View>
    </View>
  );

  // Category Card Component
  const CategoryCard: React.FC<{ category: any; onPress: () => void }> = ({ category, onPress }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <Text style={styles.categoryIcon}>{category.icon || '📦'}</Text>
      <Text style={styles.categoryLabel}>{category.label}</Text>
    </TouchableOpacity>
  );

  // All Categories Section
  const AllCategoriesSection = () => (
    <View style={styles.categoriesSection}>
      <TouchableOpacity 
        style={styles.allCategoriesButton}
        onPress={() => navigation.navigate('Browse')}
      >
        <Text style={styles.allCategoriesText}>All Categories</Text>
      </TouchableOpacity>
      
      <View style={styles.categoriesGrid}>
        {categories.slice(0, 6).map((category, index) => (
          <CategoryCard
            key={category.value}
            category={{...category, icon: ['📱', '👔', '🏠', '📚', '🎮', '⚽'][index]}}
            onPress={() => navigation.navigate('Browse', {
              screen: 'BrowseMain',
              params: { selectedCategory: category.value }
            })}
          />
        ))}
      </View>
    </View>
  );

  // Product Card for grid display
  const ProductCard: React.FC<{ product: any }> = ({ product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('Browse', {
        screen: 'ProductDetail',
        params: { productId: product.id }
      })}
    >
      <View style={styles.productImagePlaceholder}>
        <Text style={styles.productImageIcon}>📦</Text>
      </View>
      <Text style={styles.productTitle} numberOfLines={2}>
        {product.title}
      </Text>
      <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  // Stats Section
  const StatsSection = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{availableProducts.length}</Text>
        <Text style={styles.statLabel}>Products Available</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{cart.length}</Text>
        <Text style={styles.statLabel}>Items in Cart</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{user ? products.filter(p => p.sellerId === user.id).length : 0}</Text>
        <Text style={styles.statLabel}>Your Listings</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header />
      <SearchBar />
      <BannerImage />
      <StatsSection />
      <AllCategoriesSection />
      
      {/* Show search results if searching */}
      {searchQuery.length > 0 && filteredProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalProductsList}>
            {filteredProducts.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Recent Listings */}
      {recentProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalProductsList}>
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Benefits Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose EcoFinds?</Text>
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🌱</Text>
            <Text style={styles.benefitText}>Eco-Friendly Shopping</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>💰</Text>
            <Text style={styles.benefitText}>Great Deals</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🤝</Text>
            <Text style={styles.benefitText}>Community Driven</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>♻️</Text>
            <Text style={styles.benefitText}>Reduce Waste</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header Styles
  headerContainer: {
    backgroundColor: '#4CAF50',
    paddingTop: StatusBar.currentHeight || 0,
  },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoIcon: {
    fontSize: 18,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartIcon: {
    fontSize: 24,
    color: 'white',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  brandingSection: {
    padding: 20,
    paddingTop: 15,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },

  // Search Styles
  searchSection: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    padding: 8,
  },
  searchButtonIcon: {
    fontSize: 20,
    color: '#666',
  },
  searchResults: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },

  // Banner Styles
  bannerContainer: {
    margin: 20,
    marginBottom: 10,
  },
  bannerImagePlaceholder: {
    height: 180,
    backgroundColor: '#2c3e50',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },

  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Categories Styles
  categoriesSection: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  allCategoriesButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  allCategoriesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (screenWidth - 60) / 3,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Section Styles
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  horizontalProductsList: {
    paddingLeft: 15,
  },

  // Product Card Styles
  productCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginRight: 15,
    marginLeft: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 90,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImageIcon: {
    fontSize: 32,
    color: '#999',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    height: 35,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },

  // Benefits Styles
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  benefitItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  benefitIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },

  bottomSpacer: {
    height: 20,
  },
});
