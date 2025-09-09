import React, { useState, useEffect, useContext, useRef } from "react";
import { useRoute } from "@react-navigation/native";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, TextInput, Image, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../authcontext";
import { baseUrl } from "../../../config";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RBSheet from "react-native-raw-bottom-sheet";
import * as ImageManipulator from "expo-image-manipulator";

const TankScanScreenTabs = () => {
  const route = useRoute();
  const { tankDataLocal } = route.params;
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scanData, setScanData] = useState([]);

  const cameraRef = useRef(null);
  const sheetRef = useRef(null);

  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  // --- CAMERA CAPTURE ---
  const handleScan = async () => {
    try {
      setScanned(true);
      if (!cameraRef.current) throw new Error("Camera not ready");

      let photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
      });

      const manipulated = await ImageManipulator.manipulateAsync(photo.uri, [{ resize: { width: 1024 } }], { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG });

      uploadImage(manipulated.uri);
    } catch (error) {
      alert(error.message || "Failed to capture image.");
      setScanned(false);
    }
  };

  // --- UPLOAD TO AI ---
  const uploadImage = async (uri) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: uri.startsWith("file://") ? uri : `file://${uri}`,
        name: "scan.jpg",
        type: "application/octet-stream",
      });

      const response = await fetch(`${baseUrl}/ai-model/inference/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Upload failed");

      const arrayData = Array.isArray(result) ? result : [result];

      const mappedData = arrayData.map((item) => {
        const predictions = item?.data?.predictions || {};
        return {
          class_name: predictions.class_name || "Unknown",
          confidence: predictions.confidence || 0,
          metadata: {
            species_name: predictions.metadata?.species_name || "",
            species_Nomenclature: predictions.metadata?.species_Nomenclature || "",
            max_size_cm: predictions.metadata?.max_size_cm || "",
          },
          image_url: item?.data?.image_url || null,
          quantity: "1", // default quantity
          notes: "",
        };
      });

      setScanData(mappedData);
      sheetRef.current.open();
    } catch (error) {
      alert(error.message);
      setScanned(false);
    } finally {
      setIsUploading(false);
      setScanned(false);
    }
  };

  // --- SUBMIT ALL SPECIES ---
  const handleSubmit = async () => {
    try {
      for (let fish of scanData) {
        const payload = {
          tank_id: tankDataLocal.id,
          species_name: fish.metadata.species_name,
          class_name: fish.class_name,
          quantity: fish.quantity,
          notes: fish.notes,
          last_scan_image_url: fish.image_url,
        };

        console.log(fish);
        const res = await fetch(`${baseUrl}/tanks/${tankDataLocal.id}/add-species/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        console.log(payload);

        if (!res.ok) {
          const errorText = await res.text(); // safer
          console.log("Error response:", errorText);
          throw new Error("Failed to add species: " + errorText);
        }
      }

      Alert.alert("Success", "Species added successfully!");
      sheetRef.current.close();
      navigation.navigate("TankDetail", {
        tankId: tankDataLocal.id,
        tankData: tankDataLocal,
      });
    } catch (error) {
      Alert.alert("Error", error.message);
      console.log(error);
    }
  };

  // --- RENDER FISH FORM ---
  const renderFishCard = (fish, index) => {
    return (
      <View key={index} style={styles.card}>
        {fish.image_url && (
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <Image source={{ uri: fish.image_url }} style={styles.fishImage} resizeMode="cover" />
          </View>
        )}

        <Text style={styles.label}>Species Name</Text>
        <TextInput style={styles.input} value={fish.metadata.species_name} onChangeText={(t) => updateField(index, "metadata.species_name", t)} />

        <Text style={styles.label}>Scientific Name</Text>
        <TextInput style={styles.input} value={fish.metadata.species_Nomenclature} onChangeText={(t) => updateField(index, "metadata.species_Nomenclature", t)} />

        <Text style={styles.label}>Quantity</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={fish.quantity} onChangeText={(t) => updateField(index, "quantity", t)} />

        <Text style={styles.label}>Notes</Text>
        <TextInput style={styles.input} value={fish.notes} onChangeText={(t) => updateField(index, "notes", t)} />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleRemove(index)}>
            <Icon name="delete" size={25} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const updateField = (index, field, value) => {
    const updated = [...scanData];
    if (field.startsWith("metadata.")) {
      const key = field.split(".")[1];
      updated[index].metadata[key] = value;
    } else {
      updated[index][field] = value;
    }
    setScanData(updated);
  };

  const handleRemove = (index) => {
    const updated = scanData.filter((_, i) => i !== index);
    setScanData(updated);
  };

  // --- CAMERA PERMISSION ---
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text>We need your permission to access the camera.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

      <View style={styles.overlay}>
        {scanned || isUploading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleScan}>
              <Text style={styles.buttonText}>Scan Tank</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.flipButton} onPress={() => setFacing((prev) => (prev === "back" ? "front" : "back"))}>
              <Text style={styles.flipText}>Flip</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Bottom Sheet */}
      <RBSheet
        ref={sheetRef}
        closeOnDragDown
        closeOnPressMask
        height={600}
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 15,
          },
          draggableIcon: { backgroundColor: "#ccc" },
        }}
      >
        <ScrollView>
          <Text style={styles.modalTitle}>Review & Add Species</Text>
          {scanData.map((fish, index) => renderFishCard(fish, index))}
          {scanData.length > 0 && (
            <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Confirm & Save</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </RBSheet>
    </View>
  );
};

export default TankScanScreenTabs;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  overlay: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#2cd4c8",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  flipButton: { padding: 10 },
  flipText: { color: "#fff", fontSize: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  fishImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
  },
  label: {
    fontWeight: "bold",
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 6,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "flex-end",
  },
  iconButton: {
    marginRight: 5,
    backgroundColor: "#383838ff",
    paddingVertical: 3,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
});
