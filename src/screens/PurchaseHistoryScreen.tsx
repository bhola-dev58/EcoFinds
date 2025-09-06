import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { ProductService } from '@/services/productService';
import { Purchase } from '@/types';

interface PurchaseHistoryScreenProps {
  navigation: any;
}

export const PurchaseHistoryScreen: React.FC<PurchaseHistoryScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, [user]);

  const loadPurchases = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userPurchases = await ProductService.getPurchasesByUser(user.id);
      // Sort by purchase date (most recent first)
      const sortedPurchases = userPurchases.sort(
        (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      );
      setPurchases(sortedPurchases);
    } catch (error) {
      console.error('Failed to load purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPurchases();
    setRefreshing(false);
  };

  const getCategoryLabel = (categoryValue: string): string => {
    const categories = ProductService.getCategories();
    const categoryItem = categories.find(cat => cat.value === categoryValue);
    return categoryItem ? categoryItem.label : 'Other';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getTotalSpent = (): number => {
    return purchases.reduce((total, purchase) => total + purchase.price, 0);
  };

  const PurchaseCard: React.FC<{ purchase: Purchase }> = ({ purchase }) => (
    <TouchableOpacity
      style={styles.purchaseCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: purchase.productId })}
    >
      <View style={styles.purchaseHeader}>
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productImageIcon}>📦</Text>
        </View>
        
        <View style={styles.purchaseInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {purchase.product.title}
          </Text>
          <Text style={styles.productCategory}>
            {getCategoryLabel(purchase.product.category)}
          </Text>
          <Text style={styles.purchasePrice}>${purchase.price.toFixed(2)}</Text>
        </View>

        <View style={styles.purchaseStatus}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(purchase.status) }
            ]}
          >
            {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.purchaseFooter}>
        <Text style={styles.purchaseDate}>
          Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}
        </Text>
        <Text style={styles.purchaseId}>
          Order #{purchase.id.slice(-8).toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>No Purchases Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Your purchase history will appear here when you start buying products from the marketplace.
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('Browse')}
      >
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.loginPrompt}>
        <Text style={styles.loginPromptIcon}>🔒</Text>
        <Text style={styles.loginPromptTitle}>Please log in</Text>
        <Text style={styles.loginPromptSubtitle}>
          You need to be logged in to view your purchase history
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('AuthStack')}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your purchases...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Purchase History</Text>
        <Text style={styles.subtitle}>
          {purchases.length} {purchases.length === 1 ? 'purchase' : 'purchases'}
        </Text>
      </View>

      {purchases.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Spent</Text>
          <Text style={styles.summaryAmount}>${getTotalSpent().toFixed(2)}</Text>
          <Text style={styles.summarySubtext}>
            Across {purchases.length} {purchases.length === 1 ? 'purchase' : 'purchases'}
          </Text>
        </View>
      )}

      {purchases.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={styles.purchasesList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {purchases.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))}
        </ScrollView>
      )}
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  summaryCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#999',
  },
  purchasesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  purchaseCard: {
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
  purchaseHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productImageIcon: {
    fontSize: 24,
  },
  purchaseInfo: {
    flex: 1,
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
  purchasePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  purchaseStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  purchaseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  purchaseDate: {
    fontSize: 14,
    color: '#666',
  },
  purchaseId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
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
  browseButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginPromptIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  loginPromptSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
