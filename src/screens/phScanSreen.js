import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation, useRoute } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";

const PhScanScreen = () => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [pHscale, setPhScale] = useState(35.6);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  const handleScan = () => {
    setScanned(true);

    // Simulate tank scanning logic (e.g., ML model or image recognition)
    setTimeout(() => {
      navigation.navigate("TankSuccess", {
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
                <Text style={styles.buttonText}>Scan pH test strip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
                <Text style={styles.flipText}>Flip</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </CameraView>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabel}>
          <MaterialIcons name="ruler" size={24} style={{ color: "white" }} />
          <Text style={{ marginLeft: 6, color: "white" }}>Adjust Accuracy</Text>
        </View>

        <View style={styles.sizeBox}>
          <Text>{pHscale.toFixed(1)}</Text>
        </View>

        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={7}
          value={pHscale}
          onValueChange={setPhScale}
          minimumTrackTintColor="#00CED1"
          maximumTrackTintColor="#000000"
          thumbTintColor="#00CED1"
        />
        <Text style={styles.sliderValue}>{pHscale.toFixed(1)}</Text>
      </View>
    </View>
  );
};

export default PhScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 0.8,
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
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 20,
  },
  sizeBox: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#999",
    padding: 6,
  },
  sliderValue: {
    textAlign: "center",
    color: "#00CED1",
    fontWeight: "bold",
  },
  indicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00CED1",
    marginHorizontal: 4,
  },
});
