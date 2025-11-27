import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Animated } from "react-native";
import { Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { useRoute, useNavigation, useIsFocused } from "@react-navigation/native";
import { AuthContext } from "../../authcontext";
import { baseUrl } from "../../config";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [slideAnim1] = useState(new Animated.Value(60));
  const [slideAnim2] = useState(new Animated.Value(60));

  useEffect(() => {
    if (isExpanded) {
      Animated.spring(slideAnim1, { toValue: -150, useNativeDriver: true }).start();
      Animated.spring(slideAnim2, { toValue: -70, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim1, { toValue: 60, duration: 200, useNativeDriver: true }).start();
      Animated.timing(slideAnim2, { toValue: 60, duration: 200, useNativeDriver: true }).start();
    }
  }, [isExpanded]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchTankData();
    }
  }, [isFocused, tankId, token]);

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

      console.log("Fetched species data:", speciesJson.species[0]);

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
  const [fishModalVisible, setFishModalVisible] = useState(false);
  const [activeFish, setActiveFish] = useState(null);

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
      <View style={{ ...styles.header }}>
        <View style={styles.tankCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ ...styles.backBtn, backgroundColor: "#1f1f1f", borderRadius: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#00CED1" />
          </TouchableOpacity>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.tankName}>{tank.name}</Text>
            <Text style={styles.tankDetail}>
              {tank.tank_type} • {tank.size} {tank.size_unit}
            </Text>
            <Text style={styles.tankNotes}>{tank.notes}</Text>
          </View>
        </View>
      </View>

      {/* Water Parameters Section */}
      {/* {tank.latest_water_parameters && (
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
      )} */}

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
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={0.8}
                onPress={() => {
                  setActiveFish(item);
                  setFishModalVisible(true);
                }}
              >
                {/* ALL existing image + text content EXCEPT delete button */}
                <View style={{ flexDirection: "row" }}>
                  <Image source={{ uri: item?.last_scan_image_url || item?.metadata?.image_url }} style={styles.speciesImage} />

                  <View style={styles.speciesContent}>
                    <Text style={styles.speciesName}>{item.metadata.species_name}</Text>
                    <Text style={styles.speciesScientific}>{item.metadata.species_Nomenclature}</Text>

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

                    {!item?.compatibility?.is_compatible && (
                      <View style={styles.compatibilityContainer}>
                        <AntDesign name="warning" size={20} color="red" style={styles.warningIcon} />
                        <TouchableOpacity style={styles.issuesBtn} onPress={() => showCompatibilityIssues(item)}>
                          <Text style={styles.issuesBtnText}>Issues</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Delete button stays OUTSIDE */}
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
      {/* Floating Action Button Group */}
      <View style={{ position: "absolute", bottom: 50, right: 0 }}>
        {/* Expanded Buttons */}
        {isExpanded && (
          <>
            {/* Add Species Button */}
            <Animated.View style={{ transform: [{ translateX: slideAnim1 }], bottom: -10 }}>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: "#4CAF50", marginBottom: 10 }]}
                onPress={() => navigation.navigate("AddSpeciesScreen", { tankId: tank.id, type: tank.tank_type })}
              >
                <MaterialCommunityIcons name="plus" size={26} color="#fff" />
              </TouchableOpacity>
            </Animated.View>

            {/* Tank Scan Button */}
            <Animated.View style={{ transform: [{ translateX: slideAnim2 }], bottom: -10 }}>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: "#ff8c00", marginBottom: 10 }]}
                onPress={() => {
                  navigation.navigate("TankScanScreenTabs", {
                    tankDataLocal: tank,
                    tankId: tank.id,
                  });
                  setIsExpanded(false);
                }}
              >
                <MaterialCommunityIcons name="cube-scan" size={26} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        {/* Main Toggle Button */}
        <TouchableOpacity style={[styles.addButton, { backgroundColor: "#00CED1" }]} onPress={() => setIsExpanded(!isExpanded)}>
          <MaterialCommunityIcons name={isExpanded ? "close" : "menu"} size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.addButton, { bottom: 220, backgroundColor: "#ee6affff" }]}
        onPress={() => {
          navigation.navigate("CompareSpeciesScreen", {
            tankDataLocal: tank,
            tankId: tank.id,
          });
        }}
      >
        <MaterialIcons name="compare" size={26} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addButton, { bottom: 155, backgroundColor: "#00b7ffff" }]}
        onPress={() => {
          navigation.navigate("DiseaseScanScreen", {
            tankDataLocal: tank,
            tankId: tank.id,
          });
        }}
      >
        <FontAwesome6 name="disease" size={26} color="#fff" />
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

      <Modal visible={fishModalVisible} transparent animationType="slide" onRequestClose={() => setFishModalVisible(false)}>
        <View style={styles.detailsOverlay}>
          <View style={styles.detailsContainer}>
            <ScrollView>
              {/* Close button */}
              <TouchableOpacity style={styles.detailsCloseBtn} onPress={() => setFishModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>

              {/* Image */}
              <Image
                source={{
                  uri: activeFish?.last_scan_image_url || activeFish?.metadata?.image_url || "https://via.placeholder.com/400x300",
                }}
                style={styles.detailsImage}
              />

              {/* Title */}
              <Text style={styles.detailsTitle}>{activeFish?.metadata?.species_name}</Text>
              <Text style={styles.detailsSubtitle}>{activeFish?.metadata?.species_Nomenclature}</Text>

              {/* Info with icons */}
              <View style={styles.detailsInfoRow}>
                <Feather name="maximize" size={20} color="#ff8c00" />
                <Text style={styles.detailsInfoText}>Max Size: {activeFish?.metadata?.maximum_size}</Text>
              </View>

              <View style={styles.detailsInfoRow}>
                <Feather name="thermometer" size={20} color="#e63946" />
                <Text style={styles.detailsInfoText}>Temp: {activeFish?.metadata?.temperature}°C</Text>
              </View>

              <View style={styles.detailsInfoRow}>
                <Feather name="droplet" size={20} color="#00b4d8" />
                <Text style={styles.detailsInfoText}>
                  pH: {activeFish?.metadata?.ideal_ph_min} – {activeFish?.metadata?.ideal_ph_max}
                </Text>
              </View>

              <View style={styles.detailsInfoRow}>
                <MaterialCommunityIcons name="fish" size={22} color="#1d3557" />
                <Text style={styles.detailsInfoText}>Category: {activeFish?.species?.category}</Text>
              </View>

              <View style={styles.detailsInfoRow}>
                <MaterialCommunityIcons name="format-list-numbered" size={20} color="#6200ee" />
                <Text style={styles.detailsInfoText}>Quantity: {activeFish?.quantity}</Text>
              </View>

              {/* Notes */}
              {activeFish?.notes ? (
                <>
                  <Text style={styles.detailsSectionHeader}>Notes</Text>
                  <Text style={styles.detailsNotes}>{activeFish.notes}</Text>
                </>
              ) : null}

              {/* Compatibility */}
              {!activeFish?.compatibility?.is_compatible && (
                <>
                  <Text style={styles.detailsSectionHeader}>Compatibility Issues</Text>
                  {activeFish?.compatibility?.issues.map((issue, idx) => (
                    <Text key={idx} style={styles.detailsIssueText}>
                      • {issue}
                    </Text>
                  ))}
                </>
              )}
            </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  detailsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },

  detailsContainer: {
    backgroundColor: "#fff",
    width: "100%",
    height: "88%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 20,
    overflow: "hidden",
  },

  detailsCloseBtn: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },

  detailsImage: {
    width: "100%",
    height: 230,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  detailsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
    color: "#000",
  },

  detailsSubtitle: {
    fontSize: 15,
    fontStyle: "italic",
    textAlign: "center",
    color: "#444",
    marginBottom: 20,
  },

  detailsInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    paddingHorizontal: 20,
  },

  detailsInfoText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },

  detailsSectionHeader: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 20,
    color: "#000",
  },

  detailsNotes: {
    fontSize: 15,
    marginTop: 6,
    paddingHorizontal: 20,
    color: "#444",
  },

  detailsIssueText: {
    fontSize: 15,
    color: "#d62828",
    paddingHorizontal: 20,
    marginTop: 4,
  },
});

export default TankDetailsScreen;
