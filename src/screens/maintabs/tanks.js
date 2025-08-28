import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { baseUrl } from "../../config";
import { AuthContext } from "../../authcontext";

export default function TanksScreen() {
  const [searchText, setSearchText] = useState("");
  const { token } = useContext(AuthContext);
  const [tanksData, setTanksData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy local images to cycle through
  const localImages = [require("../../assets/tank1.jpg"), require("../../assets/tank2.jpg"), require("../../assets/tank3.jpg"), require("../../assets/tank4.jpg"), require("../../assets/tank5.jpg")];

  useEffect(() => {
    const fetchTanks = async () => {
      try {
        const response = await fetch(`${baseUrl}/tanks/get-tanks/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result.data) {
          const mappedData = result.data.map((tank, index) => ({
            id: tank.id,
            name: tank.name,
            dateAdded: tank.created_at.split("T")[0], // only YYYY-MM-DD
            fishType: tank.notes,
            waterType: tank.tank_type === "FRESH" ? "Freshwater" : "Saltwater",
            size: `${tank.size} ${tank.size_unit}`,
            image: localImages[index % localImages.length], // rotate local images
          }));

          setTanksData(mappedData);
        } else {
          console.error("Failed to fetch tanks:", result);
        }
      } catch (error) {
        console.error("Error fetching tanks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTanks();
  }, []);

  const filteredTanks = tanksData.filter((tank) => tank.name.toLowerCase().includes(searchText.toLowerCase()));

  const renderTankCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.tankName}>{item.name}</Text>
        <Text style={styles.dateAdded}>Added: {item.dateAdded}</Text>
        <Text style={styles.size}>Size: {item.size}</Text>
        <Text style={styles.fishType}>Fish/Notes: {item.fishType}</Text>
        <Text style={[styles.waterType, { color: item.waterType === "Saltwater" ? "#1E90FF" : "#32CD32" }]}>Water: {item.waterType}</Text>

        <TouchableOpacity style={styles.activateButton}>
          <Text style={styles.activateText}>ACTIVATE</Text>
        </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color="#999" />
        <TextInput placeholder="Search tanks..." placeholderTextColor="#999" value={searchText} onChangeText={setSearchText} style={styles.searchInput} />
      </View>

      <FlatList data={filteredTanks} keyExtractor={(item) => item.id.toString()} renderItem={renderTankCard} contentContainerStyle={{ paddingBottom: 100 }} />
    </View>
  );
}

const styles = StyleSheet.create({
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
