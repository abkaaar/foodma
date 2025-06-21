import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function RegisterScreen() {

 const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        Alert.alert("Registration Error", error.message);
      } else {
        Alert.alert("Success", "Check your email to confirm your account.", [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]);
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
        <Text style={styles.loginText}>Register</Text>
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
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={{color: 'white', fontSize: 15}}>
            {loading ? "Taking you in fresh..." : "Register"}
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={{ textAlign: "center" }}>Already have an account? Login</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.authButtonText}>Login</Text>
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
  registerButton: {
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

// export default function RegisterScreen() {


//   return (
//     <View style={styles.container}>
//       <Text>Register</Text>
//       <TextInput
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//         style={{ borderBottomWidth: 1, marginBottom: 10 }}
//       />
//       <TextInput
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//         style={{ borderBottomWidth: 1, marginBottom: 20 }}
//       />
//       <Button title="Register" onPress={handleRegister} />
//       <Button
//         title="Already have an account? Login"
//         onPress={() => router.push("/(auth)/login")}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 30,
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//   }
// });