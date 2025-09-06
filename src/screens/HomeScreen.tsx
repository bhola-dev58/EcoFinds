import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { products, cart } = useApp();

  const availableProducts = products.filter(p => p.isAvailable);
  const recentProducts = availableProducts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
  }> = ({ title, description, icon, onPress }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionDescription}>{description}</Text>
    </TouchableOpacity>
  );

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome{user ? `, ${user.username}` : ' to EcoFinds'}! 👋
        </Text>
        <Text style={styles.tagline}>
          Discover unique pre-loved treasures and give items a second life
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{availableProducts.length}</Text>
          <Text style={styles.statLabel}>Available Products</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{cart.length}</Text>
          <Text style={styles.statLabel}>Items in Cart</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <QuickActionCard
            title="Browse Products"
            description="Explore marketplace"
            icon="🏪"
            onPress={() => navigation.navigate('Browse')}
          />
          <QuickActionCard
            title="List Product"
            description="Sell your items"
            icon="➕"
            onPress={() => navigation.navigate('AddProduct')}
          />
        </View>
      </View>

      {recentProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        </View>
      )}

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
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
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  productCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
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
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImageIcon: {
    fontSize: 32,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    height: 35,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  benefitItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 15,
  },
  benefitIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});
