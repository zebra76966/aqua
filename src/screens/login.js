import React, { useState, useContext } from "react";
import styles from "./login.stylesheet";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import useThemeStyles from "../useThemeStyle";
import { baseUrl } from "../config";
import { AuthContext } from "../authcontext";

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { colors } = useThemeStyles();
  const { login } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/user/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save token to context + AsyncStorage
      await login(data.token);

      // Navigate to next screen
      navigation.navigate("tankSetup");
    } catch (error) {
      Alert.alert("Login Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.logo}>aqua</Text>
      <Text style={styles.welcome}>Welcome Back!</Text>

      <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#2cd4c8" value={username} onChangeText={setUsername} autoCapitalize="none" />

      <View style={styles.passwordContainer}>
        <TextInput style={styles.passwordInput} placeholder="Password" placeholderTextColor="#2cd4c8" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color="#2cd4c8" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>or-</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialIcons}>
        <FontAwesome name="google" size={30} color="#2cd4c8" />
        <FontAwesome name="apple" size={30} color="#2cd4c8" />
        <FontAwesome name="linkedin" size={30} color="#2cd4c8" />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#004d40" />
        ) : (
          <>
            <Text style={styles.buttonText}>CONTINUE</Text>
            <Ionicons name="arrow-forward" size={20} color="#004d40" />
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.switchText}>
          Don't have an account? <Text style={styles.link}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
