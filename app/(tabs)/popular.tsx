import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');
const numColumns = width > 600 ? 3 : 2; // 3 columns on tablets, 2 on phones
const itemSize = (width - 30 - (numColumns - 1) * 10) / numColumns; // Account for padding and gaps

// Mock data interface
interface FoodItem {
  id: string;
  image_url: string;
  name: string;
  price: number;
}

// Mock data - 15 food items
const mockFoodData: FoodItem[] = [
  {
    id: '1',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
    name: 'Margherita Pizza',
    price: 12.99,
  },
  {
    id: '2',
    image_url: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=400&fit=crop',
    name: 'Cheeseburger',
    price: 9.99,
  },
  {
    id: '3',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
    name: 'Caesar Salad',
    price: 8.50,
  },
  {
    id: '4',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
    name: 'Pasta Carbonara',
    price: 14.99,
  },
  {
    id: '5',
    image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop',
    name: 'Chicken Tacos',
    price: 11.99,
  },
  {
    id: '6',
    image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop',
    name: 'Avocado Toast',
    price: 7.99,
  },
  {
    id: '7',
    image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop',
    name: 'Chicken Sandwich',
    price: 10.50,
  },
  {
    id: '8',
    image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop',
    name: 'Greek Salad',
    price: 9.50,
  },
  {
    id: '9',
    image_url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=400&fit=crop',
    name: 'BBQ Ribs',
    price: 18.99,
  },
  {
    id: '10',
    image_url: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=400&fit=crop',
    name: 'Fish & Chips',
    price: 13.99,
  },
  {
    id: '11',
    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop',
    name: 'Veggie Burger',
    price: 11.50,
  },
  {
    id: '12',
    image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop',
    name: 'Grilled Steak',
    price: 22.99,
  },
  {
    id: '13',
    image_url: 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=400&h=400&fit=crop',
    name: 'Chicken Wings',
    price: 12.50,
  },
  {
    id: '14',
    image_url: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop',
    name: 'Sushi Roll',
    price: 16.99,
  },
  {
    id: '15',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
    name: 'Pepperoni Pizza',
    price: 14.50,
  },
];

const Popular: React.FC = () => {
  const handleItemPress = (item: FoodItem) => {
    console.log('Pressed item:', item.id, item.name);
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { width: itemSize }]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.foodImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.textContainer}>
            <Text style={styles.foodName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.foodPrice}>
              ${item.price.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>
      
      <FlatList
        data={mockFoodData}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 15,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: itemSize * 1.2, // Slightly taller for better aspect ratio
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  textContainer: {
    flexDirection: 'column',
  },
  foodName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  foodPrice: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
  },
  separator: {
    height: 10,
  },
});

export default Popular;