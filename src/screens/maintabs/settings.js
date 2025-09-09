import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Switch, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../../authcontext";
import { useNavigation } from "@react-navigation/native"; // for navigation

export default function SettingsScreen() {
  const [profileImage, setProfileImage] = useState(require("../../assets/user.jpg"));
  const [username, setUsername] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [phone, setPhone] = useState("+91 9876543210");
  const [address, setAddress] = useState("Mumbai, India");
  const [darkMode, setDarkMode] = useState(false);

  const { logout } = useContext(AuthContext); // access logout function
  const navigation = useNavigation(); // hook for navigation

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  const handleClearData = () => {
    Alert.alert("Clear Data", "Are you sure you want to clear all app data?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: () => Alert.alert("Data Cleared!") },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await logout(); // clear token from context + AsyncStorage
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }], // redirect to Login screen
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Profile Image */}
      <TouchableOpacity onPress={handleImagePick}>
        <Image source={profileImage} style={styles.profileImage} />
      </TouchableOpacity>
      <Text style={[styles.label, darkMode && styles.darkText]}>Tap to change photo</Text>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <Text style={[styles.fieldLabel, darkMode && styles.darkText]}>Username</Text>
        <TextInput style={[styles.input, darkMode && styles.darkInput]} value={username} onChangeText={setUsername} />

        <Text style={[styles.fieldLabel, darkMode && styles.darkText]}>Email</Text>
        <TextInput style={[styles.input, darkMode && styles.darkInput]} value={email} onChangeText={setEmail} />

        <Text style={[styles.fieldLabel, darkMode && styles.darkText]}>Phone</Text>
        <TextInput style={[styles.input, darkMode && styles.darkInput]} value={phone} onChangeText={setPhone} />

        <Text style={[styles.fieldLabel, darkMode && styles.darkText]}>Address</Text>
        <TextInput style={[styles.input, darkMode && styles.darkInput]} value={address} onChangeText={setAddress} />
      </View>

      {/* Dark Mode Toggle */}
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleText, darkMode && styles.darkText]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      {/* Utility Buttons */}
      <TouchableOpacity style={styles.utilityButton} onPress={handleClearData}>
        <Text style={styles.utilityText}>Clear Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.utilityButton, { backgroundColor: "#ff4d4d" }]} onPress={handleLogout}>
        <Text style={styles.utilityText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 20,
    alignItems: "center",
  },
  darkContainer: { backgroundColor: "#121212" },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#00CED1",
  },
  label: { color: "#777", fontSize: 14, marginBottom: 20 },
  inputContainer: { width: "100%", marginBottom: 20 },
  fieldLabel: { fontWeight: "bold", marginBottom: 4, color: "#333" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  darkInput: { backgroundColor: "#222", color: "#fff", borderColor: "#333" },
  darkText: { color: "#fff" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  toggleText: { fontSize: 16, color: "#333", fontWeight: "bold" },
  utilityButton: {
    backgroundColor: "#00CED1",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  utilityText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
