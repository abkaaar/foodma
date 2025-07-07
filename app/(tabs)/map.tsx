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
  StatusBar,
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
                {selectedUser.location}
              </Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {selectedUser.bio ||
                  "FoodMa user since " + formatDate(selectedUser.created_at)}
              </Text>
            </View>
            <TouchableOpacity style={styles.bookmarkButton}>
              <Ionicons name="bookmark-outline" size={20} color="green" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listHeader}>
        {loading ? "Loading users..." : `Viewing ${users.length} places`}
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
                    {user.location}
                  </Text>
                  <Text style={styles.listItemDescription} numberOfLines={2}>
                    {user.bio || "Member since " + formatDate(user.created_at)}
                  </Text>
                </View>
                <TouchableOpacity style={styles.listBookmarkButton}>
                  <Ionicons name="bookmark-outline" size={20} color="green" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {users.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No Places found with location data
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
    { name: "Abuja", latitude: 9.072264, longitude: 7.491302 },
  { name: "Lagos", latitude: 6.465422, longitude: 3.406448 },
  { name: "Port Harcourt", latitude: 4.824167, longitude: 7.033611 },
  { name: "Maiduguri", latitude: 11.833333, longitude: 13.15 },
  { name: "Kano", latitude: 12.0, longitude: 8.516667 },
  { name: "Katsina", latitude: 12.985531, longitude: 7.617144 },
  { name: "Nnewi", latitude: 6.010519, longitude: 6.910345 },
  { name: "Ogbomosho", latitude: 8.142165, longitude: 4.245186 },
  { name: "Awka", latitude: 6.210528, longitude: 7.072277 },
  { name: "Abeokuta", latitude: 7.145244, longitude: 3.327695 },
  { name: "Ikeja", latitude: 6.605874, longitude: 3.349149 },
  { name: "Ughelli", latitude: 5.500187, longitude: 5.993834 },
  { name: "Akure", latitude: 7.250771, longitude: 5.210266 },
  { name: "Calabar", latitude: 4.982873, longitude: 8.334503 },
  { name: "Sapele", latitude: 5.879698, longitude: 5.700531 },
  { name: "Onitsha", latitude: 6.141312, longitude: 6.802949 },
  { name: "Zaria", latitude: 11.085541, longitude: 7.719945 },
  { name: "Jos", latitude: 9.896527, longitude: 8.858331 },
  { name: "Kaduna", latitude: 10.609319, longitude: 7.429504 },
  { name: "Minna", latitude: 9.583555, longitude: 6.546316 },
  { name: "Sokoto", latitude: 13.005873, longitude: 5.247552 },
  { name: "Iwo", latitude: 7.629209, longitude: 4.187218 },
  { name: "Yola", latitude: 9.203496, longitude: 12.49539 },
  { name: "Benin City", latitude: 6.339185, longitude: 5.617447 },
  { name: "Ondo", latitude: 7.100005, longitude: 4.841694 },
  { name: "Warri", latitude: 5.54423, longitude: 5.760269 },
  { name: "Enugu", latitude: 6.459964, longitude: 7.548949 },
  { name: "Ikorodu", latitude: 6.616865, longitude: 3.508072 },
  { name: "Owerri", latitude: 5.47631, longitude: 7.025853 },
  { name: "Bauchi", latitude: 10.314159, longitude: 9.846282 },
  { name: "Bida", latitude: 9.083333, longitude: 6.016667 },
  { name: "Ado Ekiti", latitude: 7.621111, longitude: 5.221389 },
  { name: "Gombe", latitude: 10.283333, longitude: 11.166667 },
  { name: "Ilorin", latitude: 8.5, longitude: 4.55 },
  { name: "Birnin Kebbi", latitude: 12.466078, longitude: 4.199524 },
  { name: "Mubi", latitude: 10.616667, longitude: 13.383333 },
  { name: "Eruwa", latitude: 7.536318, longitude: 3.418143 },
  { name: "Wudil", latitude: 11.794242, longitude: 8.839032 },
  { name: "Ofin", latitude: 6.54456, longitude: 3.514938 },
  { name: "Uwheru", latitude: 5.307031, longitude: 6.056213 },
  { name: "Burji", latitude: 11.171179, longitude: 8.548755 },
  { name: "Aba", latitude: 5.107, longitude: 7.367 },
  { name: "Abakaliki", latitude: 6.326, longitude: 8.109 },
  { name: "Afikpo", latitude: 5.929, longitude: 7.931 },
  { name: "Asaba", latitude: 6.204, longitude: 6.753 },
  { name: "Auchi", latitude: 7.056, longitude: 6.270 },
  { name: "Awgu", latitude: 6.189, longitude: 7.485 },
  ];

  // State and setter for city modal visibility
  const [cityModalVisible, setCityModalVisible] = useState(false);
  // State for selected city
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      {/* Header with location refresh */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setCityModalVisible(true)}
        >
          <Text style={styles.locationText}>
            {selectedCity ? selectedCity : "Select places"}
          </Text>
          <Ionicons name="arrow-down-sharp" size={20} color="#666" />
        </TouchableOpacity>

        {/* City selection modal */}
        <Modal
          visible={cityModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setCityModalVisible(false)}
        >
          <View style={{ flex: 1, paddingTop: 20 }}>
            {/* Sticky Header */}
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 18,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Select Location
            </Text>

            {/* Scrollable City List */}
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {cities.map((city, index) => (
                <View key={city.name}>
                  <TouchableOpacity
                    style={{ paddingVertical: 16 }}
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
                    <Text style={{ fontSize: 16, padding: 20 }}>{city.name}</Text>
                  </TouchableOpacity>

                  {/* Separator line (don't show after last item) */}
                  {index < cities.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: "#e0e0e0",
                      }}
                    />
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Fixed Cancel Button at Bottom Center */}
            <View
              style={{
                paddingVertical: 20,
                borderTopWidth: 1,
                borderTopColor: "#e0e0e0",
                alignItems: "center",
              }}
            >
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <Text
                  style={{
                    color: "green",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
    borderColor: "green", // Green border
  },
  defaultMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "green", // Green background
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
    bottom: 120,
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
    borderRadius: 10,
    backgroundColor: "green",
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
    color: "#000",
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
    borderRadius: 10,
  },
  listItemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "green",
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
    color: "#000",
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
    bottom: 60,
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 40,
  },
  activeToggle: {
    backgroundColor: "green", // Green active state
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
