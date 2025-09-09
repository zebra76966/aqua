import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../../authcontext";
import { baseUrl } from "../../../config";

export default function UpdateTankScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { tankId, tankData } = route.params;

  const [activeForm, setActiveForm] = useState("tank"); // "tank" | "water"

  // Tank form state
  const [name, setName] = useState(tankData?.name || "");
  const [tankType, setTankType] = useState(tankData?.tank_type || "FRESH");
  const [size, setSize] = useState(String(tankData?.size || ""));
  const [sizeUnit, setSizeUnit] = useState(tankData?.size_unit || "L");
  const [notes, setNotes] = useState(tankData?.notes || "");

  // Water parameters form state
  const [temperature, setTemperature] = useState("");
  const [oxygen, setOxygen] = useState("");
  const [nitrite, setNitrite] = useState("");
  const [nitrate, setNitrate] = useState("");
  const [ammonia, setAmmonia] = useState("");

  const updateTank = async () => {
    try {
      const res = await fetch(`${baseUrl}/tanks/tank/update/${tankId}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          tank_type: tankType,
          size: parseFloat(size),
          size_unit: sizeUnit,
          notes,
        }),
      });

      if (res.ok) {
        Alert.alert("Success", "Tank updated successfully");
        navigation.goBack();
      } else {
        const err = await res.json();
        Alert.alert("Error", JSON.stringify(err));
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const updateWaterParams = async () => {
    try {
      const res = await fetch(`${baseUrl}/tanks/${tankId}/water-parameters/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          temperature: parseFloat(temperature),
          estimated_oxygen_mgL: parseFloat(oxygen),
          estimated_nitrite_ppm: parseFloat(nitrite),
          estimated_nitrate_ppm: parseFloat(nitrate),
          estimated_ammonia_ppm: parseFloat(ammonia),
        }),
      });

      if (res.ok) {
        Alert.alert("Success", "Water parameters updated successfully");
        navigation.goBack();
      } else {
        const err = await res.json();
        Alert.alert("Error", JSON.stringify(err));
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const renderTankForm = () => (
    <ScrollView>
      <TextInput style={styles.input} placeholder="Tank Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Tank Type (FRESH/BRACKISH/SALT)" value={tankType} onChangeText={setTankType} />
      <TextInput style={styles.input} placeholder="Size" value={size} onChangeText={setSize} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Size Unit (L/G)" value={sizeUnit} onChangeText={setSizeUnit} />
      <TextInput style={styles.input} placeholder="Notes" value={notes} onChangeText={setNotes} multiline />

      <TouchableOpacity style={styles.saveBtn} onPress={updateTank}>
        <Text style={styles.saveText}>Update Tank</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderWaterForm = () => (
    <ScrollView>
      <TextInput style={styles.input} placeholder="Temperature (°C)" value={temperature} onChangeText={setTemperature} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Oxygen (mg/L)" value={oxygen} onChangeText={setOxygen} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Nitrite (ppm)" value={nitrite} onChangeText={setNitrite} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Nitrate (ppm)" value={nitrate} onChangeText={setNitrate} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Ammonia (ppm)" value={ammonia} onChangeText={setAmmonia} keyboardType="numeric" />

      <TouchableOpacity style={styles.saveBtn} onPress={updateWaterParams}>
        <Text style={styles.saveText}>Update Water Parameters</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={{ ...styles.header }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ ...styles.backBtn, backgroundColor: "#1f1f1f", borderRadius: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#00CED1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Tank</Text>
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleBtn, activeForm === "tank" && styles.activeToggle]} onPress={() => setActiveForm("tank")}>
          <Text style={styles.toggleText}>Tank Info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, activeForm === "water" && styles.activeToggle]} onPress={() => setActiveForm("water")}>
          <Text style={styles.toggleText}>Water Params</Text>
        </TouchableOpacity>
      </View>

      {activeForm === "tank" ? renderTankForm() : renderWaterForm()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8", padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  toggleRow: { flexDirection: "row", marginBottom: 16 },
  toggleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ddd",
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeToggle: { backgroundColor: "#00CED1" },
  toggleText: { color: "#fff", fontWeight: "bold" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  saveBtn: {
    backgroundColor: "#1f1f1f",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "#00CED1", fontWeight: "bold", fontSize: 16 },
});
