import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../../authcontext";
import { baseUrl } from "../../../config";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function UpdateTankScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { tankId, tankData } = route.params;

  const [activeForm, setActiveForm] = useState("tank"); // "tank" | "water"

  // Tank form state
  const [name, setName] = useState(tankData?.name || "");
  const [tankType, setTankType] = useState(tankData?.waterType || "FRESH");
  const [size, setSize] = useState(String(tankData?.size || ""));
  const [sizeUnit, setSizeUnit] = useState(tankData?.size_unit || "L");
  const [notes, setNotes] = useState(tankData?.notes || "");

  // Water parameters form state
  const [temperature, setTemperature] = useState(String(tankData?.waterParams?.temperature ?? ""));
  const [oxygen, setOxygen] = useState(String(tankData?.waterParams?.estimated_oxygen_mgL ?? ""));
  const [nitrite, setNitrite] = useState(String(tankData?.waterParams?.estimated_nitrite_ppm ?? ""));
  const [nitrate, setNitrate] = useState(String(tankData?.waterParams?.estimated_nitrate_ppm ?? ""));
  const [ammonia, setAmmonia] = useState(String(tankData?.waterParams?.estimated_ammonia_ppm ?? ""));
  const [ph, setPh] = useState(String(tankData?.waterParams?.estimated_ph ?? ""));

  // New saltwater parameters
  const [magnesium, setMagnesium] = useState(String(tankData?.waterParams?.magnesium_mgL ?? ""));
  const [alkalinity, setAlkalinity] = useState(String(tankData?.waterParams?.alkalinity_dkh ?? ""));
  const [calcium, setCalcium] = useState(String(tankData?.waterParams?.calcium_mgL ?? ""));
  const [phosphate, setPhosphate] = useState(String(tankData?.waterParams?.phosphate_ppm ?? ""));

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
      const body = {
        temperature: parseFloat(temperature),
        estimated_oxygen_mgL: parseFloat(oxygen),
        estimated_nitrite_ppm: parseFloat(nitrite),
        estimated_nitrate_ppm: parseFloat(nitrate),
        estimated_ammonia_ppm: parseFloat(ammonia),
        estimated_ph: parseFloat(ph),
        // Saltwater-specific fields
        magnesium_mgL: tankType === "SALT" ? parseFloat(magnesium) : null,
        alkalinity_dkh: tankType === "SALT" ? parseFloat(alkalinity) : null,
        calcium_mgL: tankType === "SALT" ? parseFloat(calcium) : null,
        phosphate_ppm: tankType === "SALT" ? parseFloat(phosphate) : null,
      };

      const res = await fetch(`${baseUrl}/tanks/${tankId}/water-parameters/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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

  const renderInput = (label, value, setter, placeholder) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 6 }}>{label}</Text>
      <TextInput style={styles.input} placeholder={placeholder} value={value} onChangeText={setter} keyboardType="numeric" />
    </View>
  );

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

  const renderWaterForm = () => {
    const hasValues =
      temperature.trim() !== "" ||
      oxygen.trim() !== "" ||
      nitrite.trim() !== "" ||
      nitrate.trim() !== "" ||
      ammonia.trim() !== "" ||
      ph.trim() !== "" ||
      (tankType === "SALT" && (magnesium.trim() !== "" || alkalinity.trim() !== "" || calcium.trim() !== "" || phosphate.trim() !== ""));

    return (
      <ScrollView>
        <TouchableOpacity
          style={{
            ...styles.activateButton,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 20,
            marginBottom: 50,
            borderRadius: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 6,
            backgroundColor: "#ff8c00",
          }}
          onPress={() =>
            navigation.navigate("PhScanScreen", {
              onScanComplete: (result) => {
                // Common parameters
                if (result?.estimated_ph !== undefined) setPh(String(result.estimated_ph));
                if (result?.estimated_oxygen_mgL !== undefined) setOxygen(String(result.estimated_oxygen_mgL));
                if (result?.estimated_nitrite_ppm !== undefined) setNitrite(String(result.estimated_nitrite_ppm));
                if (result?.estimated_nitrate_ppm !== undefined) setNitrate(String(result.estimated_nitrate_ppm));
                if (result?.estimated_ammonia_ppm !== undefined) setAmmonia(String(result.estimated_ammonia_ppm));
                if (result?.temperature !== undefined) setTemperature(String(result.temperature));

                // Saltwater-specific parameters (only update if tankType === "SALT")
                if (tankType === "Salwater") {
                  if (result?.magnesium_mgL !== undefined) setMagnesium(String(result.magnesium_mgL));
                  if (result?.alkalinity_dkh !== undefined) setAlkalinity(String(result.alkalinity_dkh));
                  if (result?.calcium_mgL !== undefined) setCalcium(String(result.calcium_mgL));
                  if (result?.phosphate_ppm !== undefined) setPhosphate(String(result.phosphate_ppm));
                }
              },
            })
          }
        >
          <Text
            style={{
              ...styles.activateText,
              color: "#000",
              marginRight: 12,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Scan Water Parameters
          </Text>

          <MaterialCommunityIcons name="cube-scan" size={24} color="#000" />
        </TouchableOpacity>

        {renderInput("Temperature (°C)", temperature, setTemperature, "Enter temperature")}
        {renderInput("Oxygen (mg/L)", oxygen, setOxygen, "Enter oxygen")}
        {renderInput("Nitrite (ppm)", nitrite, setNitrite, "Enter nitrite")}
        {renderInput("Nitrate (ppm)", nitrate, setNitrate, "Enter nitrate")}
        {renderInput("Ammonia (ppm)", ammonia, setAmmonia, "Enter ammonia")}
        {renderInput("pH", ph, setPh, "Enter pH")}

        {tankType === "Saltwater" && (
          <>
            <Text style={{ fontSize: 16, fontWeight: "700", marginTop: 20, marginBottom: 10 }}>Saltwater Parameters</Text>
            {renderInput("Magnesium (mg/L)", magnesium, setMagnesium, "Enter magnesium")}
            {renderInput("Alkalinity (dKH)", alkalinity, setAlkalinity, "Enter alkalinity")}
            {renderInput("Calcium (mg/L)", calcium, setCalcium, "Enter calcium")}
            {renderInput("Phosphate (ppm)", phosphate, setPhosphate, "Enter phosphate")}
          </>
        )}

        {hasValues && (
          <TouchableOpacity style={styles.saveBtn} onPress={updateWaterParams}>
            <Text style={styles.saveText}>Update Water Parameters</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={{ ...styles.container, paddingBottom: 100 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ ...styles.backBtn, backgroundColor: "#1f1f1f", borderRadius: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#00CED1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Tank</Text>
      </View>

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
  activateButton: {
    backgroundColor: "#00CED1",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
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
