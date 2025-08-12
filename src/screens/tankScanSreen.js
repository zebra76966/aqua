import React, { useState, useEffect, useContext, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../authcontext";
import { baseUrl } from "../config";

const TankScanScreen = () => {
  const [facing, setFacing] = useState("back"); // "front" or "back"
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef(null);

  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  const handleScan = async () => {
    try {
      setScanned(true);

      if (!cameraRef.current) throw new Error("Camera not ready");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: true,
      });

      Alert.alert(
        "Preview Image",
        "",
        [
          { text: "Retake", onPress: () => setScanned(false), style: "cancel" },
          { text: "Send", onPress: () => uploadImage(photo.uri) },
          { text: "View", onPress: () => navigation.navigate("ImagePreview", { uri: photo.uri }) },
        ],
        { cancelable: false }
      );

      console.log("Image URI:", photo.uri);
      console.log("Base64 (first 100 chars):", photo.base64?.slice(0, 100));
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to capture image.");
      setScanned(false);
    }
  };

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
      Alert.alert("respionse", response);
      if (!response.ok) throw new Error(result.detail || "Upload failed");

      const metadata = result.metadata || {};
      const formatted = `
Class Name: ${result.class_name || "N/A"}
Confidence: ${(result.confidence * 100).toFixed(2)}%
Species Name: ${metadata.species_name || "N/A"}
Nomenclature: ${metadata.species_Nomenclature || "N/A"}
Max Size: ${metadata.max_size_cm ? metadata.max_size_cm + " cm" : "N/A"}
Maximum Size: ${metadata.maximum_size || "N/A"}
Ideal pH: ${metadata.ideal_ph_min || "?"} - ${metadata.ideal_ph_max || "?"}
Temperature: ${metadata.temperature || "N/A"}
URL: ${metadata.species_url || "N/A"}
      `;

      Alert.alert("Scan Result", formatted.trim());
      navigation.navigate("PhScanScreen", { tankData: result });
    } catch (error) {
      Alert.alert("Upload Error", error.message);
      setScanned(false);
    } finally {
      setIsUploading(false);
    }
  };

  const flipCamera = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

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
            <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
              <Text style={styles.flipText}>Flip</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default TankScanScreen;

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
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    width: "60%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  flipButton: { padding: 10 },
  flipText: { color: "#fff", fontSize: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
