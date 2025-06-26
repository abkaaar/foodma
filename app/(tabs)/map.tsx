import { useUserAuthStore } from "@/hooks/useAuthStore";
import { getUserLocationWithAddress } from "@/hooks/useLocation";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

// User interface for map display
interface MapUser {
  id: string;
  username: string;
  location: string;
  latitude?: number;
  longitude?: number;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export default function Map() {
  const [viewMode, setViewMode] = useState("map"); // 'map' or 'list'
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [users, setUsers] = useState<MapUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);

  const { user: currentUser, isAuthenticated } = useUserAuthStore();

  // Get user's current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getUserLocationWithAddress({
        accuracy: Location.Accuracy.High,
      });

      if (location) {
        const region: Region = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setUserLocation(region);

        // Update current user's location in database if authenticated
        if (
          isAuthenticated &&
          currentUser &&
          location.address?.formattedAddress
        ) {
          await supabase
            .from("profiles")
            .update({
              location: location.address.formattedAddress,
              latitude: location.latitude,
              longitude: location.longitude,
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentUser.id);
        }
      } else {
        // Fallback to a default location if user location fails
        setUserLocation({
          latitude: 6.5244, // Lagos, Nigeria
          longitude: 3.3792,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error("Location error:", error);
      // Fallback location
      setUserLocation({
        latitude: 6.5244,
        longitude: 3.3792,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } finally {
      setLocationLoading(false);
    }
  };

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, username, location, latitude, longitude, avatar_url, bio, created_at"
        )
        .not("location", "is", null)
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      if (data) {
        const mappedUsers: MapUser[] = data.map((user) => ({
          id: user.id,
          username: user.username || "User",
          location: user.location || "Unknown location",
          latitude: user.latitude,
          longitude: user.longitude,
          avatar_url: user.avatar_url,
          bio: user.bio,
          created_at: user.created_at,
        }));

        setUsers(mappedUsers);

        // Set first user as selected for the bottom card
        if (mappedUsers.length > 0) {
          setSelectedUser(mappedUsers[0]);
        }
      }
    } catch (error) {
      console.error("Database error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map data
  useEffect(() => {
    getCurrentLocation();
    fetchUsers();
  }, []);

  const handleMarkerPress = (user: MapUser) => {
    setSelectedUser(user);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      {userLocation ? (
        <MapView
          style={styles.map}
          region={userLocation}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onRegionChangeComplete={(region) => setUserLocation(region)}
        >
          {/* Render user markers */}
          {users.map((user) => (
            <Marker
              key={user.id}
              coordinate={{
                latitude: user.latitude!,
                longitude: user.longitude!,
              }}
              onPress={() => handleMarkerPress(user)}
              pinColor="green" // Green pins for users
            >
              <View style={styles.customMarker}>
                {user.avatar_url ? (
                  <Image
                    source={{ uri: user.avatar_url }}
                    style={styles.markerImage}
                  />
                ) : (
                  <View style={styles.defaultMarker}>
                    <Text style={styles.markerText}>
                      {user.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {locationLoading ? "Getting your location..." : "Loading map..."}
          </Text>
        </View>
      )}

      {/* Bottom card showing selected user */}
      {selectedUser && (
        <View style={styles.bottomCard}>
          <View style={styles.cardContent}>
            <View style={styles.userImageContainer}>
              {selectedUser.avatar_url ? (
                <Image
                  source={{ uri: selectedUser.avatar_url }}
                  style={styles.cardImage}
                />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Text style={styles.cardImageText}>
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{selectedUser.username}</Text>
              <Text style={styles.cardAddress} numberOfLines={2}>
                📍 {selectedUser.location}
              </Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {selectedUser.bio ||
                  "FoodMa user since " + formatDate(selectedUser.created_at)}
              </Text>
            </View>
            <TouchableOpacity style={styles.bookmarkButton}>
              <Ionicons name="bookmark-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listHeader}>
        {loading ? "Loading users..." : `Viewing ${users.length} users`}
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <ScrollView
          style={styles.listScroll}
          showsVerticalScrollIndicator={false}
        >
          {users.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.listItem}
              onPress={() => {
          setSelectedUser(user);
          setViewMode("map");
          if (user.latitude && user.longitude) {
            setUserLocation({
              latitude: user.latitude,
              longitude: user.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          }
              }}
            >
              <View style={styles.listItemContent}>
          <View style={styles.listItemImageContainer}>
            {user.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.listItemImage}
              />
            ) : (
              <View style={styles.listItemImagePlaceholder}>
                <Text style={styles.listItemImageText}>
            {user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.listItemInfo}>
            <Text style={styles.listItemTitle}>{user.username}</Text>
            <Text style={styles.listItemAddress} numberOfLines={2}>
              📍 {user.location}
            </Text>
            <Text style={styles.listItemDescription} numberOfLines={2}>
              {user.bio || "Member since " + formatDate(user.created_at)}
            </Text>
          </View>
          <TouchableOpacity style={styles.listBookmarkButton}>
            <Ionicons name="bookmark-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {users.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>
          No users found with location data
              </Text>
              <Text style={styles.emptyStateSubtext}>
          Users need to update their location in settings to appear on the
          map
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );

  // Cities array for city selection
  const cities = [
    { name: "Lagos", latitude: 6.5244, longitude: 3.3792 },
    { name: "Abuja", latitude: 9.0579, longitude: 7.4951 },
    { name: "Port Harcourt", latitude: 4.8156, longitude: 7.0498 },
    { name: "Kano", latitude: 12.0022, longitude: 8.5919 },
    { name: "Ibadan", latitude: 7.3775, longitude: 3.947 },
    { name: "Minna", latitude: 9.6152, longitude: 6.5535 },
    // Add more cities as needed
  ];

  // State and setter for city modal visibility
  const [cityModalVisible, setCityModalVisible] = useState(false);
  // State for selected city
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with location refresh */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setCityModalVisible(true)}
        >
          <Text style={styles.locationText}>
            {selectedCity ? selectedCity : "Select Location"}
          </Text>
          <Ionicons name="arrow-down-sharp" size={20} color="#666" />
        </TouchableOpacity>
        {/* City selection modal */}
        <Modal
          visible={cityModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCityModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
            <View style={{ backgroundColor: "white", borderRadius: 16, padding: 24, width: "80%" }}>
              <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 16 }}>Choose a City</Text>
              {cities.map((city) => (
          <TouchableOpacity
            key={city.name}
            style={{ paddingVertical: 12 }}
            onPress={() => {
              setSelectedCity(city.name);
              setUserLocation({
                latitude: city.latitude,
                longitude: city.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
              setCityModalVisible(false);
            }}
          >
            <Text style={{ fontSize: 16 }}>{city.name}</Text>
          </TouchableOpacity>
              ))}
              <TouchableOpacity
          style={{ marginTop: 16, alignSelf: "flex-end" }}
          onPress={() => setCityModalVisible(false)}
              >
          <Text style={{ color: "#007AFF", fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchUsers}
          disabled={loading}
        >
          <Ionicons name="refresh" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      {viewMode === "map" ? renderMapView() : renderListView()}

      {/* Toggle buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "map" && styles.activeToggle,
          ]}
          onPress={() => setViewMode("map")}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === "map" && styles.activeToggleText,
            ]}
          >
            MAP
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "list" && styles.activeToggle,
          ]}
          onPress={() => setViewMode("list")}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === "list" && styles.activeToggleText,
            ]}
          >
            LIST
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginLeft: 8,
  },
  refreshButton: {
    padding: 10,
    backgroundColor: "#f0f8ff",
    borderRadius: 20,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  // Custom marker styles
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#4CAF50", // Green border
  },
  defaultMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50", // Green background
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  markerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Bottom card styles
  bottomCard: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  userImageContainer: {
    marginRight: 12,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  cardImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImageText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  bookmarkButton: {
    padding: 8,
  },
  // List view styles
  listContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    paddingVertical: 16,
  },
  listScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listItem: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  listItemImageContainer: {
    marginRight: 12,
  },
  listItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  listItemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  listItemImageText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  listItemAddress: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  listItemDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 16,
  },
  listBookmarkButton: {
    padding: 8,
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  // Toggle buttons
  toggleContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -60 }],
    backgroundColor: "white",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 60,
  },
  activeToggle: {
    backgroundColor: "#4CAF50", // Green active state
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  activeToggleText: {
    color: "white",
  },
});
