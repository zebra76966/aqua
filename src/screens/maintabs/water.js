import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Animated, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const { height } = Dimensions.get("window");
export default function WaterScreen() {
  const [search, setSearch] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (filterVisible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [filterVisible]);

  const [waterData] = useState([
    {
      tank: "Goldfish Paradise",
      ph: 7.2,
      temperature: "24°C",
      ammonia: "0.02 ppm",
      nitrate: "15 ppm",
      hardness: "8 dGH",
      lastUpdated: "2025-07-20",
      nextChange: "In 3 days",
      image: require("../../assets/tank1.jpg"),
    },
    {
      tank: "Tropical Haven",
      ph: 6.8,
      temperature: "26°C",
      ammonia: "0.05 ppm",
      nitrate: "20 ppm",
      hardness: "10 dGH",
      lastUpdated: "2025-07-27",
      nextChange: "Tomorrow",
      image: require("../../assets/tank2.jpg"),
    },
    {
      tank: "Cichlid Kingdom",
      ph: 8.0,
      temperature: "28°C",
      ammonia: "0.03 ppm",
      nitrate: "18 ppm",
      hardness: "12 dGH",
      lastUpdated: "2025-07-15",
      nextChange: "In 5 days",
      image: require("../../assets/tank3.jpg"),
    },
    {
      tank: "Marine Bliss",
      ph: 8.2,
      temperature: "25°C",
      ammonia: "0.01 ppm",
      nitrate: "10 ppm",
      hardness: "15 dGH",
      lastUpdated: "2025-07-18",
      nextChange: "In 2 days",
      image: require("../../assets/tank4.jpg"),
    },
    {
      tank: "Shrimp World",
      ph: 6.5,
      temperature: "23°C",
      ammonia: "0.00 ppm",
      nitrate: "5 ppm",
      hardness: "6 dGH",
      lastUpdated: "2025-07-25",
      nextChange: "In 1 week",
      image: require("../../assets/tank5.jpg"),
    },
  ]);

  const applyFilter = (data) => {
    if (selectedFilter === "lowPH") return data.filter((i) => i.ph < 7);
    if (selectedFilter === "highPH") return data.filter((i) => i.ph > 7.5);
    if (selectedFilter === "lowAmmonia") return data.filter((i) => parseFloat(i.ammonia) <= 0.02);
    return data;
  };

  const filteredData = applyFilter(waterData.filter((item) => item.tank.toLowerCase().includes(search.toLowerCase())));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Water Quality</Text>
        <Feather name="droplet" size={28} color="#00CED1" />
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#aaa" />
          <TextInput style={styles.searchInput} placeholder="Search tanks..." value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
          <Feather name="filter" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {filteredData.map((item, index) => (
          <View key={index} style={styles.card}>
            <Image source={item.image} style={styles.cardImage} />
            <Text style={styles.tankName}>{item.tank}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>pH:</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color: item.ph < 6.5 || item.ph > 8 ? "red" : "#00CED1",
                  },
                ]}
              >
                {item.ph}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Temperature:</Text>
              <Text style={styles.value}>{item.temperature}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Ammonia:</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color: parseFloat(item.ammonia) > 0.05 ? "red" : "#00CED1",
                  },
                ]}
              >
                {item.ammonia}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Nitrate:</Text>
              <Text style={styles.value}>{item.nitrate}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Hardness:</Text>
              <Text style={styles.value}>{item.hardness}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Last Updated:</Text>
              <Text style={styles.value}>{item.lastUpdated}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Next Water Change:</Text>
              <Text style={styles.nextChange}>{item.nextChange}</Text>
            </View>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>ADD WATER LOG</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Filter Modal */}
      {filterVisible && (
        <Modal transparent animationType="none" visible={filterVisible}>
          <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <TouchableOpacity style={styles.overlayTouchable} onPress={() => setFilterVisible(false)} />
            <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              {[
                { key: "lowPH", label: "Low pH Tanks (below 7)" },
                { key: "highPH", label: "High pH Tanks (above 7.5)" },
                { key: "lowAmmonia", label: "Low Ammonia Tanks" },
              ].map((filter) => (
                <TouchableOpacity key={filter.key} style={[styles.option, selectedFilter === filter.key && styles.selectedOption]} onPress={() => setSelectedFilter(filter.key)}>
                  <Text style={[styles.optionText, selectedFilter === filter.key && styles.selectedOptionText]}>{filter.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.option} onPress={() => setSelectedFilter(null)}>
                <Text style={styles.optionText}>Clear Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={() => setFilterVisible(false)}>
                <Text style={styles.buttonText}>Apply & Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </BlurView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F8F8",
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: "#00CED1",
    padding: 12,
    borderRadius: 8,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  tankName: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  label: {
    color: "#555",
  },
  value: {
    fontWeight: "bold",
    color: "#00CED1",
  },
  nextChange: {
    fontWeight: "bold",
    color: "#FFA500",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#00CED1",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  option: {
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOption: {
    backgroundColor: "#00CED1",
  },
  selectedOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
