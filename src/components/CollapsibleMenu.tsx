import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';

interface CollapsibleMenuProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const CollapsibleMenu: React.FC<CollapsibleMenuProps> = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-screenWidth));
  const { user } = useAuth();

  const toggleMenu = () => {
    if (isVisible) {
      // Close menu
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    } else {
      // Open menu
      setIsVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMenuItemPress = (screen: string, params?: any) => {
    toggleMenu();
    setTimeout(() => {
      if (screen === 'MyProducts') {
        navigation.navigate('Profile', {
          screen: 'MyProducts'
        });
      } else if (screen === 'AddProduct') {
        navigation.navigate('AddProduct');
      } else if (screen === 'About') {
        navigation.navigate('About');
      } else if (screen === 'Contact') {
        navigation.navigate('Contact');
      } else {
        navigation.navigate(screen, params);
      }
    }, 100);
  };

  const MenuIcon = () => (
    <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
    </TouchableOpacity>
  );

  const MenuItem: React.FC<{ title: string; icon: string; onPress: () => void }> = ({ title, icon, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <MenuIcon />
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={toggleMenu}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={toggleMenu}
          />
          <Animated.View 
            style={[
              styles.menuContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>EcoFinds</Text>
              <TouchableOpacity onPress={toggleMenu}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.menuContent}>
              {user && (
                <MenuItem
                  title="My Listings"
                  icon="📋"
                  onPress={() => handleMenuItemPress('MyProducts')}
                />
              )}
              
              <MenuItem
                title="Add Product"
                icon="➕"
                onPress={() => handleMenuItemPress('AddProduct')}
              />
              
              <MenuItem
                title="Browse"
                icon="🏪"
                onPress={() => handleMenuItemPress('Browse')}
              />
              
              <MenuItem
                title="About"
                icon="ℹ️"
                onPress={() => handleMenuItemPress('About')}
              />
              
              <MenuItem
                title="Contact"
                icon="📧"
                onPress={() => handleMenuItemPress('Contact')}
              />

              {!user && (
                <>
                  <View style={styles.separator} />
                  <MenuItem
                    title="Login"
                    icon="🔐"
                    onPress={() => navigation.navigate('AuthStack', { screen: 'Login' })}
                  />
                  <MenuItem
                    title="Sign Up"
                    icon="👤"
                    onPress={() => navigation.navigate('AuthStack', { screen: 'Register' })}
                  />
                </>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  hamburgerLine: {
    width: 25,
    height: 3,
    backgroundColor: '#333',
    marginVertical: 2,
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
  },
  menuContainer: {
    width: screenWidth * 0.8,
    maxWidth: 300,
    backgroundColor: 'white',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4CAF50',
    borderBottomWidth: 1,
    borderBottomColor: '#45a049',
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  menuContent: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 25,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
    marginHorizontal: 20,
  },
});
