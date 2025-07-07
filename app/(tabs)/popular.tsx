import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Get screen dimensions for responsive grid
const { width: screenWidth } = Dimensions.get("window");
const numColumns = 2;
const itemMargin = 8;
const itemSize = (screenWidth - (numColumns + 1) * itemMargin) / numColumns;

// Mock data interface
interface FoodItem {
  id: string;
  image_url: string;
  name: string;
  price: number;
}

const Popular: React.FC = () => {
   const router = useRouter();
  // ✅ Use FoodData as you had it
  const [FoodData, setFoodData] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isToggled, setIsToggled] = useState(false);

  // ✅ Update handleItemPress to navigate to post details
  const handleItemPress = (item: FoodItem) => {
    console.log('Navigating to post details:', item.id, item.name);
    router.push(`/(screens)/postDetails?id=${item.id}`);
  };

  // ✅ Function to fetch posts and convert them to FoodData format
  const fetchFoodData = async () => {
    try {
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        Alert.alert("Error", "Failed to load food data");
        return;
      }

      // ✅ Convert posts to FoodData format
      const foodItems: FoodItem[] = posts.map((post) => ({
        id: post.id,
        image_url:
          post.image_url ||
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop", // fallback image
        name: post.title,
        price: post.price || 0,
      }));

      setFoodData(foodItems);
      console.log("Fetched food data:", foodItems.length, "items");
    } catch (error) {
      console.error("Error in fetchFoodData:", error);
      Alert.alert("Error", "Something went wrong while loading food data");
    }
  };

  // ✅ Function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFoodData();
    setRefreshing(false);
  };

  // ✅ Fetch data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchFoodData();
      setLoading(false);
    };

    loadData();
  }, []);



  const renderFoodItem = ({
    item,
    index,
  }: {
    item: FoodItem;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
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
              <Text style={styles.foodPrice}>₦{item.price.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#fff"
          translucent={false}
        />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Foodma</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="green" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <View style={styles.header}>
        <TextInput
          style={{
            flex: 1,
            fontSize: 14,
            color: "#333",
            paddingVertical: 8,
            height: 40,
            // borderColor: "#F0F0F0",
            backgroundColor: "#F0F0F0",
            // borderWidth: 1,
            borderRadius: 40,
            paddingHorizontal: 10,
          }}
          placeholder="Search for cusines and dishes"
          placeholderTextColor="#888"
          numberOfLines={1}
        />
        <View 
        style={{ paddingHorizontal:10, flexDirection: "column", gap: 4}}
        >
          <Text style={{ marginLeft: 6, fontSize: 14, color: "#888" }}>
            Near me
          </Text>
          <TouchableOpacity
            style={{
              width: 50,
              height: 28,
              backgroundColor: isToggled ? "green" : "#ccc",
              borderRadius: 14,
              padding: 2,
              marginLeft: 8,
              justifyContent: "center",
            }}
            onPress={() => {
              setIsToggled(!isToggled);
              console.log("Toggle pressed, new state:", !isToggled);
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: "#fff",
                borderRadius: 12,
                alignSelf: isToggled ? "flex-end" : "flex-start",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={FoodData}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["green"]}
            tintColor="green"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 40, // Add padding to avoid content being cut off
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow   
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "green",
  },
  listContainer: {
    padding: itemMargin,
  },
  row: {
    justifyContent: "space-between",
  },
  itemContainer: {
    width: itemSize,
    marginBottom: itemMargin,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: itemSize * 1.6, // Adjust height for better aspect ratio
  },
  foodImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 5,
    left: 4,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 6,
    width: 100,
    borderRadius: 10,
  },
  textContainer: {
    flexDirection: "column",
  },
  foodName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  foodPrice: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
    opacity: 0.9,
  },
  // ✅ Added loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});

export default Popular;
