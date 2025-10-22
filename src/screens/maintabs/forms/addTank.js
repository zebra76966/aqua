import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Entypo from "react-native-vector-icons/Entypo";
import { baseUrl } from "../../../config";
import { AuthContext } from "../../../authcontext";
import { Ionicons } from "@expo/vector-icons";

const AddTank = ({ navigation }) => {
  const [tankName, setTankName] = useState("");
  const [tankType, setTankType] = useState("");
  const [tankSize, setTankSize] = useState(35.6);
  const [sizeUnit, setSizeUnit] = useState("L"); // Default Gallons
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { token } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!tankName || !tankType || !tankSize) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/tanks/tank/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: tankName,
          tank_type: tankType.toUpperCase() === "FRESHWATER" ? "FRESH" : "SALT",
          size: parseFloat(tankSize.toFixed(1)),
          size_unit: sizeUnit,
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Tank Added Successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", data?.detail || "Something went wrong.");
        console.error("Tank creation failed:", data);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ ...styles.header }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ ...styles.backBtn, backgroundColor: "#1f1f1f", borderRadius: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#00CED1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Tank</Text>
      </View>
      {/* Tank Name */}
      <View style={styles.inputContainer}>
        <Icon name="hashtag" size={16} color="#333" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Tank Name" placeholderTextColor="#999" value={tankName} onChangeText={setTankName} />
      </View>

      {/* Tank Type Dropdown */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="fish" size={18} color="#333" style={styles.icon} />
        <Picker selectedValue={tankType} style={styles.picker} onValueChange={(itemValue) => setTankType(itemValue)}>
          <Picker.Item label="Tank Type" value="" />
          <Picker.Item label="Freshwater" value="Freshwater" />
          <Picker.Item label="Saltwater" value="Saltwater" />
        </Picker>
      </View>

      {/* Tank Size with Slider */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabel}>
          <MaterialIcons name="ruler" size={16} />
          <Text style={{ marginLeft: 6 }}>Tank Size ({sizeUnit})</Text>
        </View>

        <View style={styles.sizeBox}>
          <Text>{tankSize.toFixed(1)}</Text>
        </View>

        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={200}
          value={tankSize}
          onValueChange={setTankSize}
          minimumTrackTintColor="#00CED1"
          maximumTrackTintColor="#000000"
          thumbTintColor="#00CED1"
        />
        <Text style={styles.sliderValue}>{tankSize.toFixed(1)}</Text>
      </View>

      {/* Toggle Gallons / Litres */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity style={[styles.toggleButton, sizeUnit === "L" && styles.toggleActive]} onPress={() => setSizeUnit("L")}>
          <Text style={sizeUnit === "L" ? styles.toggleTextActive : styles.toggleText}>Litres</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleButton, sizeUnit === "G" && styles.toggleActive]} onPress={() => setSizeUnit("G")}>
          <Text style={sizeUnit === "G" ? styles.toggleTextActive : styles.toggleText}>Gallons</Text>
        </TouchableOpacity>
      </View>

      {/* Notes */}
      <View style={styles.inputContainer}>
        <Entypo name="text" size={18} color="#333" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Notes (optional)" placeholderTextColor="#999" value={notes} onChangeText={setNotes} />
      </View>

      {/* Continue Button or Loader */}
      <TouchableOpacity style={{ ...styles.continueButton, backgroundColor: "#00CED1" }} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <>
            <Text style={{ ...styles.continueText, color: "#000" }}>CONTINUE</Text>
            <Entypo name="chevron-right" size={22} color="#000" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,

    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    color: "#00CED1",
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 24,
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: "#fff",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#000",
  },
  picker: {
    flex: 1,
    height: 50,
    color: "#000",
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#00CED1",
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#00CED1",
  },
  toggleText: {
    color: "#00CED1",
    fontWeight: "bold",
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  continueButton: {
    flexDirection: "row",
    backgroundColor: "#111",
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  continueText: {
    color: "#00CED1",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 10,
    color: "#999",
  },
  saveBtn: {
    backgroundColor: "#1f1f1f",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "#00CED1", fontWeight: "bold", fontSize: 16 },
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
});

export default AddTank;
