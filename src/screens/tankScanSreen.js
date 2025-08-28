import React, { useState, useEffect, useContext, useRef } from "react";
import { useRoute } from "@react-navigation/native";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, TextInput, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../authcontext";
import { baseUrl } from "../config";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RBSheet from "react-native-raw-bottom-sheet";
import * as ImageManipulator from "expo-image-manipulator";

const TankScanScreen = () => {
  const route = useRoute();
  const { tankDataLocal } = route.params;
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scanData, setScanData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempData, setTempData] = useState({});

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

      // ✅ Normalize response into your UI format
      const arrayData = Array.isArray(result) ? result : [result];

      const mappedData = arrayData.map((item) => {
        const predictions = item?.data?.predictions || {};
        return {
          class_name: predictions.class_name || "Unknown",
          confidence: predictions.confidence || 0,
          metadata: predictions.metadata || {},
          image_url: item?.data?.image_url || null,
        };
      });

      setScanData(mappedData);
      console.log("res (mapped):", mappedData);
      sheetRef.current.open();
    } catch (error) {
      alert(error.message);
      setScanned(false);
    } finally {
      setIsUploading(false);
      setScanned(false);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setTempData({ ...scanData[index] });
  };

  const handleSaveEdit = () => {
    const updated = [...scanData];
    updated[editingIndex] = tempData;
    setScanData(updated);
    setEditingIndex(null);
  };

  const handleRemove = (index) => {
    const updated = scanData.filter((_, i) => i !== index);
    setScanData(updated);
  };

  const flipCamera = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const renderFishCard = (fish, index) => {
    const metadata = fish.metadata || {};
    const isEditing = editingIndex === index;

    return (
      <View key={index} style={styles.card}>
        {/* Show fish image if available */}
        {fish.image_url && (
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <Image source={{ uri: fish.image_url }} style={styles.fishImage} resizeMode="cover" />
          </View>
        )}

        {isEditing ? (
          <>
            <TextInput style={styles.input} value={tempData.class_name} onChangeText={(t) => setTempData((p) => ({ ...p, class_name: t }))} />
            <TextInput
              style={styles.input}
              value={metadata.species_name}
              onChangeText={(t) =>
                setTempData((p) => ({
                  ...p,
                  metadata: { ...p.metadata, species_name: t },
                }))
              }
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.row}>
              <Icon name="tag" size={20} color="#007AFF" />
              <Text style={styles.label}>Class Name:</Text>
              <Text style={styles.value}>{fish.class_name}</Text>
            </View>
            <View style={styles.row}>
              <Icon name="check-decagram" size={20} color="green" />
              <Text style={styles.label}>Confidence:</Text>
              <Text style={styles.value}>{(fish.confidence * 100).toFixed(1)}%</Text>
            </View>

            <View style={styles.row}>
              <Icon name="fish" size={20} color="#FF8C00" />
              <Text style={styles.label}>Species:</Text>
              <Text style={styles.value}>{metadata?.species_name || "N/A"}</Text>
            </View>
            <Text style={styles.fishText}>Max Size: {metadata.max_size_cm} cm</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(index)}>
                <Icon name="pencil" size={25} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleRemove(index)}>
                <Icon name="delete" size={25} color="red" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
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
        closeOnDragDown
        closeOnPressMask
        height={550}
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
          <Text style={styles.modalTitle}>Scan Results</Text>
          {scanData.map((fish, index) => renderFishCard(fish, index))}
          {scanData.length > 0 && (
            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={() => {
                sheetRef.current.close();
                navigation.navigate("PhScanScreen", { tankData: scanData, tankName: tankDataLocal.name });
              }}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          )}
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
  card: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  fishTitle: { fontSize: 16, fontWeight: "bold" },
  fishText: { fontSize: 14, marginTop: 4 },
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 6,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
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
  fishImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
  },
});
