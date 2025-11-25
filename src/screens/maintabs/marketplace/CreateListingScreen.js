// screens/CreateListingScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createListing } from "./api/marketplace";
import { AuthContext } from "../../../authcontext";
import { useContext } from "react";

const CreateListingScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [category, setCategory] = useState("fish");
  const [location, setLocation] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need gallery permission to pick image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setThumbnail({
        uri: asset.uri,
        mimeType: asset.mimeType || "image/jpeg",
        fileName: asset.fileName || "thumbnail.jpg",
      });
    }
  };

  const handleCreate = async () => {
    if (!title || !description || !basePrice || !category || !location) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await createListing(
        {
          title,
          description,
          base_price: basePrice,
          category,
          location,
          thumbnail,
        },
        token
      );

      Alert.alert("Success", "Listing created successfully!");
      navigation.navigate("MyListings");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.header}>Create Listing</Text>

      <TextInput placeholder="Title" placeholderTextColor="#2cd4c8" style={styles.input} value={title} onChangeText={setTitle} />

      <TextInput placeholder="Description" placeholderTextColor="#2cd4c8" style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} multiline />

      <TextInput placeholder="Base Price" placeholderTextColor="#2cd4c8" keyboardType="numeric" style={styles.input} value={basePrice} onChangeText={setBasePrice} />

      <TextInput placeholder="Category (e.g. fish)" placeholderTextColor="#2cd4c8" style={styles.input} value={category} onChangeText={setCategory} />

      <TextInput placeholder="Location" placeholderTextColor="#2cd4c8" style={styles.input} value={location} onChangeText={setLocation} />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>{thumbnail ? "Change Thumbnail" : "Pick Thumbnail"}</Text>
      </TouchableOpacity>

      {thumbnail && <Image source={{ uri: thumbnail.uri }} style={{ width: "100%", height: 180, borderRadius: 12, marginTop: 10 }} resizeMode="cover" />}

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#004d40" /> : <Text style={styles.buttonText}>Create Listing</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateListingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2cd4c8",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#2cd4c8",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    color: "#000",
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: "#2cd4c8",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 4,
  },
  imagePickerText: {
    color: "#2cd4c8",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#2cd4c8",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#004d40",
    fontWeight: "bold",
    fontSize: 16,
  },
});
