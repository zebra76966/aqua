import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Animated, Easing } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { AuthContext } from "../authcontext";
import { baseUrl } from "../config";

export default function DashboardScreen({ navigation }) {
  const { token, activeTankId } = useContext(AuthContext);
  const [tankData, setTankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayPercent, setDisplayPercent] = useState(0);

  // Fetch tank data
  const fetchTankData = useCallback(async () => {
    if (!activeTankId || !token) return;
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
      const json = await response.json();
      console.log("Active Tank Response:", json);

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
        <TouchableOpacity
          style={[styles.quickAddLog, { marginTop: 20 }]}
          onPress={() => navigation.navigate("Tanks")}

          // fetchTankData
        >
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 200 }}>
      {/* Tank Header */}
      <View style={styles.tankHeader}>
        <Text style={styles.tankTitle}>{tank_name}</Text>
        <TouchableOpacity>
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

      {/* Quick Add Log */}
      <TouchableOpacity style={styles.quickAddLog}>
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
    </ScrollView>
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
});
