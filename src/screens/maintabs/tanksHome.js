import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { baseUrl } from "../../config";
import { AuthContext } from "../../authcontext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TanksScreen() {
  const [searchText, setSearchText] = useState("");
  const { token, logout, activeTankId, activateTank } = useContext(AuthContext);
  const [tanksData, setTanksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noTanks, setNoTanks] = useState(false);
  const navigation = useNavigation();

  // Dummy local images to cycle through
  const localImages = [require("../../assets/tank1.jpg"), require("../../assets/tank2.jpg"), require("../../assets/tank3.jpg"), require("../../assets/tank4.jpg"), require("../../assets/tank5.jpg")];

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchTanks = async () => {
        if (!token) return;
        try {
          setLoading(true);
          const response = await fetch(`${baseUrl}/tanks/get-tanks/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const result = await response.json();

          if (!isActive) return;

          if (response.ok && result.data.tanks) {
            const mappedData = result.data.tanks.map((tank, index) => ({
              id: tank.id,
              name: tank.name,
              dateAdded: tank.created_at?.split("T")[0] ?? "",
              fishType: tank.notes,
              waterType: tank.tank_type === "FRESH" ? "Freshwater" : "Saltwater",
              size: `${tank.size} ${tank.size_unit}`,
              image: localImages[index % localImages.length],
              waterParams: tank?.latest_water_parameters || [],
            }));

            setTanksData(mappedData);
          } else {
            console.error("Failed to fetch tanks here:", result);
            if (result.status_code == 401) {
              logout(); // clear token from context + AsyncStorage
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }
            setTanksData([]);
            setNoTanks(true);
          }
        } catch (error) {
          console.error("Error fetching tanks:", error);
          if (error.status == 401) {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
          setTanksData([]);
          setNoTanks(true);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchTanks();

      return () => {
        isActive = false;
      };
    }, [token, baseUrl])
  );

  const filteredTanks = tanksData.filter((tank) => tank.name.toLowerCase().includes(searchText.toLowerCase()));

  const renderTankCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.cardContent}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ ...styles.tankName, flex: 1 }}>{item.name}</Text>

          <TouchableOpacity
            style={{ ...styles.activateButton, flex: 0.1, justifyContent: "center", backgroundColor: "#1f1f1fff" }}
            onPress={() =>
              navigation.navigate("TankDetail", {
                tankId: item.id,
                tankData: item, // passing existing tank info
              })
            }
          >
            <FontAwesome name="eye" size={20} color="#00CED1" />
          </TouchableOpacity>
        </View>

        <Text style={styles.dateAdded}>Added: {item.dateAdded}</Text>
        <Text style={styles.size}>Size: {item.size}</Text>
        <Text style={styles.fishType}>Fish/Notes: {item.fishType}</Text>
        <Text style={[styles.waterType, { color: item.waterType === "Saltwater" ? "#1E90FF" : "#32CD32" }]}>Water: {item.waterType}</Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={{ ...styles.activateButton, flex: 1, flexDirection: "row", justifyContent: "space-around", backgroundColor: "#1f1f1fff" }}
            onPress={() =>
              navigation.navigate("UpdateTank", {
                tankId: item.id,
                tankData: item, // passing existing tank info
              })
            }
          >
            <Text style={{ ...styles.activateText, color: "#00CED1" }}>Update</Text>
            <AntDesign name="setting" size={24} color="#00CED1" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              ...styles.activateButton,
              flex: 1,
              alignItems: "center",
              backgroundColor: item.id === activeTankId ? "#32CD32" : "#00CED1",
            }}
            onPress={async () => {
              if (item.id === activeTankId) {
                navigation.navigate("Dashboard"); // redirect
              } else {
                await activateTank(item.id);
                Toast.show("Tank activated successfully!", {
                  duration: Toast.durations.SHORT,
                  position: Toast.positions.BOTTOM,
                  backgroundColor: item.id === activeTankId ? "#32CD32" : "#1f1f1fff",

                  textColor: "#fff",
                });
              }
            }}
          >
            <Text style={styles.activateText}>{item.id === activeTankId ? "CHECK STATS" : "ACTIVATE"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#00CED1" />
      </View>
    );
  }
  if (noTanks || (tanksData && tanksData.length == 0)) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <View>
          <MaterialCommunityIcons name="fishbowl-outline" size={150} color="#858585ff" />
        </View>
        <Text style={styles.pText}>No tanks to Show :(</Text>
        <TouchableOpacity
          style={{ ...styles.activateButton, flexDirection: "row", justifyContent: "space-between", paddingLeft: 20, marginTop: 50, borderRadius: 30, boxShadow: "0 10px 10px rgba(0,0,0,0.2)" }}
          onPress={() => navigation.navigate("AddTank")}
        >
          <Text style={{ ...styles.activateText, color: "#000", marginRight: 20, fontSize: 20 }}>Add Tank</Text>
          <AntDesign name="pluscircle" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {console.log(filteredTanks)}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddTank")}>
        <FontAwesome6 name="add" size={24} color="black" />
      </TouchableOpacity>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color="#999" />
        <TextInput placeholder="Search tanks..." placeholderTextColor="#999" value={searchText} onChangeText={setSearchText} style={styles.searchInput} />
      </View>

      <FlatList data={filteredTanks} keyExtractor={(item) => item.id.toString()} renderItem={renderTankCard} contentContainerStyle={{ paddingBottom: 200 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30, // should be half of width/height
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00CED1",
    position: "absolute",
    bottom: 100, // offset so it's not cut off
    right: 20,
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
    zIndex: 9,
  },
  pText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#3f3f3fff",
  },

  container: { flex: 1, backgroundColor: "#F8F8F8", padding: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: "#000" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  image: { width: 100, height: 100, borderRadius: 10, marginRight: 12 },
  cardContent: { flex: 1 },
  tankName: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  dateAdded: { color: "#666", fontSize: 12, marginBottom: 4 },
  size: { color: "#666", fontSize: 12, marginBottom: 5 },
  fishType: { fontSize: 14 },
  waterType: { fontSize: 14, marginBottom: 8 },
  activateButton: {
    backgroundColor: "#00CED1",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  activateText: { color: "#fff", fontWeight: "bold" },
});
