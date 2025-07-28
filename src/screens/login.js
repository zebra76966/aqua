import React, { useState } from "react";
import styles from "./login.stylesheet";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";

import { Ionicons, FontAwesome } from "@expo/vector-icons";
import useThemeStyles from "../useThemeStyle";

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useThemeStyles();

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate("tankSetup"); // assuming `tankSetup` is defined in your navigator
    }, 3000); // 3 seconds
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo */}
      <Text style={styles.logo}>aqua</Text>

      {/* Welcome */}
      <Text style={styles.welcome}>Welcome Back!</Text>

      {/* Username */}
      <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#2cd4c8" />

      {/* Password */}
      <View style={styles.passwordContainer}>
        <TextInput style={styles.passwordInput} placeholder="Password" placeholderTextColor="#2cd4c8" secureTextEntry={!showPassword} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color="#2cd4c8" />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>

      {/* Social Icons */}
      <View style={styles.socialIcons}>
        <FontAwesome name="google" size={30} color="#2cd4c8" />
        <FontAwesome name="apple" size={30} color="#2cd4c8" />
        <FontAwesome name="linkedin" size={30} color="#2cd4c8" />
      </View>

      {/* Submit button */}
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
