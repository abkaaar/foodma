import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
      } else {
        // Explicit navigation to home screen
        router.replace("/(tabs)/profile");
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
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
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={{color: 'white', fontSize: 15}}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={{ textAlign: "center" }}>Need an account? Register</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push("/(auth)/register")}
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
    borderWidth: 1, // Added border
    borderRadius: 5, // Optional: rounded corners
  },
  authButtonText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: 'blue',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
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
