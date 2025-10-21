import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../authcontext";
import { useNavigation } from "@react-navigation/native";
import { baseUrl } from "../../config";

export default function SettingsScreen() {
  const [profileImage, setProfileImage] = useState(require("../../assets/user.jpg"));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const { logout } = useContext(AuthContext);
  const navigation = useNavigation();

  // --- Pick and store image locally ---
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage({ uri });

      // Save locally for persistence
      await AsyncStorage.setItem("localProfileImage", uri);
    }
  };

  // --- Load local profile image if saved previously ---
  React.useEffect(() => {
    (async () => {
      const savedImage = await AsyncStorage.getItem("localProfileImage");
      if (savedImage) {
        setProfileImage({ uri: savedImage });
      }
    })();
  }, []);

  // --- Update API call ---
  const handleUpdate = async () => {
    if (!firstName || !lastName) {
      Alert.alert("Please fill both first and last name.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token"); // assuming token is stored here
      const response = await fetch({ baseUrl } + `/user/profile/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        Alert.alert("Profile Updated", "Your name has been updated successfully.");
      } else {
        console.log(data);
        Alert.alert("Error", data?.detail || "Something went wrong");
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Error", "Unable to update profile");
    }
  };

  // --- Logout ---
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <TouchableOpacity onPress={handleImagePick}>
        <Image source={profileImage} style={styles.profileImage} />
      </TouchableOpacity>
      <Text style={styles.label}>Tap to change photo</Text>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <Text style={styles.fieldLabel}>First Name</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Enter first name" />

        <Text style={styles.fieldLabel}>Last Name</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Enter last name" />
      </View>

      <TouchableOpacity style={[styles.utilityButton, { backgroundColor: "#00CED1" }]} onPress={handleUpdate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.utilityText}>Update Profile</Text>}
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
  utilityButton: {
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  utilityText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
