import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { useAuth } from '@/context/AuthContext';

// Import screens
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { BrowseScreen } from '@/screens/BrowseScreen';
import { AddProductScreen } from '@/screens/AddProductScreen';
import { CartScreen } from '@/screens/CartScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { MyProductsScreen } from '@/screens/MyProductsScreen';
import { PurchaseHistoryScreen } from '@/screens/PurchaseHistoryScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';

// Import types
import { RootStackParamList, AuthStackParamList, MainTabsParamList } from '@/types';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabsParamList>();
const ProfileStack = createStackNavigator();
const BrowseStack = createStackNavigator();

// Tab bar icon component (using emoji for simplicity)
const TabIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => {
  const getIcon = () => {
    switch (name) {
      case 'Home':
        return '🏠';
      case 'Browse':
        return '🏪';
      case 'AddProduct':
        return '➕';
      case 'Cart':
        return '🛒';
      case 'Profile':
        return '👤';
      default:
        return '📱';
    }
  };

  return (
    <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
      {getIcon()}
    </Text>
  );
};

// Auth Stack Navigator
const AuthStackNavigator: React.FC = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4CAF50',
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <AuthStack.Screen
      name="Login"
      component={LoginScreen}
      options={{ title: 'Sign In' }}
    />
    <AuthStack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Sign Up' }}
    />
  </AuthStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator: React.FC = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4CAF50',
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <ProfileStack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <ProfileStack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
    <ProfileStack.Screen
      name="MyProducts"
      component={MyProductsScreen}
      options={{ title: 'My Products' }}
    />
    <ProfileStack.Screen
      name="PurchaseHistory"
      component={PurchaseHistoryScreen}
      options={{ title: 'Purchase History' }}
    />
  </ProfileStack.Navigator>
);

// Browse Stack Navigator
const BrowseStackNavigator: React.FC = () => (
  <BrowseStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4CAF50',
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <BrowseStack.Screen
      name="BrowseMain"
      component={BrowseScreen}
      options={{ title: 'Browse Products' }}
    />
    <BrowseStack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{ title: 'Product Details' }}
    />
  </BrowseStack.Navigator>
);

// Main Tabs Navigator
const MainTabsNavigator: React.FC = () => (
  <MainTabs.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: '#999',
      headerShown: false,
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 5,
        paddingBottom: 5,
        height: 60,
      },
    })}
    }}>
    <MainTabs.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Home',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <MainTabs.Screen
      name="Browse"
      component={BrowseStackNavigator}
      options={{ title: 'Browse' }}
    />
    <MainTabs.Screen
      name="AddProduct"
      component={AddProductScreen}
      options={{
        title: 'Sell',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <MainTabs.Screen
      name="Cart"
      component={CartScreen}
      options={{
        title: 'Cart',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <MainTabs.Screen
      name="Profile"
      component={ProfileStackNavigator}
      options={{ title: 'Profile' }}
    />
  </MainTabs.Navigator>
);

// Root Navigator
const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // You could show a loading screen here
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
      ) : (
        <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
};

// Main App Navigator Component
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};
