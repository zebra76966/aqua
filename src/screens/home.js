import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const FirstScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Logo at the top */}
      <Image source={require("../assets/icon.png")} style={styles.logoImage} />

      {/* Heading and subtitle */}
      <Text style={styles.logo}>Welcome</Text>
      <Text style={styles.subtitle}>Let’s get you started on your journey!</Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 30,
    shadowColor: "#2cd4c8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#2cd4c8",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 60,
  },
  primaryButton: {
    backgroundColor: "#2cd4c8",
    paddingVertical: 18,
    width: "100%",
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#2cd4c8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#004d40",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "#2cd4c8",
    paddingVertical: 18,
    width: "100%",
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2cd4c8",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FirstScreen;
