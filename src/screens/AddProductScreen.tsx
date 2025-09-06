import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ProductService } from '@/services/productService';
import { ProductCategory } from '@/types';

interface AddProductScreenProps {
  navigation: any;
}

export const AddProductScreen: React.FC<AddProductScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { createProduct } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('other');
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = ProductService.getCategories();

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a product');
      return;
    }

    if (!title.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (title.trim().length < 3) {
      Alert.alert('Error', 'Product title must be at least 3 characters long');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Error', 'Product description must be at least 10 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const success = await createProduct({
        title: title.trim(),
        description: description.trim(),
        price: priceValue,
        category,
        sellerId: user.id,
        imageUrl: undefined, // Placeholder for future image functionality
        isAvailable: true,
      });

      if (success) {
        Alert.alert('Success', 'Product listed successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        // Reset form
        setTitle('');
        setDescription('');
        setPrice('');
        setCategory('other');
      } else {
        Alert.alert('Error', 'Failed to create product listing. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create product listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (categoryValue: ProductCategory): string => {
    const categoryItem = categories.find(cat => cat.value === categoryValue);
    return categoryItem ? categoryItem.label : 'Other';
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
          <Text style={styles.modalTitle}>Select Category</Text>
          <ScrollView style={styles.categoryList}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryItem,
                  category === cat.value && styles.selectedCategory,
                ]}
                onPress={() => {
                  setCategory(cat.value);
                  setShowCategoryModal(false);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.value && styles.selectedCategoryText,
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
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>List Your Product</Text>
        <Text style={styles.subtitle}>Share your pre-loved items with the community</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What are you selling?"
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your product, its condition, and any other relevant details..."
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Price ($) *</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.categorySelectorText}>
              {getCategoryLabel(category)}
            </Text>
            <Text style={styles.categorySelectorArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderIcon}>📷</Text>
          <Text style={styles.imagePlaceholderText}>
            Image upload coming soon!
          </Text>
          <Text style={styles.imagePlaceholderSubtext}>
            For now, your listing will use a placeholder image
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Creating Listing...' : 'List Product'}
          </Text>
        </TouchableOpacity>
      </View>

      <CategoryModal />
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
  formContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#333',
  },
  categorySelectorArrow: {
    fontSize: 12,
    color: '#666',
  },
  imagePlaceholder: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  imagePlaceholderIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  imagePlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 5,
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
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
