import { useUserAuthStore } from "@/hooks/useAuthStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SavedPlace = {
  id: string;
  name: string;
  address: string;
  description: string;
  image: string;
};

type Post = {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
};
export default function You() {
  // ✅ Use Zustand instead of local state
  const { 
    user, 
    isAuthenticated, 
    error,
    logout,
    checkAuthStatus,
    clearError 
  } = useUserAuthStore();

  const [activeTab, setActiveTab] = useState<"saved" | "posts">("saved");
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Dummy data for saved places (replace with real data fetching logic)
  const [savedPlaces] = useState<SavedPlace[]>([
    {
      id: "1",
      name: "Central Park",
      address: "New York, NY",
      description: "A large public park in New York City.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
    },
    {
      id: "2",
      name: "Eiffel Tower",
      address: "Paris, France",
      description: "Iconic Parisian landmark.",
      image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400",
    },
  ]);

  // Dummy data for posts (replace with real data fetching logic)
  const [posts] = useState<Post[]>([
    {
      id: "1",
      title: "My First Post",
      description: "This is a description of my first post.",
      image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400",
      date: "2024-06-01",
    },
    {
      id: "2",
      title: "Another Post",
      description: "Here's another interesting post.",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400",
      date: "2024-06-02",
    },
  ]);

  // ✅ Use Zustand's checkAuthStatus
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // ✅ Handle errors from Zustand
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      clearError();
    }
  }, [error, clearError]);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setSettingsModalVisible(false);
            await logout();
          },
        },
      ]
    );
  };

  const renderSavedPlace = ({ item }: { item: SavedPlace }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <TouchableOpacity>
            <Ionicons name="bookmark" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <Text style={styles.itemAddress}>{item.address}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
    </View>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.postDate}>{item.date}</Text>
        </View>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
    </View>
  );

  // ... rest of your component using user data from Zustand
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.Topheader}>
        <TouchableOpacity style={{}} onPress={() => setSettingsModalVisible(true)}>
          <Ionicons name="person" size={28} color="green" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {isAuthenticated && user ? (
              <View style={styles.headerText}>
                <Text style={styles.name}>{user.username || user.email?.split('@')[0] || 'User'}</Text>
                <Text style={styles.bio}>{user.bio || 'Welcome to FoodMa!'}</Text>
              </View>
            ) : (
              <View style={styles.guestHeader}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Saved</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {isAuthenticated && (
            <TouchableOpacity
              style={[styles.tab, activeTab === "posts" && styles.activeTab]}
              onPress={() => setActiveTab("posts")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "posts" && styles.activeTabText,
                ]}
              >
                Your Posts
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              isAuthenticated ? styles.tab : styles.singleTab,
              activeTab === "saved" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("saved")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "saved" && styles.activeTabText,
              ]}
            >
              Saved Places
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        <View style={styles.contentContainer}>
          {activeTab === "saved" ? (
            isAuthenticated ? (
              <FlatList
                data={savedPlaces}
                renderItem={renderSavedPlace}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <Text style={{ textAlign: "center" }}>
                  Sign in and save your favorites places!
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "green",
                    width: 150,
                    padding: 10,
                    borderRadius: 20,
                  }}
                  onPress={() => router.push("/(auth)/login")}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Sign in
                  </Text>
                </TouchableOpacity>
              </View>
            )
          ) : isAuthenticated ? (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.authPrompt}>
              <Text style={styles.authPromptTitle}>Login Required</Text>
              <Text style={styles.authPromptText}>
                Login to view and create your posts
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push("/(auth)/login")}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {activeTab === "posts" && isAuthenticated && (
        <TouchableOpacity
          style={styles.fab}
          // onPress={() => router.push("/add-post")} // Replace with your add post route
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
   
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profile & Settings</Text>
            <TouchableOpacity
              onPress={() => setSettingsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            {/* User Profile Section (if authenticated) */}
            {isAuthenticated && user ? (
              <>
                <View style={styles.profileSection}>
                  <View style={styles.profileHeader}>
                    <Image
                      source={{
                        uri: user.profile_photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                      }}
                      style={styles.modalProfilePhoto}
                    />
                    <View style={styles.profileInfo}>
                      <Text style={styles.modalProfileName}>{user.username || 'User'}</Text>
                      <Text style={styles.modalProfilePhone}>{user.phone || 'Not provided'}</Text>
                      <Text style={styles.modalProfileBio}>{user.bio || 'No bio'}</Text>
                    </View>
                  </View>
                </View>

                {/* Profile Details */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Profile Information</Text>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{user.location}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Member Since</Text>
                    <Text style={styles.detailValue}>{user.created_at}</Text>
                  </View>
                </View>

                {/* Settings Options */}
                <View style={styles.settingsSection}>
                  <Text style={styles.sectionTitle}>Settings</Text>
                  
                  <TouchableOpacity 
                    style={styles.settingsItem}
                    onPress={() => {
                      setSettingsModalVisible(false);
                      router.push('/settings');
                    }}
                  >
                    <Ionicons name="person-outline" size={24} color="#666" />
                    <Text style={styles.settingsItemText}>Edit Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsItem}>
                    <Ionicons name="notifications-outline" size={24} color="#666" />
                    <Text style={styles.settingsItemText}>Notifications</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsItem}>
                    <Ionicons name="bookmark-outline" size={24} color="#666" />
                    <Text style={styles.settingsItemText}>Saved Places</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsItem}>
                    <Ionicons name="shield-outline" size={24} color="#666" />
                    <Text style={styles.settingsItemText}>Privacy</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsItem}>
                    <Ionicons name="help-circle-outline" size={24} color="#666" />
                    <Text style={styles.settingsItemText}>Help & Support</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.settingsItem, styles.logoutItem]}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" size={24} color="#ff4444" />
                    <Text style={[styles.settingsItemText, styles.logoutText]}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Guest User Section */}
                <View style={styles.guestSection}>
                  <Ionicons name="person-circle-outline" size={80} color="#ccc" />
                  <Text style={styles.guestTitle}>Welcome to FoodMa!</Text>
                  <Text style={styles.guestSubtitle}>Sign in to access all features and save your favorite places</Text>
                </View>

                <View style={styles.authButtonsSection}>
                  <TouchableOpacity 
                    style={styles.loginModalButton}
                    onPress={() => {
                      setSettingsModalVisible(false);
                      router.push('/(auth)/login');
                    }}
                  >
                    <Text style={styles.loginModalButtonText}>Login</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.registerModalButton}
                    onPress={() => {
                      setSettingsModalVisible(false);
                      router.push('/(auth)/register');
                    }}
                  >
                    <Text style={styles.registerModalButtonText}>Create Account</Text>
                  </TouchableOpacity>
                </View>

                {/* General Settings for Guests */}
                <View style={styles.settingsSection}>
                  <Text style={styles.sectionTitle}>General</Text>
                  
                  <TouchableOpacity style={styles.settingsItem}>
                    <Ionicons name="help-circle-outline" size={24} color="#666" />
                    <Text style={styles.settingsItemText}>Help & Support</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsItem}>
                    <Ionicons name="information-circle-outline" size={24} color="#666" />
                    <Text style={styles.settingsItemText}>About FoodMa</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
    paddingHorizontal: 20,
  },
  Topheader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
  },
  avatarContainer: {
    marginBottom: 15,
  },
  profilePhoto: {
    width: 450,
    height: 150,
    backgroundColor: "#e1e1e1",
    marginBottom: 15,
  },
  headerText: {
    paddingInline: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    // marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: 'green',
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#333",
    fontWeight: "600",
  },
  contentContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    minHeight: 400,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#e1e1e1",
  },
  itemContent: {
    flex: 1,
    marginLeft: 15,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  itemAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: "#888",
    lineHeight: 18,
  },
  postDate: {
    fontSize: 12,
    color: "#999",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 70,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  guestHeader: {
    alignItems: "flex-start",
  },
  loginPrompt: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#ff4444",
  },
  loginPromptText: {
    color: "#fff",
    fontWeight: "500",
  },
  authPrompt: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  authPromptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  authPromptText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#ff4444",
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  singleTab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ff4444", // Always active when it's the only tab
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalScrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalProfilePhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e1e1e1',
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  modalProfileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalProfilePhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalProfileBio: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  settingsItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutItem: {
    marginTop: 10,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ff4444',
  },
  guestSection: {
    padding: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  authButtonsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  loginModalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerModalButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  registerModalButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
