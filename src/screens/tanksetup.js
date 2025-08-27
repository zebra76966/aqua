import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Entypo from "react-native-vector-icons/Entypo";

const TankSetupScreen = ({ navigation }) => {
  const [tankName, setTankName] = useState("");
  const [tankType, setTankType] = useState("");
  const [tankSize, setTankSize] = useState(35.6);
  const [species, setSpecies] = useState("");

  return (
    <View style={styles.container}>
      {/* Logo */}
      {/* <Image source={require("../../assets/icon.png")} style={styles.logo} /> */}
      <Text style={styles.title}>AQUA AI</Text>

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
          <Picker.Item label="Freshwater" value="freshwater" />
          <Picker.Item label="Saltwater" value="saltwater" />
        </Picker>
      </View>

      {/* Tank Size with Slider */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabel}>
          <MaterialIcons name="ruler" size={16} />
          <Text style={{ marginLeft: 6 }}>Tank Size (gallons)</Text>
        </View>

        <View style={styles.sizeBox}>
          <Text>{tankSize.toFixed(1)}</Text>
        </View>

        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={100}
          value={tankSize}
          onValueChange={setTankSize}
          minimumTrackTintColor="#00CED1"
          maximumTrackTintColor="#000000"
          thumbTintColor="#00CED1"
        />
        <Text style={styles.sliderValue}>{tankSize.toFixed(1)}</Text>
      </View>

      {/* Species */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="fish" size={18} color="#333" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Species" placeholderTextColor="#999" value={species} onChangeText={setSpecies} />
        <Entypo name="magnifying-glass" size={18} color="#333" />
      </View>

      {/* Indicator */}
      <View style={styles.indicator}>
        <View style={styles.dotActive} />
        <View style={styles.dot} />
      </View>

      {/* Continue Button */}

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() =>
          navigation.navigate("PhScanScreen", {
            tankData: { tankName, tankType, tankSize, species },
          })
        }
      >
        <Text style={styles.continueText}>CONTINUE</Text>
        <Entypo name="chevron-right" size={22} color="#00CED1" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#f9f9f9",
  },
  logo: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 10,
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
});

export default TankSetupScreen;
