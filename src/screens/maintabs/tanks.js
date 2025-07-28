import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";

const tanksData = [
  {
    id: 1,
    name: "Goldfish Paradise",
    lastUpdate: "2 days ago",
    dateAdded: "2025-07-01",
    ph: "7.2",
    fishType: "Goldfish",
    waterType: "Freshwater",
    image: require("../../assets/tank1.jpg"),
  },
  {
    id: 2,
    name: "Tropical Haven",
    lastUpdate: "5 hours ago",
    dateAdded: "2025-07-10",
    ph: "6.8",
    fishType: "Guppies",
    waterType: "Freshwater",
    image: require("../../assets/tank2.jpg"),
  },
  {
    id: 3,
    name: "Cichlid Kingdom",
    lastUpdate: "1 week ago",
    dateAdded: "2025-06-20",
    ph: "8.0",
    fishType: "Cichlids",
    waterType: "Freshwater",
    image: require("../../assets/tank3.jpg"),
  },
  {
    id: 4,
    name: "Marine Beauty",
    lastUpdate: "3 days ago",
    dateAdded: "2025-07-15",
    ph: "8.2",
    fishType: "Clownfish",
    waterType: "Saltwater",
    image: require("../../assets/tank4.jpg"),
  },
  {
    id: 5,
    name: "Betta Bliss",
    lastUpdate: "12 hours ago",
    dateAdded: "2025-07-25",
    ph: "7.0",
    fishType: "Betta",
    waterType: "Freshwater",
    image: require("../../assets/tank5.jpg"),
  },
];

export default function TanksScreen() {
  const [searchText, setSearchText] = useState("");

  const filteredTanks = tanksData.filter((tank) => tank.name.toLowerCase().includes(searchText.toLowerCase()));

  const renderTankCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.tankName}>{item.name}</Text>
        <Text style={styles.dateAdded}>Added: {item.dateAdded}</Text>
        <Text style={styles.lastUpdate}>Last Update: {item.lastUpdate}</Text>

        <Text style={[styles.ph, { color: parseFloat(item.ph) > 8 ? "#ff4d4d" : "#00CED1" }]}>pH: {item.ph}</Text>
        <Text style={[styles.fishType, { color: "#555" }]}>Fish: {item.fishType}</Text>
        <Text style={[styles.waterType, { color: item.waterType === "Saltwater" ? "#1E90FF" : "#32CD32" }]}>Water: {item.waterType}</Text>

        <TouchableOpacity style={styles.activateButton}>
          <Text style={styles.activateText}>ACTIVATE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
  dateAdded: { color: "#666", fontSize: 12 },
  lastUpdate: { color: "#999", fontSize: 12, marginBottom: 5 },
  ph: { fontSize: 14, fontWeight: "bold" },
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
