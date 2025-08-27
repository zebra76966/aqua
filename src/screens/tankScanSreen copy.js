import React, { useState, useEffect, useContext, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../authcontext";
import { baseUrl } from "../config";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RBSheet from "react-native-raw-bottom-sheet";
import * as ImageManipulator from "expo-image-manipulator";

const TankScanScreen = () => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scanData, setScanData] = useState(null);

  const cameraRef = useRef(null);
  const sheetRef = useRef(null);

  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  const handleScan = async () => {
    try {
      setScanned(true);
      if (!cameraRef.current) throw new Error("Camera not ready");

      let photo = await cameraRef.current.takePictureAsync({
        quality: 0.5, // reduce initial size
        skipProcessing: true,
      });

      // Compress and resize further if needed
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }], // Resize to max width 1024px
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      uploadImage(manipulated.uri);
    } catch (error) {
      alert(error.message || "Failed to capture image.");
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

      console.log(response);
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Upload failed");

      setScanData(result);
      sheetRef.current.open(); // open bottom sheet
    } catch (error) {
      alert(error.message);
      setScanned(false);
    } finally {
      setIsUploading(false);
      setScanned(false);
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

      {/* Bottom Sheet */}
      <RBSheet
        ref={sheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={500} // Default height (half screen)
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
          <Text style={styles.modalTitle}>Scan Result</Text>
          {scanData && (
            <>
              <View style={styles.row}>
                <Icon name="tag" size={20} color="#007AFF" />
                <Text style={styles.label}>Class Name:</Text>
                <Text style={styles.value}>{scanData.class_name || "N/A"}</Text>
              </View>

              <View style={styles.row}>
                <Icon name="check-decagram" size={20} color="green" />
                <Text style={styles.label}>Confidence:</Text>
                <Text style={styles.value}>{(scanData.confidence * 100).toFixed(2)}%</Text>
              </View>

              <View style={styles.row}>
                <Icon name="fish" size={20} color="#FF8C00" />
                <Text style={styles.label}>Species Name:</Text>
                <Text style={styles.value}>{scanData.metadata?.species_name || "N/A"}</Text>
              </View>

              <View style={styles.row}>
                <Icon name="format-letter-case" size={20} color="#8A2BE2" />
                <Text style={styles.label}>Nomenclature:</Text>
                <Text style={styles.value}>{scanData.metadata?.species_Nomenclature || "N/A"}</Text>
              </View>

              <View style={styles.row}>
                <Icon name="ruler" size={20} color="#DC143C" />
                <Text style={styles.label}>Max Size:</Text>
                <Text style={styles.value}>{scanData.metadata?.max_size_cm ? `${scanData.metadata.max_size_cm} cm` : "N/A"}</Text>
              </View>

              <View style={styles.row}>
                <Icon name="thermometer" size={20} color="#FF6347" />
                <Text style={styles.label}>Temperature:</Text>
                <Text style={styles.value}>{scanData.metadata?.temperature || "N/A"}</Text>
              </View>

              <View style={styles.row}>
                <Icon name="earth" size={20} color="#4682B4" />
                <Text style={styles.label}>URL:</Text>
                <Text style={styles.value}>{scanData.metadata?.species_url || "N/A"}</Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, { marginTop: 20 }]}
            onPress={() => {
              sheetRef.current.close();
              navigation.navigate("PhScanScreen", { tankData: scanData });
            }}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </ScrollView>
      </RBSheet>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    marginLeft: 8,
    flex: 1,
  },
  value: {
    flex: 1,
    textAlign: "right",
  },
});
