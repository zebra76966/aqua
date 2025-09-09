import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../authcontext";
import { baseUrl } from "../../config";
import AntDesign from "@expo/vector-icons/AntDesign";

const TankDetailsScreen = () => {
  const route = useRoute();
  const { token } = useContext(AuthContext);
  const { tankId } = route.params;
  const navigation = useNavigation();

  const [tank, setTank] = useState(null);
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  // add species form fields
  const [className, setClassName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchTankData();
  }, [tankId, token]);

  const fetchTankData = async () => {
    try {
      const tankRes = await fetch(`${baseUrl}/tanks/tank/${tankId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tankJson = await tankRes.json();

      const speciesRes = await fetch(`${baseUrl}/tanks/${tankId}/species/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const speciesJson = await speciesRes.json();

      setTank(tankJson.data);
      setSpecies(speciesJson.species);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpecies = async () => {
    if (!selectedSpecies) return;
    setLoading(true);
    try {
      await fetch(`${baseUrl}/tanks/species/delete/${selectedSpecies.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(`${baseUrl}/tanks/species/delete/${selectedSpecies.id}`);
      setSpecies(species.filter((s) => s.id !== selectedSpecies.id));
      setDeleteModalVisible(false);
      setLoading(false);
    } catch (err) {
      console.error(err);
      console.log(err);
      setLoading(false);
      Alert.alert("Error", "Failed to delete species");
    }
  };

  const handleAddSpecies = async () => {
    if (!className || !quantity) {
      Alert.alert("Error", "Class name and quantity are required");
      return;
    }

    try {
      const body = {
        tank_id: tankId,
        class_name: className,
        quantity: parseInt(quantity),
        notes,
        last_scan_image_url: imageUrl,
      };

      await fetch(`${baseUrl}/tanks/${tankId}/add-species/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      setAddModalVisible(false);
      setClassName("");
      setQuantity("");
      setNotes("");
      setImageUrl("");
      fetchTankData(); // refresh species
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to add species");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={styles.colors.primary} />
      </View>
    );
  }

  if (!tank) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Failed to load tank data</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, ...styles.container }}>
      {/* Tank Header */}
      <View style={styles.tankCard}>
        <MaterialCommunityIcons name="fishbowl" size={40} color={styles.colors.primary} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.tankName}>{tank.name}</Text>
          <Text style={styles.tankDetail}>
            {tank.tank_type} • {tank.size} {tank.size_unit}
          </Text>
          <Text style={styles.tankNotes}>{tank.notes}</Text>
        </View>
      </View>

      {/* Species List */}
      <Text style={styles.sectionTitle}>Species</Text>

      {species && species.length === 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <MaterialCommunityIcons name="jellyfish-outline" size={50} color="#858585ff" />
          <Text style={styles.pText}>No Species found :(</Text>

          <TouchableOpacity
            style={{
              ...styles.activateButton,
              flexDirection: "row",
              justifyContent: "space-between",
              paddingLeft: 20,
              marginTop: 50,
              borderRadius: 30,
              boxShadow: "0 10px 10px rgba(0,0,0,0.2)",
              backgroundColor: "#ff8c00",
            }}
            onPress={() => {
              navigation.navigate("TankScanScreenTabs", {
                tankDataLocal: tank,
                tankId: tank.id,
              });
            }}
          >
            <Text style={{ ...styles.activateText, color: "#000", marginRight: 20, fontSize: 18 }}>Add Species</Text>
            <MaterialCommunityIcons name="cube-scan" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={species}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.speciesCard}>
              {/* Image */}
              <Image source={{ uri: item.last_scan_image_url }} style={styles.speciesImage} />

              {/* Content */}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.speciesName}>{item.metadata.species_name}</Text>
                <Text style={styles.speciesScientific}>{item.metadata.species_Nomenclature}</Text>

                {/* Info rows with icons */}
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="jellyfish-outline" size={16} color="#00CED1" />
                  <Text style={styles.speciesDetail}>{item.quantity} fish</Text>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="maximize" size={16} color="#ff8c00" />
                  <Text style={styles.speciesDetail}>Max Size: {item.metadata.maximum_size}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="thermometer" size={16} color="#e63946" />
                  <Text style={styles.speciesDetail}>Temp: {item.metadata.temperature}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="droplet" size={16} color="#1d3557" />
                  <Text style={styles.speciesDetail}>
                    pH: {item.metadata.ideal_ph_min} - {item.metadata.ideal_ph_max}
                  </Text>
                </View>
              </View>

              {/* Delete button */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  setSelectedSpecies(item);
                  setDeleteModalVisible(true);
                }}
              >
                <Feather name="trash-2" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { bottom: 110, backgroundColor: "#ff8c00" }]}
        onPress={() => {
          navigation.navigate("TankScanScreenTabs", {
            tankDataLocal: tank,
            tankId: tank.id,
          });
        }}
      >
        <MaterialCommunityIcons name="cube-scan" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Delete Confirm Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete {selectedSpecies?.metadata?.species_name}?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "red" }]} onPress={handleDeleteSpecies}>
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Text style={styles.modalBtnText}>Delete</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#aaa" }]} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00CED1",
    position: "absolute",
    bottom: 40,
    right: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  colors: {
    primary: "#00CED1",
    secondary: "#000",
    white: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  tankCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  tankName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  tankDetail: {
    fontSize: 14,
    color: "#555",
    marginVertical: 2,
  },
  tankNotes: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  speciesCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  speciesImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },

  speciesName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },

  speciesScientific: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 6,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  speciesDetail: {
    fontSize: 13,
    color: "#333",
    marginLeft: 6,
  },

  deleteBtn: {
    backgroundColor: "#e63946",
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  pText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#3f3f3f",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  activateButton: {
    backgroundColor: "#00CED1",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  activateText: { color: "#fff", fontWeight: "bold" },
});

export default TankDetailsScreen;
