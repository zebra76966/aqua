// src/components/Header.js
import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function Header() {
  return (
    <View style={styles.headerRow}>
      <Image source={require("../assets/icon.png")} style={styles.logo} />
      <View style={styles.headerIcons}>
        <Feather name="bell" size={24} color="black" style={styles.icon} />
        <Image source={require("../assets/user.jpg")} style={styles.profileImage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 50,
    backgroundColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  logo: { width: 40, height: 40 },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 10 },
  profileImage: { width: 30, height: 30, borderRadius: 15 },
});
