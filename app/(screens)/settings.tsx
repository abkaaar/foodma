import { useUserAuthStore } from "@/hooks/useAuthStore";
import { getUserLocationWithAddress } from "@/hooks/useLocation";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SettingsScreen = () => {
  const { 
    user, 
    error,
    isLoading,
    clearError,
    updateProfile
  } = useUserAuthStore();

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  // Initialize edit data when user data changes
  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      clearError();
    }
  }, [error, clearError]);



  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset edit data to original values
    setEditData({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  // ✅ New function to get current location
  const handleGetCurrentLocation = async () => {
    if (!isEditing) return;
    
    setGettingLocation(true);
    
    try {
      const locationData = await getUserLocationWithAddress({
        accuracy: Location.Accuracy.High
      });
      
      if (locationData?.address?.formattedAddress) {
        setEditData(prev => ({
          ...prev,
          location: locationData.address!.formattedAddress!
        }));
        
        Alert.alert(
          "Location Found",
          `Location set to: ${locationData.address.formattedAddress}`
        );
      } else {
        Alert.alert(
          "Location Error",
          "Could not get your current address. Please enter manually."
        );
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        "Permission Required",
        "Please allow location access to use this feature, or enter your address manually."
      );
    } finally {
      setGettingLocation(false);
    }
  };


  const handleSave = async () => {
    try {
      // Validate data
      if (!editData.email.trim()) {
        Alert.alert("Error", "Email is required");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        Alert.alert("Error", "Please enter a valid email address");
        return;
      }

      // Call update function from your auth store
     const success =  await updateProfile(editData);

     if(success) {
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");  
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
      console.error("Update error:", error);
    } 
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return dateString;
    }
  };
type EditDataKeys = keyof typeof editData;

  const renderDetailItem = (label: string, value: any, field: EditDataKeys) => {
    if (isEditing) {
      return (
        <View key={label} style={styles.detailItem}>
          <Text style={styles.detailLabel}>{label}</Text>
           <View style={styles.inputContainer}>
          <TextInput
          style={[styles.input, field === 'location' && styles.locationInput]}
              value={editData[field]}
              onChangeText={(text) => setEditData(prev => ({ ...prev, [field]: text }))}
              placeholder={field === 'location' ? 'Enter address or tap location button' : `Enter ${label.toLowerCase()}`}
              keyboardType={field === 'email' ? 'email-address' : 'default'}
              autoCapitalize={field === 'email' ? 'none' : 'words'}
              multiline={field === 'bio' || field === 'location'}
              numberOfLines={field === 'bio' ? 3 : field === 'location' ? 2 : 1}
              editable={!isLoading && !gettingLocation}
            />

             
            {/* ✅ Location button for location field */}
            {field === 'location' && (
              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleGetCurrentLocation}
                disabled={gettingLocation || isLoading}
              >
                {gettingLocation ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Ionicons name="location" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return (
      <View key={label} style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>
          {value || "Not provided"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            {user && !isEditing && (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit} disabled={isLoading}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {renderDetailItem("Username", user?.username, "username")}
          {renderDetailItem("Email", user?.email, "email")}
          {renderDetailItem("Phone", user?.phone, "phone")}
          {renderDetailItem("Location", user?.location, "location")}
          {renderDetailItem("Bio", user?.bio, "bio")}

          {/* Member Since (Read-only) */}
          {user?.created_at && (
            <View style={[styles.detailItem, styles.readOnlyItem]}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>
                {formatDate(user.created_at)}
              </Text>
            </View>
          )}

          {/* Edit Actions */}
          {isEditing && (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        
      </ScrollView>

      {/* Loading Modal */}
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Updating profile...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  readOnlyItem: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: "#666",
    flex: 2,
    textAlign: "right",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  logoutButtonText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  // ✅ New styles for location functionality
  inputContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
  },
  locationButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
    height: 40,
  },
  input: {
    flex: 2,
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
    minHeight: 40,
  },
  
});

export default SettingsScreen;