import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PostDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number | null;
  image_url: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  username: string;
}

export default function PostDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
// state for vendor otther posts
  const [vendorPosts, setVendorPosts] = useState<PostDetail[]>([]);
  const [vendorLoading, setVendorLoading] = useState(false);


  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setError(null);

        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching post details:", error);
          setError("Failed to load post details");
          return;
        }

        setPost(data);
      } catch (error) {
        console.error("Error in fetchPostDetails:", error);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPostDetails();
    }
  }, [id]);

// ✅ Complete the fetchMoreVendorPost function
  useEffect(() => {
    const fetchMoreVendorPost = async () => {
      if (!post?.user_id) return;

      setVendorLoading(true);
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", post.user_id)
          .neq("id", post.id) // Exclude current post
          .order("created_at", { ascending: false })
          .limit(6); // Limit to 6 more posts

        if (error) {
          console.error("Error fetching vendor posts:", error);
          return;
        }

        setVendorPosts(data || []);
        console.log(`Fetched ${data?.length || 0} more posts from this vendor`);
      } catch (error) {
        console.error("Error in fetchMoreVendorPost:", error);
      } finally {
        setVendorLoading(false);
      }
    };

    // ✅ Only fetch vendor posts after main post is loaded
    if (post?.user_id) {
      fetchMoreVendorPost();
    }
  }, [post?.user_id]); // Dependency on post.user_id


  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  const handleShare = async () => {
    if (!post) return;

    try {
      await Share.share({
        message: `Check out this food post: ${post.title}`,
        title: post.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          name="postDetails"
          options={{
            headerShown: false, // This hides the default header
          }}
        />
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="green" />
          <Text style={styles.loadingText}>Loading post details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color="#ff4444" />
          <Text style={styles.errorTitle}>Post Not Found</Text>
          <Text style={styles.errorText}>
            {error || "This post may have been deleted"}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Function to render vendor post item
  const renderVendorPost = ({ item }: { item: PostDetail }) => (
    <TouchableOpacity
      style={styles.vendorPostItem}
      onPress={() => {
        // Navigate to the selected post
        router.push(`/(screens)/postDetails?id=${item.id}`);
      }}
      activeOpacity={0.8}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.vendorPostImage} />
      ) : (
        <View style={styles.vendorPostNoImage}>
          <Ionicons name="image-outline" size={20} color="#ccc" />
        </View>
      )}
      <View style={styles.vendorPostContent}>
        <Text style={styles.vendorPostTitle} numberOfLines={2}>
          {item.title}
        </Text>
    
       
      </View>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        name="postDetails"
        options={{
          headerShown: false, // This hides the default header
        }}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image */}
        {post.image_url ? (
          <View>
            <Image source={{ uri: post.image_url }} style={styles.postImage} />
            <View
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                right: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={handleBack}
                style={{
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                style={{
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Ionicons name="share-social-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View
              style={{
                position: "absolute",
                bottom: 10,
                left: 20,
                right: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderRadius: 10,
                  padding: 5,
                }}
              >
                <Text style={{fontSize:12}}>{post.title}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                style={{
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderRadius: 10,
                  padding: 8,
                }}
              >
                <Text style={{fontSize:12}}>₦{post.price}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={64} color="#ccc" />
            <Text style={styles.noImageText}>No image available</Text>
          </View>
        )}

        {/* Post Content */}
        <View style={styles.postContent}>
          <View style={{ flex: 1, gap: 10 }}>
            {/* Title */}
            <View>
              <Text style={styles.postTitle}>{post.username}</Text>
            </View>

            {/* Location */}
            {post.location && (
              <TouchableOpacity
                style={styles.locationContainer}
                onPress={() => {
                  if (post.latitude && post.longitude) {
                    router.push({
                      pathname: "/map",
                      params: {
                        latitude: post.latitude,
                        longitude: post.longitude,
                        title: post.title,
                      },
                    });
                  }
                }}
              >
                <Text style={styles.locationText}>{post.location}</Text>
                <Ionicons name="location" size={20} color="#000" />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <TouchableOpacity
              // onPress={handleBookmark}
              style={{
                padding: 10,
                borderRadius: 50,
                backgroundColor: "#f0f0f0",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="bookmark-outline" size={26} color="#000" />
              {/* Use filled icon for bold */}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.ctaButton}>
            <Ionicons name="restaurant-outline" size={20} color="#000" />
            <Text style={styles.ctaText}>MAKE RESERVATION</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaButton}>
            <Ionicons name="call" size={20} color="#000" />
            <Text style={styles.ctaText}>CALL</Text>
          </TouchableOpacity>
        </View>
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{post.description}</Text>
        </View>

        
        {/* ✅ More from this vendor section */}
        {vendorPosts.length > 0 && (
          <View style={styles.vendorSection}>
            <Text style={styles.vendorSectionTitle}>
              More from {post.username}
            </Text>
            
            {vendorLoading ? (
              <View style={styles.vendorLoadingContainer}>
                <ActivityIndicator size="small" color="green" />
                <Text style={styles.vendorLoadingText}>Loading more posts...</Text>
              </View>
            ) : (
              <FlatList
                data={vendorPosts}
                renderItem={renderVendorPost}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.vendorPostsList}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              />
            )}
          </View>
        )}

        {/* ✅ Add some bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    flex: 1,
  },
  postImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#f0f0f0",
  },
  noImageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 10,
    fontSize: 16,
    color: "#ccc",
  },
  postContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  postTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 13,
    color: "#000",
    fontWeight: "400",
    textDecorationLine: "underline",
    textDecorationColor: "#000",
  },
  descriptionContainer: {
    padding: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: "green",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  ctaContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    gap: 10,
  },
  ctaButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    width: "49%",
  },
  ctaText: {
    fontSize: 10,
    color: "#000",
    fontWeight: "600",
  },

  // ✅ New styles for vendor posts section
  vendorSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  vendorSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  vendorLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  vendorLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  vendorPostsList: {
    paddingHorizontal: 20,
  },
  vendorPostItem: {
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  vendorPostImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#f0f0f0",
  },
  vendorPostNoImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  vendorPostContent: {
    padding: 10,
  },
  vendorPostTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  vendorPostPrice: {
    fontSize: 11,
    fontWeight: "bold",
    color: "green",
    marginBottom: 2,
  },
  vendorPostCategory: {
    fontSize: 10,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
});
