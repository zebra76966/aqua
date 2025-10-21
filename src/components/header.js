// src/components/Header.js
import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Header() {
  const [profileImage, setProfileImage] = useState(require("../assets/user.jpg"));

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem("localProfileImage");
        if (savedImage) {
          setProfileImage({ uri: savedImage });
        }
      } catch (error) {
        console.error("Error loading profile image:", error);
      }
    };

    const unsubscribe = loadProfileImage();

    // Optional: listen for focus refresh if used in a navigation layout
    const interval = setInterval(loadProfileImage, 2000); // refresh every 2s to reflect changes instantly (you can remove if not needed)

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.headerRow}>
      <Image source={require("../assets/icon.png")} style={styles.logo} />
      <View style={styles.headerIcons}>
        <Feather name="bell" size={24} color="black" style={styles.icon} />
        <Image source={profileImage} style={styles.profileImage} />
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
