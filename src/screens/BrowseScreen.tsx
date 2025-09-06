import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  RefreshControl,
} from 'react-native';
import { useApp } from '@/context/AppContext';
import { ProductService } from '@/services/productService';
import { Product, ProductCategory } from '@/types';

interface BrowseScreenProps {
  navigation: any;
}

export const BrowseScreen: React.FC<BrowseScreenProps> = ({ navigation }) => {
  const { products, addToCart } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ProductService.getCategories();

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const filterProducts = () => {
    let filtered = products.filter(product => product.isAvailable);

    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // The products will be refreshed through the AppContext
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const getCategoryLabel = (categoryValue: ProductCategory | null): string => {
    if (!categoryValue) return 'All Categories';
    const categoryItem = categories.find(cat => cat.value === categoryValue);
    return categoryItem ? categoryItem.label : 'All Categories';
  };

  const CategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter by Category</Text>
          <ScrollView style={styles.categoryList}>
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedCategory === null && styles.selectedCategory,
              ]}
              onPress={() => {
                setSelectedCategory(null);
                setShowCategoryModal(false);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === null && styles.selectedCategoryText,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryItem,
                  selectedCategory === cat.value && styles.selectedCategory,
                ]}
                onPress={() => {
                  setSelectedCategory(cat.value);
                  setShowCategoryModal(false);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.value && styles.selectedCategoryText,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowCategoryModal(false)}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <View style={styles.productImagePlaceholder}>
        <Text style={styles.productImageIcon}>📦</Text>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.productCategory}>
          {getCategoryLabel(product.category)}
        </Text>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() => handleAddToCart(product)}
      >
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🔍</Text>
      <Text style={styles.emptyStateTitle}>
        {searchQuery || selectedCategory ? 'No Results Found' : 'No Products Available'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery || selectedCategory
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'Be the first to list a product in the marketplace!'}
      </Text>
      {(searchQuery || selectedCategory) && (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse Products</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            returnKeyType="search"
          />
        </View>

        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={styles.categoryFilter}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.categoryFilterText}>
              {getCategoryLabel(selectedCategory)}
            </Text>
            <Text style={styles.categoryFilterArrow}>▼</Text>
          </TouchableOpacity>

          {(searchQuery || selectedCategory) && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          {searchQuery && ` for "${searchQuery}"`}
        </Text>
      </View>

      <ScrollView
        style={styles.productsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </ScrollView>

      <CategoryModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryFilter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#333',
  },
  categoryFilterArrow: {
    fontSize: 10,
    color: '#666',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  productsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  productImageIcon: {
    fontSize: 32,
  },
  productInfo: {
    flex: 1,
    marginBottom: 15,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  clearFiltersButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#E8F5E8',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  modalCloseButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
});
