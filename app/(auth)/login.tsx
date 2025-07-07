import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserAuthStore } from "../../hooks/useAuthStore";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
const [step, setStep] = useState("phone"); // phone | otp

  // Get Zustand state and actions
  const { 
    // login, 
    loginWithPhone,
    verifyPhoneOtp,
    isLoading,
     error,
      clearError, isAuthenticated } =
    useUserAuthStore();

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/you");
    }
  }, [isAuthenticated]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert("Login Failed", error);
      clearError();
    }
  }, [error, clearError]);

  // const handleLogin = async () => {
  //   if (!phone) {
  //     Alert.alert("Error", "Please enter your phone number");
  //     return;
  //   }
  //   const success = await loginWithPhone(phone);


  //   if (success) {
  //     // Navigation handled by useEffect above
  //     router.replace("/(tabs)/you");
  //   }
  //   // Error handling is automatic via Zustand state
  // };

  const handleSendOtp = async () => {
  if (!phone) {
    Alert.alert("Error", "Enter your phone number");
    return;
  }

  const success = await loginWithPhone(phone);
  if (success) setStep("otp");
};


const handleVerifyOtp = async () => {
  if (!otp) {
    Alert.alert("Error", "Enter the code sent to your phone");
    return;
  }

  const success = await verifyPhoneOtp(phone, otp);
  if (success) {
    router.replace("/(tabs)/you");
  }
};

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/you");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ✅ Header with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.items}>
          <Text style={styles.loginText}>Welcome</Text>
          {/* <Text style={styles.subtitle}>Sign in to your account</Text> */}
      {step === "phone" ? (
        <>
        <TextInput
            placeholder="090 76 65 43 21"
            placeholderTextColor={"#999"}
            value={phone}
            onChangeText={setPhone}
            autoCapitalize="none"
            keyboardType="phone-pad"
            style={styles.input}
            editable={!isLoading}
          /> 
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleSendOtp}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
         </>   
      ) : (
        <>
        <TextInput
            placeholder="65 43 21"
            placeholderTextColor={"#999"}
            value={otp}
            onChangeText={setOtp}
            autoCapitalize="none"
            keyboardType="phone-pad"
            style={styles.input}
            editable={!isLoading} 
          /> 
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleVerifyOtp}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </>)}
        </View>
      

       <View style={styles.footer}>
       
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // ✅ Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSpacer: {
    width: 34, // Same as back button to center title
  },
  // ✅ Content container
  content: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
  },
  items: {
    justifyContent: "center",
    flex: 1,
    flexDirection: "column",
    gap: 20,
  },
  loginText: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  // ✅ Added subtitle
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  input: {
    height: 60,
    padding: 15,
    borderStyle: "solid",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  loginButton: {
    backgroundColor: "green",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    borderColor: "#ccc",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // ✅ Footer styles
  footer: {
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  authButtonText: {
    color: "green",
    fontSize: 16,
    fontWeight: "600",
  },
  authButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "green",
    minWidth: 200,
  },
});
