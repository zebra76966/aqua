import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Animated, Easing, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { AuthContext } from "../authcontext";
import { baseUrl } from "../config";
import { Camera, CameraView } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import * as ImagePicker from "expo-image-picker";
import { Linking } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import DateTimePicker from "@react-native-community/datetimepicker";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // 🔔 notification pop-up
    shouldShowList: true, // 📱 shows in notification center
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export default function DashboardScreen({ navigation }) {
  const { token, activeTankId, logout } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [logModal, setLogModal] = useState(false);
  const [logText, setLogText] = useState("");
  const [reminderTime, setReminderTime] = useState(null);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const loadLogs = async () => {
    const json = await AsyncStorage.getItem("tank_logs");
    if (!json) return;

    const allLogs = JSON.parse(json);
    const tankLogs = allLogs[activeTankId] || [];
    setLogs(tankLogs);
  };
  useEffect(() => {
    loadLogs();
  }, [activeTankId]);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [activeTankId])
  );

  const saveLogs = async (updatedTankLogs) => {
    try {
      const json = await AsyncStorage.getItem("tank_logs");
      const allLogs = json ? JSON.parse(json) : {};

      // save WITHOUT touching other tanks
      allLogs[activeTankId] = updatedTankLogs;

      await AsyncStorage.setItem("tank_logs", JSON.stringify(allLogs));

      setLogs(updatedTankLogs); // state sync
    } catch (err) {
      console.log("Saving logs failed:", err);
    }
  };

  const handleAddLog = async () => {
    if (!logText.trim()) return alert("Please enter something");

    let reminderId = null;
    if (reminderTime) {
      reminderId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Aquarium Reminder",
          body: logText,
        },
        trigger: { seconds: reminderTime * 60 },
      });
    }

    const newLog = {
      id: Date.now().toString(),
      tankId: activeTankId, // 👈 save tank ID!
      text: logText,
      reminderId,
      created_at: new Date().toISOString(),
    };

    const updated = [newLog, ...logs];
    await saveLogs(updated);

    setLogText("");
    setReminderTime(null);
    setLogModal(false);
  };
  const deleteLog = async (id) => {
    const updated = logs.filter((l) => l.id !== id);
    await saveLogs(updated);
  };

  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const requestAllPermissions = async () => {
    try {
      // Camera
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();

      // Microphone
      const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();

      // Media Library
      const mediaReq = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const mediaCheck = await ImagePicker.getMediaLibraryPermissionsAsync();
      const mediaGranted = mediaReq.status === "granted" || mediaCheck.status === "granted";

      const allGranted = cameraStatus === "granted" && micStatus === "granted" && mediaGranted;

      setPermissionsGranted(allGranted);
      setPermissionsChecked(true);

      if (!allGranted) {
        Alert.alert("Permissions Required", "Camera, Microphone and Media access are required for scanning and uploads.", [
          { text: "Open Settings", onPress: () => Linking.openSettings() },
          { text: "OK" },
        ]);
      }
    } catch (err) {
      console.log("Permission error:", err);
    }
  };

  useEffect(() => {
    requestAllPermissions();
  }, []);
  useFocusEffect(
    useCallback(() => {
      requestAllPermissions();
    }, [])
  );

  const [tankData, setTankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showWorkInProgress, setShowWorkInProgress] = useState(false);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayPercent, setDisplayPercent] = useState(0);

  // Fetch tank data
  // Fetch tank data
  const fetchTankData = useCallback(async () => {
    // 🧠 Handle no tank case first
    if (!token) {
      setErrorMessage("You are not logged in. Please log in again.");
      setLoading(false);
      return;
    }

    if (!activeTankId) {
      setErrorMessage("No active tank found. Please select or create one.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${baseUrl}/monitoring/${activeTankId}/health/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.warn("Unauthorized: Logging out user.");
        setErrorMessage("Session expired. Redirecting to login...");
        setTankData(null);
        setLoading(false);

        setTimeout(() => {
          logout(); // clears token & context
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }], // your login screen name here
          });
        }, 1000);
        return;
      }

      const json = await response.json();

      if (json.status_code === 400 || !json.data || Object.keys(json.data).length === 0) {
        setErrorMessage(json.message || "No data available. Please run a water scan first.");
        setTankData(null);
      } else {
        setTankData(json.data);
      }
    } catch (error) {
      console.error("Error fetching tank health:", error);
      setErrorMessage("Failed to load tank data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [activeTankId, token]);

  // Animate Circle
  const animateHealth = (value) => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => setDisplayPercent(Math.round(value)));
    return () => animatedValue.removeListener(listener);
  }, []);

  useEffect(() => {
    fetchTankData();
  }, [fetchTankData]);

  useFocusEffect(
    useCallback(() => {
      fetchTankData();
    }, [fetchTankData])
  );

  useEffect(() => {
    if (tankData && tankData.overall_health != null) {
      animateHealth(tankData.overall_health);
    }
  }, [tankData]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00CED1" />
        <Text style={{ marginTop: 10 }}>Loading tank health...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.loaderContainer}>
        <Feather name="alert-triangle" size={22} color="#ff4d4d" />
        <Text style={{ marginTop: 10, color: "#333", textAlign: "center", paddingHorizontal: 20 }}>{errorMessage}</Text>

        {/* If no tank or unauthorized, show CTA */}
        <TouchableOpacity style={[styles.quickAddLog, { marginTop: 20 }]} onPress={() => navigation.navigate("Tanks")}>
          <Text style={styles.quickAddText}>GO TO TANKS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!tankData) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Unable to load tank data.</Text>
      </View>
    );
  }

  const { tank_name, overall_health, water_health_score, species_health_score, alerts, water_parameters, species_compatibility } = tankData;

  const circleSize = 150;
  const strokeWidth = 10;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const getHealthColor = () => {
    if (overall_health > 70) return "#4CAF50";
    if (overall_health > 40) return "#FFC107";
    return "#F44336";
  };

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const animatedStroke = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const renderModalContent = () => {
    if (!selectedSection) return null;
    switch (selectedSection) {
      case "water":
        if (!water_parameters || Object.keys(water_parameters).length === 0) return <Text>No water parameters available.</Text>;
        return (
          <View>
            <Text style={styles.modalTitle}>Water Parameters</Text>
            {Object.entries(water_parameters).map(([key, value]) => (
              <Text key={key} style={styles.modalText}>
                {key.replace(/_/g, " ")}: <Text style={{ fontWeight: "bold" }}>{value}</Text>
              </Text>
            ))}
          </View>
        );
      case "alerts":
        return (
          <View>
            <Text style={styles.modalTitle}>Alerts</Text>
            {alerts.length ? (
              alerts.map((a, i) => (
                <Text key={i} style={[styles.modalText, { color: "red" }]}>
                  • {a}
                </Text>
              ))
            ) : (
              <Text style={{ color: "green" }}>No alerts! All good 🎉</Text>
            )}
          </View>
        );
      case "species":
        if (!species_compatibility || species_compatibility.length === 0) return <Text>No species compatibility data available.</Text>;
        return (
          <View>
            <Text style={styles.modalTitle}>Species Compatibility</Text>
            {species_compatibility.map((s, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.modalText}>{s.species_name}</Text>
                <Text style={{ color: s.is_compatible ? "green" : "red" }}>{s.is_compatible ? "Compatible" : "Issues:"}</Text>
                {!s.is_compatible &&
                  s.issues.map((issue, idx) => (
                    <Text key={idx} style={{ color: "red", marginLeft: 8 }}>
                      - {issue}
                    </Text>
                  ))}
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {permissionsChecked && !permissionsGranted ? (
        <View style={styles.permissionGate}>
          <Feather name="lock" size={60} color="#00CED1" />
          <Text style={styles.permissionTitle}>Permissions Required</Text>
          <Text style={styles.permissionDesc}>We need Camera, Microphone and Media permissions to continue.</Text>

          <TouchableOpacity style={styles.permissionButton} onPress={requestAllPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.permissionButton, { backgroundColor: "#777" }]} onPress={() => Linking.openSettings()}>
            <Text style={styles.permissionButtonText}>Open App Settings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 200 }}>
          {/* Tank Header */}
          <View style={styles.tankHeader}>
            <Text style={styles.tankTitle}>{tank_name}</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Tanks", {
                  screen: "TankDetail",
                  params: { tankId: activeTankId }, // 👈 send the active tank id
                })
              }
            >
              <Feather name="settings" size={20} color="black" />
            </TouchableOpacity>
          </View>

          {/* Health Circle */}
          <View style={styles.healthSection}>
            <View style={styles.circleWrapper}>
              <Svg width={circleSize} height={circleSize}>
                <Circle stroke="#fff" fill="transparent" cx={circleSize / 2} cy={circleSize / 2} r={radius} strokeWidth={strokeWidth} />
                {overall_health != null && (
                  <AnimatedCircle
                    stroke={getHealthColor()}
                    fill="transparent"
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={animatedStroke}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${circleSize / 2}, ${circleSize / 2}`}
                  />
                )}
              </Svg>
              <View style={styles.circleContent}>
                <Text style={[styles.healthPercent, { color: getHealthColor() }]}>{overall_health != null ? `${overall_health}%` : "-"}</Text>
                <Text style={styles.healthText}>{overall_health != null ? (overall_health > 70 ? "Healthy" : overall_health > 40 ? "Moderate" : "Poor") : "No Data"}</Text>
              </View>
            </View>

            <View style={styles.weekHealthTextBox}>
              <Text style={styles.weekPercent}>{water_health_score ?? "-"}</Text>
              <Text style={styles.weekText}>Water Health</Text>
              <Text style={[styles.weekPercent, { marginTop: 10 }]}>{species_health_score ?? "-"}</Text>
              <Text style={styles.weekText}>Species Health</Text>
            </View>
          </View>

          {/* Water Parameters Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="droplet" size={18} color="#00CED1" />
              <Text style={styles.cardTitle}>Water Parameters</Text>
            </View>
            {water_parameters && Object.keys(water_parameters).length > 0 ? (
              <>
                <Text numberOfLines={2} ellipsizeMode="tail" style={styles.cardContent}>
                  {Object.entries(water_parameters)
                    .slice(0, 2)
                    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
                    .join(", ")}
                </Text>
                <TouchableOpacity onPress={() => setSelectedSection("water")}>
                  <Text style={styles.viewMore}>View Details</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate("Tanks")} style={{ marginTop: 8 }}>
                <Text style={[styles.viewMore, { color: "#FF5722" }]}>View Tanks</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Alerts Card */}
          <View style={[styles.card, { backgroundColor: "#fff5f5" }]}>
            <View style={styles.cardHeader}>
              <Feather name="alert-triangle" size={18} color="#ff4d4d" />
              <Text style={[styles.cardTitle, { color: "#ff4d4d" }]}>Alerts</Text>
            </View>
            <Text numberOfLines={2} style={{ color: "#ff4d4d" }}>
              {alerts && alerts.length ? alerts.join(", ") : "No alerts! All good 🎉"}
            </Text>
            <TouchableOpacity onPress={() => setSelectedSection("alerts")}>
              <Text style={styles.viewMore}>View Details</Text>
            </TouchableOpacity>
          </View>

          {/* Species Compatibility Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="fish-outline" size={18} color="#00CED1" />
              <Text style={styles.cardTitle}>Species Compatibility</Text>
            </View>
            {species_compatibility && species_compatibility.length > 0 ? (
              <>
                <Text numberOfLines={2} style={styles.cardContent}>
                  {species_compatibility.map((s) => s.species_name).join(", ")}
                </Text>
                <TouchableOpacity onPress={() => setSelectedSection("species")}>
                  <Text style={styles.viewMore}>View Details</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate("Tanks")} style={{ marginTop: 8 }}>
                <Text style={[styles.viewMore, { color: "#FF5722" }]}>View Tanks</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* AI Recommendations - Slidable Cards */}
          {tankData?.ai_recommendations?.recommendations?.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <View style={styles.aiHeader}>
                <Feather name="cpu" size={18} color="#00CED1" />
                <Text style={styles.aiTitle}>AI Recommendations</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToAlignment="center"
                decelerationRate="fast"
                snapToInterval={280} // width of card + margin
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {tankData.ai_recommendations.recommendations.map((rec, index) => (
                  <View key={index} style={styles.aiCardSlide}>
                    <Text style={styles.aiIssue}>⚠ {rec.issue}</Text>

                    <Text style={styles.aiDetails}>{rec.details}</Text>

                    {rec.actions?.length > 0 && (
                      <View style={styles.aiActionsBox}>
                        {rec.actions.map((act, i) => (
                          <View key={i} style={styles.aiActionRow}>
                            <Feather name="check-circle" size={16} color="#00CED1" />
                            <Text style={styles.aiActionText}>{act}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {logs.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <View style={styles.aiHeader}>
                <Feather name="book" size={18} color="#00CED1" />
                <Text style={styles.aiTitle}>Your Logs</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToAlignment="center" decelerationRate="fast" snapToInterval={280} contentContainerStyle={{ paddingRight: 20 }}>
                {logs.map((log) => (
                  <View key={log.id} style={styles.aiCardSlide}>
                    <Text style={{ fontWeight: "700", marginBottom: 6 }}>📝 Log</Text>
                    <Text style={styles.aiDetails}>{log.text}</Text>

                    <Text style={{ marginTop: 8, color: "#777", fontSize: 12 }}>{new Date(log.created_at).toLocaleString()}</Text>

                    {log.reminderId && <Text style={{ marginTop: 4, fontSize: 12, color: "#00A6A6" }}>🔔 Reminder Set</Text>}

                    <TouchableOpacity onPress={() => deleteLog(log.id)} style={{ marginTop: 10 }}>
                      <Text style={{ color: "#D9534F", fontWeight: "bold" }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Quick Add Log */}
          <TouchableOpacity style={styles.quickAddLog} onPress={() => setLogModal(true)}>
            <Text style={styles.quickAddText}>QUICK ADD LOG</Text>
            <AntDesign name="pluscircle" size={20} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* Modal */}
          <Modal animationType="slide" transparent visible={!!selectedSection} onRequestClose={() => setSelectedSection(null)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                {renderModalContent()}
                <TouchableOpacity onPress={() => setSelectedSection(null)} style={styles.closeButton}>
                  <Text style={{ color: "white", fontWeight: "bold" }}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Work in Progress Modal */}
          <Modal visible={showWorkInProgress} transparent animationType="fade" onRequestClose={() => setShowWorkInProgress(false)}>
            <View style={styles.wipOverlay}>
              <Animated.View style={styles.wipContainer}>
                <Feather name="tool" size={50} color="#00CED1" style={{ marginBottom: 16 }} />
                <Text style={styles.wipTitle}>Feature Under Progress</Text>
                <Text style={styles.wipText}>We’re working on this feature. It’ll be available soon 🚀</Text>

                <TouchableOpacity onPress={() => setShowWorkInProgress(false)} style={styles.wipCloseBtn}>
                  <Text style={{ color: "white", fontWeight: "bold" }}>OKAY</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Modal>

          <Modal visible={logModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Add Log</Text>

                <TextInput placeholder="What did you do?" style={styles.inputBox} multiline value={logText} onChangeText={setLogText} />

                {/* Time Picker Trigger */}
                <TouchableOpacity style={styles.timeInput} onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.timeInputLabel}>Reminder Time</Text>
                  <Text style={styles.timeInputValue}>{selectedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
                </TouchableOpacity>

                {/* Show Time Picker */}
                {showTimePicker && (
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="spinner" // iOS-style wheel
                    onChange={(event, date) => {
                      setShowTimePicker(false);
                      if (date) setSelectedTime(date);
                    }}
                  />
                )}

                <TouchableOpacity
                  onPress={() => {
                    // convert selectedTime → minutes difference from now
                    const now = new Date();
                    const diffMs = selectedTime - now;
                    const minutes = Math.max(0, Math.round(diffMs / 60000));
                    setReminderTime(minutes.toString());
                    handleAddLog();
                  }}
                  style={styles.btnPrimary}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setLogModal(false)} style={styles.btnOutline}>
                  <Text style={{ color: "#00CED1", fontWeight: "bold" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#F8F8F8", padding: 16 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", height: "100%", padding: 16 },
  tankHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  tankTitle: { fontWeight: "bold", fontSize: 18 },
  healthSection: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 20 },
  circleWrapper: { justifyContent: "center", alignItems: "center" },
  circleContent: { position: "absolute", alignItems: "center" },
  healthPercent: { fontSize: 28, fontWeight: "bold" },
  healthText: { color: "#666" },
  weekHealthTextBox: { alignItems: "center" },
  weekPercent: { fontWeight: "bold", color: "#00CED1", fontSize: 16 },
  weekText: { color: "#777", fontSize: 12 },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  cardTitle: { marginLeft: 8, fontWeight: "bold" },
  cardContent: { fontSize: 14, marginVertical: 2 },
  viewMore: { color: "#00CED1", fontWeight: "bold", marginTop: 8 },
  quickAddLog: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00CED1",
    padding: 12,
    borderRadius: 30,
    marginBottom: 20,
  },
  quickAddText: { color: "white", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  modalText: { fontSize: 14, marginBottom: 4 },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#00CED1",
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  wipOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  wipContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  wipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00CED1",
    marginBottom: 8,
  },
  wipText: {
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  wipCloseBtn: {
    backgroundColor: "#00CED1",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  permissionGate: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    backgroundColor: "#F8F8F8",
  },

  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    color: "#000",
  },

  permissionDesc: {
    marginTop: 10,
    fontSize: 15,
    textAlign: "center",
    color: "#444",
    marginBottom: 30,
  },

  permissionButton: {
    width: "80%",
    backgroundColor: "#00CED1",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 8,
  },

  permissionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  aiTitle: {
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
    color: "#00A6A6",
  },

  aiCardSlide: {
    width: 260,
    backgroundColor: "#ffffffff",
    padding: 16,
    borderRadius: 14,
    marginRight: 16,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  aiIssue: {
    fontWeight: "700",
    fontSize: 15,
    color: "#D9534F",
    marginBottom: 8,
  },

  aiDetails: {
    fontSize: 13,
    color: "#444",
    marginBottom: 10,
    lineHeight: 18,
  },

  aiActionsBox: {
    marginTop: 4,
  },

  aiActionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  aiActionText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#00CED1",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    color: "#333",
  },
  btnPrimary: {
    backgroundColor: "#00CED1",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#00CED1",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  timeInput: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#00CED1",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F9FFFF",
  },

  timeInputLabel: {
    fontSize: 12,
    color: "#00A6A6",
    fontWeight: "600",
    marginBottom: 4,
  },

  timeInputValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
