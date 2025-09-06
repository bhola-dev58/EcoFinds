import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ProductService } from '@/services/productService';
import { Product } from '@/types';

interface MyProductsScreenProps {
  navigation: any;
}

export const MyProductsScreen: React.FC<MyProductsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { deleteProduct } = useApp();
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyProducts();
  }, [user]);

  const loadMyProducts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const products = await ProductService.getProductsBySeller(user.id);
      setMyProducts(products);
    } catch (error) {
      console.error('Failed to load products:', error);
      Alert.alert('Error', 'Failed to load your products');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyProducts();
    setRefreshing(false);
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteProduct(product.id);
              if (success) {
                setMyProducts(prev => prev.filter(p => p.id !== product.id));
                Alert.alert('Success', 'Product deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete product');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleEditProduct = (product: Product) => {
    navigation.navigate('EditProduct', { productId: product.id });
  };

  const getCategoryLabel = (categoryValue: string): string => {
    const categories = ProductService.getCategories();
    const categoryItem = categories.find(cat => cat.value === categoryValue);
    return categoryItem ? categoryItem.label : 'Other';
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <View style={styles.productCard}>
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
        <Text
          style={[
            styles.productStatus,
            product.isAvailable ? styles.availableStatus : styles.soldStatus,
          ]}
        >
          {product.isAvailable ? 'Available' : 'Sold'}
        </Text>
        <Text style={styles.productDate}>
          Listed {new Date(product.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditProduct(product)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(product)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📦</Text>
      <Text style={styles.emptyStateTitle}>No Products Listed</Text>
      <Text style={styles.emptyStateSubtitle}>
        You haven't listed any products yet. Start selling by creating your first listing!
      </Text>
      <TouchableOpacity
        style={styles.addProductButton}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.addProductButtonText}>List Your First Product</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your products...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Products</Text>
        <Text style={styles.subtitle}>
          {myProducts.length} {myProducts.length === 1 ? 'product' : 'products'} listed
        </Text>
      </View>

      {myProducts.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={styles.productsList}>
          {myProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      )}

      {myProducts.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Text style={styles.addMoreButtonText}>+ Add Another Product</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  productsList: {
    paddingHorizontal: 20,
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
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  productImageIcon: {
    fontSize: 24,
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
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  productStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  availableStatus: {
    color: '#4CAF50',
  },
  soldStatus: {
    color: '#ff6b6b',
  },
  productDate: {
    fontSize: 12,
    color: '#999',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  deleteButtonText: {
    color: 'white',
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
  addProductButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  addProductButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  addMoreButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  addMoreButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});
