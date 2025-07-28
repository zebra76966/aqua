import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    // Handle signup logic here
    console.log("Signing up:", { username, email, password });
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Text style={styles.logo}>aqua</Text>

      {/* Welcome */}
      <Text style={styles.welcome}>Sign Up</Text>

      <TextInput placeholder="Username" style={styles.input} value={username} onChangeText={setUsername} />

      <TextInput placeholder="Email" keyboardType="email-address" style={styles.input} value={email} onChangeText={setEmail} />

      <TextInput placeholder="Password" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.link}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#2cd4c8",
    textAlign: "center",
    marginBottom: 20,
  },
  welcome: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#2cd4c8",
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
    color: "#000",
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 15,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#2cd4c8",
    padding: 10,
    borderRadius: 10,
    color: "#000",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 10,
    color: "#999",
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#2cd4c8",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    color: "#004d40",
    fontWeight: "bold",
    marginRight: 10,
  },
  switchText: {
    color: "#aaa",
    marginTop: 15,
  },
  link: {
    color: "#2cd4c8",
    fontWeight: "bold",
    fontSize: 18,
  },
});
