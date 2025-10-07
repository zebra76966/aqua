import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../authcontext";
import { baseUrl } from "../../config";

const TankDetailsScreen = () => {
  const route = useRoute();
  const { token } = useContext(AuthContext);
  const { tankId } = route.params;
  const navigation = useNavigation();

  const [tank, setTank] = useState(null);
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [compatibilityModalVisible, setCompatibilityModalVisible] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [compatibilityIssues, setCompatibilityIssues] = useState([]);

  const [className, setClassName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchTankData();
  }, [tankId, token]);

  const fetchTankData = async () => {
    try {
      setLoading(true);
      const tankRes = await fetch(`${baseUrl}/tanks/tank/${tankId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tankJson = await tankRes.json();
      console.log("Fetched tank data:", tankJson);
      const speciesRes = await fetch(`${baseUrl}/tanks/${tankId}/species/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const speciesJson = await speciesRes.json();

      // Fetch compatibility for each species
      const speciesWithCompatibility = await Promise.all(
        speciesJson.species.map(async (item) => {
          const compatibilityRes = await fetch(
            `${baseUrl}/monitoring/${tankId}/check-compatibility/`, // Use the provided API URL
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`, // Use the token from AuthContext
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ class_name: item.metadata.species_Nomenclature }),
            }
          );
          const compatibilityJson = await compatibilityRes.json();
          return { ...item, compatibility: compatibilityJson };
        })
      );

      setTank(tankJson.data);
      setSpecies(speciesWithCompatibility);
    } catch (err) {
      console.error("Error fetching data:", err);
      Alert.alert("Error", "Failed to load tank data or check compatibility.");
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
      setSpecies(species.filter((s) => s.id !== selectedSpecies.id));
      setDeleteModalVisible(false);
      setLoading(false);
    } catch (err) {
      console.error(err);
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
      // Don't reset form fields here, assume a successful add leads to navigating back or clearing via context.
      // setAddModalVisible(false); // If you have an add modal, close it
      // setClassName("");
      // setQuantity("");
      // setNotes("");
      // setImageUrl("");
      fetchTankData(); // Refresh species list and compatibility data
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to add species");
    }
  };

  const showCompatibilityIssues = (item) => {
    setSelectedSpecies(item);
    setCompatibilityIssues(item.compatibility.issues);
    setCompatibilityModalVisible(true);
  };

  const getIssueIcon = (issueText) => {
    if (issueText.toLowerCase().includes("temperature")) {
      return <MaterialCommunityIcons name="thermometer-alert" size={20} color="#e63946" />;
    }
    if (issueText.toLowerCase().includes("ph")) {
      return <MaterialCommunityIcons name="water-alert" size={20} color="#1d3557" />;
    }
    // Add more conditions for other types of issues if needed
    return <AntDesign name="exclamationcircleo" size={20} color="#ff8c00" />; // Default icon
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

      {/* Water Parameters Section */}
      {tank.latest_water_parameters && (
        <View style={styles.waterParamsCard}>
          <Text style={styles.sectionTitle}>Water Parameters</Text>

          <View style={styles.paramRow}>
            <Feather name="droplet" size={18} color="#0077b6" />
            <Text style={styles.paramLabel}>pH:</Text>
            <Text style={styles.paramValue}>{tank.latest_water_parameters.estimated_ph}</Text>
          </View>

          <View style={styles.paramRow}>
            <Feather name="thermometer" size={18} color="#e63946" />
            <Text style={styles.paramLabel}>Temperature:</Text>
            <Text style={styles.paramValue}>{tank.latest_water_parameters.temperature}°C</Text>
          </View>

          <View style={styles.paramRow}>
            <MaterialCommunityIcons name="fish" size={18} color="#1d3557" />
            <Text style={styles.paramLabel}>Oxygen:</Text>
            <Text style={styles.paramValue}>{tank.latest_water_parameters.estimated_oxygen_mgL} mg/L</Text>
          </View>

          <View style={styles.paramRow}>
            <MaterialCommunityIcons name="chemical-weapon" size={18} color="#6a040f" />
            <Text style={styles.paramLabel}>Ammonia:</Text>
            <Text style={styles.paramValue}>{tank.latest_water_parameters.estimated_ammonia_ppm} ppm</Text>
          </View>

          <View style={styles.paramRow}>
            <MaterialCommunityIcons name="bottle-tonic-skull" size={18} color="#ff8c00" />
            <Text style={styles.paramLabel}>Nitrite:</Text>
            <Text style={styles.paramValue}>{tank.latest_water_parameters.estimated_nitrite_ppm} ppm</Text>
          </View>

          <View style={styles.paramRow}>
            <MaterialCommunityIcons name="bottle-tonic" size={18} color="#2a9d8f" />
            <Text style={styles.paramLabel}>Nitrate:</Text>
            <Text style={styles.paramValue}>{tank.latest_water_parameters.estimated_nitrate_ppm} ppm</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Species</Text>

      {species && species.length === 0 ? (
        <View style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}>
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

              {/* Content Wrapper */}
              <View style={styles.speciesContent}>
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

                {/* Compatibility Indicator and Button - moved to bottom of content */}
                {!item.compatibility?.is_compatible && (
                  <View style={styles.compatibilityContainer}>
                    <AntDesign name="warning" size={20} color="red" style={styles.warningIcon} />
                    <TouchableOpacity style={styles.issuesBtn} onPress={() => showCompatibilityIssues(item)}>
                      <Text style={styles.issuesBtnText}>Issues</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Delete button (remains on the far right) */}
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
          contentContainerStyle={{ paddingBottom: 120 }}
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

      {/* Compatibility Issues Modal */}
      <Modal visible={compatibilityModalVisible} transparent animationType="fade" onRequestClose={() => setCompatibilityModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Compatibility Issues</Text>
            {compatibilityIssues.length > 0 ? (
              <ScrollView style={styles.issuesScrollView}>
                {compatibilityIssues.map((issue, index) => (
                  <View key={index} style={styles.issueItem}>
                    {getIssueIcon(issue)}
                    <Text style={styles.issueText}> {issue}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.issueText}>No issues found.</Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#00CED1" }]} onPress={() => setCompatibilityModalVisible(false)}>
                <Text style={styles.modalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  waterParamsCard: {
    backgroundColor: "#f0f8ff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 10,
  },
  paramRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  paramLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
    width: 110,
  },
  paramValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
  },

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
    flexDirection: "row", // Keep image and content side-by-side
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    alignItems: "flex-start", // Align items to the top to prevent stretching
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
    marginRight: 12, // Add some space to the right of the image
  },
  speciesContent: {
    flex: 1, // Take up remaining space
    justifyContent: "space-between", // Push compatibility to the bottom
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
    alignSelf: "flex-start", // Align to top, next to content
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
    textAlign: "center",
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
    fontSize: 16,
  },
  activateButton: {
    backgroundColor: "#00CED1",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  activateText: { color: "#fff", fontWeight: "bold" },
  compatibilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10, // Add space above issues section
    justifyContent: "flex-start",
  },
  warningIcon: {
    marginRight: 5,
  },
  issuesBtn: {
    backgroundColor: "#e63946",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  issuesBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  issuesScrollView: {
    maxHeight: 200, // Limit height of the scroll view
    marginBottom: 15,
  },
  issueItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  issueText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    flexShrink: 1, // Allow text to wrap
  },
});

export default TankDetailsScreen;
