// TankSuccessScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";

export default function TankSuccessScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>AQUA AI</Text>

      <View style={{ alignItems: "center" }}>
        <AntDesign name="checkcircle" size={70} color="#00CED1" style={{ marginBottom: 20 }} />
      </View>
      <Text style={styles.successText}>Scan Completed</Text>
      <Text style={styles.successTextBold}>Tank #name</Text>
      <Text style={styles.successText}>Added Successfully!</Text>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Another</Text>
        <Entypo name="plus" size={20} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate("MainTabs")}>
        <Text style={styles.continueText}>CONTINUE TO DASHBOARD</Text>
        <Entypo name="chevron-right" size={22} color="#00CED1" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: "center", backgroundColor: "#f9f9f9" },
  logo: { textAlign: "center", fontSize: 26, color: "#00CED1", marginBottom: 30 },
  successText: { textAlign: "center", fontSize: 18, color: "#00CED1", marginTop: 5 },
  successTextBold: { textAlign: "center", fontSize: 20, fontWeight: "bold", color: "#00CED1" },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#00CED1",
    padding: 12,
    alignSelf: "center",
    borderRadius: 30,
    marginTop: 30,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  addButtonText: { fontWeight: "bold", marginRight: 10 },
  continueButton: {
    flexDirection: "row",
    backgroundColor: "#111",
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    marginTop: 40,
  },
  continueText: { color: "#00CED1", fontWeight: "bold", marginRight: 10 },
});
