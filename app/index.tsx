import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useUserAuthStore } from '../hooks/useAuthStore';

export default function Index() {
  // Get Zustand state and actions
  const { checkAuthStatus, isLoading } = useUserAuthStore();

  useEffect(() => {
    // Use Zustand's checkAuthStatus instead of local function
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Navigate when loading is complete
  useEffect(() => {
    if (!isLoading) {
      // Always redirect to main app (since you allow guest access)
      router.replace('/(tabs)/popular');
    }
  }, [isLoading]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text style={styles.loadingText}>FoodMa</Text>
        <Text style={styles.loadingSubtext}>Loading...</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});