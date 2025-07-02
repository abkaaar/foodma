import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserAuthStore } from "../../hooks/useAuthStore";

interface PostData {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  imageUri?: string;
  price?: string;
}

const FOOD_CATEGORIES = [
  "🍕 Italian",
  "🍔 Fast Food",
  "🍣 Japanese",
  "🌮 Mexican",
  "🥗 Healthy",
  "🍝 Pasta",
  "🥩 Steakhouse",
  "🍜 Asian",
  "🥪 Sandwiches",
  "🍰 Desserts",
  "☕ Cafe",
  "🍺 Bar & Grill",
];

export default function CreatePost() {
  const [postData, setPostData] = useState<PostData>({
    title: "",
    description: "",
    category: "",
    location: "",
    price: "",
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { user, isAuthenticated } = useUserAuthStore();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "You need to be logged in to create a post",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  }, [isAuthenticated]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/you");
    }
  };

  // Image picker function
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission required",
        "Permission to access camera roll is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Take photo function
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission required",
        "Permission to access camera is required!"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Permission to access location was denied"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address[0]) {
        const formattedAddress = `${address[0].street || ""} ${
          address[0].city || ""
        }, ${address[0].region || ""}`.trim();
        setPostData((prev) => ({
          ...prev,
          location: formattedAddress,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setGettingLocation(false);
    }
  };

  // Image picker options
  const showImageOptions = () => {
    Alert.alert("Select Image", "Choose how you want to add an image", [
      { text: "Camera", onPress: takePhoto },
      { text: "Gallery", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  //   // Upload image to Supabase storage

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      console.log("Starting image upload for URI:", uri);

      // ✅ Better file extension detection
      let fileExt = "jpg"; // default
      let contentType = "image/jpeg"; // default

      // Extract extension from URI more reliably
      if (uri.includes(".")) {
        const extractedExt = uri.split(".").pop()?.toLowerCase();
        if (
          extractedExt &&
          ["jpg", "jpeg", "png", "gif", "webp"].includes(extractedExt)
        ) {
          fileExt = extractedExt === "jpg" ? "jpeg" : extractedExt; // normalize jpg to jpeg
          contentType = `image/${fileExt}`;
        }
      }

      // ✅ For React Native image picker, check if it's from camera/library
      if (uri.startsWith("file://") || uri.startsWith("content://")) {
        // This is likely from image picker, default to jpeg if no extension
        fileExt = "jpeg";
        contentType = "image/jpeg";
      }

      console.log(
        "Detected file extension:",
        fileExt,
        "Content type:",
        contentType
      );

      // ✅ Create FormData for React Native (better than blob for mobile)
      const formData = new FormData();

      // ✅ Proper file object for React Native
      const fileObject = {
        uri: uri,
        type: contentType,
        name: `image.${fileExt}`,
      } as any;

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `posts/${user?.id}/${fileName}`;

      console.log("Uploading to path:", filePath);

      // ✅ Upload using the file object directly (React Native way)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, fileObject, {
          cacheControl: "3600",
          upsert: false,
          contentType: contentType,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("Upload successful:", uploadData);

      // ✅ Get public URL
      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      console.log("Public URL generated:", urlData.publicUrl);

      if (!urlData.publicUrl) {
        throw new Error("Failed to generate public URL");
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);

      // ✅ More specific error handling
      if (error instanceof Error) {
        if (error.message.includes("row-level security")) {
          Alert.alert(
            "Upload Error",
            "Permission denied. Please check your login status."
          );
        } else if (error.message.includes("bucket")) {
          Alert.alert(
            "Upload Error",
            "Storage configuration issue. Please contact support."
          );
        } else if (error.message.includes("Invalid file")) {
          Alert.alert(
            "Upload Error",
            "Invalid file format. Please select a valid image."
          );
        } else {
          Alert.alert(
            "Upload Error",
            `Failed to upload image: ${error.message}`
          );
        }
      } else {
        Alert.alert("Upload Error", "Unknown error occurred during upload");
      }

      return null;
    }
  };

  // Create post function
  const handleCreatePost = async () => {
    if (!postData.title.trim()) {
      Alert.alert("Error", "Please enter a title for your post");
      return;
    }

    if (!postData.description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }

    if (!postData.category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          Alert.alert(
            "Error",
            "Failed to upload image. Post will be created without image."
          );
        }
      }

      // Create post in database
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: postData.title.trim(),
          description: postData.description.trim(),
          category: postData.category,
          location: postData.location.trim() || null,
          latitude: postData.latitude || null,
          longitude: postData.longitude || null,
          price: postData.price ? parseFloat(postData.price) : null,
          image_url: imageUrl,
          user_id: user?.id,
          username: user?.username,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        Alert.alert("Error", "Failed to create post. Please try again.");
        return;
      }

      Alert.alert("Success", "Your post has been created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Category selection
  const selectCategory = (category: string) => {
    setPostData((prev) => ({ ...prev, category }));
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <Stack.Screen
        name="createPost"
        // component={CreatePostScreen}
        options={{
          headerShown: false, // This hides the default header
        }}
      />

        {/* Custom Header */}
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => router.back()}
    >
      <Ionicons name="arrow-back" size={24} color="#000" />
    </TouchableOpacity>
    
    <Text style={styles.headerTitle}>Create Post</Text>
    
    <TouchableOpacity
      style={[styles.publishButton, isLoading && styles.disabledButton]}
      onPress={handleCreatePost}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.publishButtonText}>Post</Text>
      )}
    </TouchableOpacity>
  </View>

      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={[styles.publishButton, isLoading && styles.disabledButton]}
          onPress={handleCreatePost}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.publishButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View> */}

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Photo</Text>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={showImageOptions}
              >
                <Ionicons name="camera" size={32} color="#666" />
                <Text style={styles.imagePickerText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What's the name of this place or dish?"
              value={postData.title}
              onChangeText={(text) =>
                setPostData((prev) => ({ ...prev, title: text }))
              }
              maxLength={100}
              editable={!isLoading}
            />
            <Text style={styles.characterCount}>
              {postData.title.length}/100
            </Text>
          </View>

          {/* Category Selection */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryContainer}>
              {FOOD_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    postData.category === category && styles.selectedCategory,
                  ]}
                  onPress={() => selectCategory(category)}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      postData.category === category &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Input (Optional) */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Price (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price (e.g., 15.99)"
              value={postData.price}
              onChangeText={(text) =>
                setPostData((prev) => ({ ...prev, price: text }))
              }
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
          </View>

          {/* Location Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter location or tap location button"
                value={postData.location}
                onChangeText={(text) =>
                  setPostData((prev) => ({ ...prev, location: text }))
                }
                editable={!isLoading && !gettingLocation}
                multiline
              />
              <TouchableOpacity
                style={styles.locationButton}
                onPress={getCurrentLocation}
                disabled={gettingLocation || isLoading}
              >
                {gettingLocation ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Ionicons name="location" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Tell us about this place, the food, your experience..."
              value={postData.description}
              onChangeText={(text) =>
                setPostData((prev) => ({ ...prev, description: text }))
              }
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
              editable={!isLoading}
            />
            <Text style={styles.characterCount}>
              {postData.description.length}/500
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    paddingHorizontal: 20,
    
  },
   backButton: {
    
  },
  publishButton: {
    backgroundColor: "green",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
   headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  publishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  selectedImageContainer: {
    position: "relative",
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  imagePickerButton: {
    height: 120,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
  },
  inputSection: {
    marginBottom: 20,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 5,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  selectedCategory: {
    backgroundColor: "green",
    borderColor: "green",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  locationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    minHeight: 50,
  },
  locationButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 10,
    backgroundColor: "#f0f8ff",
  },
});
