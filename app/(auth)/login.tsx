import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserAuthStore } from "../../hooks/useAuthStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Get Zustand state and actions
  const { 
    login, 
    isLoading, 
    error, 
    clearError,
    isAuthenticated 
  } = useUserAuthStore();

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/popular");
    }
  }, [isAuthenticated]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert("Login Failed", error);
      clearError();
    }
  }, [error]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      // Navigation handled by useEffect above
      router.replace("/(tabs)/popular");
    }
    // Error handling is automatic via Zustand state
  };

  return (
    <View style={styles.container}>
      <View style={styles.items}>
        <Text style={styles.loginText}>Login</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          editable={!isLoading}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={{ textAlign: "center" }}>Need an account? Register</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push("/(auth)/register")}
          disabled={isLoading}
        >
          <Text style={styles.authButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  items: {
    justifyContent: "center",
    flex: 1,
    flexDirection: "column",
    gap: 20,
  },
  loginText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "red",
  },
  input: {
    height: 60,
    padding: 10,
    borderStyle: "solid",
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: 'blue',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  authButtonText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
  },
  authButton: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
});
