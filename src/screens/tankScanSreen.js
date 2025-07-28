import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation, useRoute } from "@react-navigation/native";

const TankScanScreen = () => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  const handleScan = () => {
    setScanned(true);

    // Simulate tank scanning logic (e.g., ML model or image recognition)
    setTimeout(() => {
      navigation.navigate("PhScanScreen", {
        tankData: route.params?.tankData || {},
      });
    }, 2000); // Replace this with actual scanning logic
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
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          {scanned ? (
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
      </CameraView>
    </View>
  );
};

export default TankScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
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
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  flipButton: {
    padding: 10,
  },
  flipText: {
    color: "#fff",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
