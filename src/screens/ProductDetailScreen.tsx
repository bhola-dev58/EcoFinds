import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { ProductService } from '@/services/productService';
import { Product } from '@/types';

interface ProductDetailScreenProps {
  navigation: any;
  route: any;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ navigation, route }) => {
  const { productId } = route.params;
  const { user } = useAuth();
  const { addToCart, purchaseProduct } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const productData = await ProductService.getProductById(productId);
      setProduct(productData);
    } catch (error) {
      console.error('Failed to load product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart(product);
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const handlePurchaseNow = async () => {
    if (!product || !user) return;

    if (product.sellerId === user.id) {
      Alert.alert('Error', 'You cannot purchase your own product');
      return;
    }

    Alert.alert(
      'Purchase Product',
      `Are you sure you want to purchase "${product.title}" for $${product.price.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              const success = await purchaseProduct(product.id);
              if (success) {
                Alert.alert('Success', 'Product purchased successfully!', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert('Error', 'Failed to purchase product');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to purchase product');
            }
          },
        },
      ]
    );
  };

  const getCategoryLabel = (categoryValue: string): string => {
    const categories = ProductService.getCategories();
    const categoryItem = categories.find(cat => cat.value === categoryValue);
    return categoryItem ? categoryItem.label : 'Other';
  };

  const isOwnProduct = user && product && product.sellerId === user.id;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productImageIcon}>📦</Text>
          <Text style={styles.imagePlaceholderText}>Product Image</Text>
        </View>
      </View>

      <View style={styles.productInfo}>
        <View style={styles.titleSection}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
        </View>

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Category:</Text>
            <Text style={styles.metaValue}>{getCategoryLabel(product.category)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Status:</Text>
            <Text
              style={[
                styles.metaValue,
                product.isAvailable ? styles.availableStatus : styles.soldStatus,
              ]}
            >
              {product.isAvailable ? 'Available' : 'Sold'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Listed:</Text>
            <Text style={styles.metaValue}>
              {new Date(product.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
        </View>

        {isOwnProduct && (
          <View style={styles.ownerNotice}>
            <Text style={styles.ownerNoticeText}>
              This is your product listing
            </Text>
          </View>
        )}

        {!isOwnProduct && product.isAvailable && user && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.addToCartButton]}
              onPress={handleAddToCart}
            >
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.purchaseButton]}
              onPress={handlePurchaseNow}
            >
              <Text style={styles.buttonText}>Purchase Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {!product.isAvailable && (
          <View style={styles.soldNotice}>
            <Text style={styles.soldNoticeText}>
              This product has been sold
            </Text>
          </View>
        )}

        {!user && (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>
              Please log in to purchase or add to cart
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('AuthStack')}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    backgroundColor: 'white',
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 1,
  },
  productImagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#666',
  },
  productInfo: {
    backgroundColor: 'white',
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    lineHeight: 30,
  },
  productPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  metaInfo: {
    marginBottom: 30,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 16,
    color: '#666',
  },
  metaValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  availableStatus: {
    color: '#4CAF50',
  },
  soldStatus: {
    color: '#ff6b6b',
  },
  descriptionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  addToCartButton: {
    backgroundColor: '#2196F3',
  },
  purchaseButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ownerNotice: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  ownerNoticeText: {
    fontSize: 16,
    color: '#1976D2',
    textAlign: 'center',
  },
  soldNotice: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  soldNoticeText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    fontWeight: '500',
  },
  loginPrompt: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: 16,
    color: '#F57C00',
    textAlign: 'center',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
