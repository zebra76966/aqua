// screens/ListingDetailsScreen.js
import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Image } from "react-native";
import { AuthContext } from "../../../authcontext";
import { fetchListingDetails, placeBid } from "./api/marketplace";
import { SafeAreaView } from "react-native-safe-area-context";

const ListingDetailsScreen = ({ route, navigation }) => {
  const { token } = useContext(AuthContext);
  const { listingId } = route.params;

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidLoading, setBidLoading] = useState(false);

  const loadDetails = async () => {
    setError("");
    try {
      const data = await fetchListingDetails(listingId, token);
      setListing(data);
    } catch (err) {
      setError(err.message || "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [listingId]);

  const handlePlaceBid = async () => {
    if (!bidAmount) {
      Alert.alert("Error", "Please enter bid amount");
      return;
    }
    setBidLoading(true);
    try {
      await placeBid(listingId, bidAmount, bidMessage, token);
      Alert.alert("Success", "Bid placed successfully!");
      setBidModalVisible(false);
      setBidAmount("");
      setBidMessage("");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to place bid");
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2cd4c8" />
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error || "Listing not found"}</Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Top Image */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: listing.thumbnail }} style={styles.image} />

        {/* Price Badge */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>₹{listing.base_price}</Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, listing.status === "active" && styles.statusActive]}>
          <Text style={styles.statusBadgeText}>{listing.status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{listing.title}</Text>

      {/* Seller + Created Date */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Seller: {listing.seller}</Text>
        <Text style={styles.metaText}>{new Date(listing.created_at).toLocaleDateString()}</Text>
      </View>

      {/* Description Box */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{listing.description}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => setBidModalVisible(true)}>
          <Text style={styles.buttonPrimaryText}>Place a Bid</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonOutline} onPress={() => navigation.navigate("ListingBids", { listingId })}>
          <Text style={styles.buttonOutlineText}>View Bids</Text>
        </TouchableOpacity>
      </View>

      {/* Bid Modal */}
      <Modal visible={bidModalVisible} animationType="fade" transparent onRequestClose={() => setBidModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Place a Bid</Text>

            <TextInput style={styles.input} keyboardType="numeric" placeholder="Amount" placeholderTextColor="#2cd4c8" value={bidAmount} onChangeText={setBidAmount} />

            <TextInput style={[styles.input, { height: 80 }]} placeholder="Message (optional)" placeholderTextColor="#2cd4c8" value={bidMessage} onChangeText={setBidMessage} multiline />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.buttonOutlineSmall} onPress={() => setBidModalVisible(false)} disabled={bidLoading}>
                <Text style={styles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonPrimarySmall} onPress={handlePlaceBid} disabled={bidLoading}>
                {bidLoading ? <ActivityIndicator color="#004d40" /> : <Text style={styles.buttonPrimaryText}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ListingDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  // IMAGE AREA
  imageWrapper: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  priceBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#2cd4c8",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  priceBadgeText: {
    color: "#004d40",
    fontWeight: "bold",
    fontSize: 16,
  },

  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ccc",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusActive: {
    backgroundColor: "#c9ffee",
  },
  statusBadgeText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 12,
  },

  // CONTENT
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metaText: {
    color: "#555",
    fontSize: 14,
  },

  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 6,
    color: "#2cd4c8",
  },
  descriptionBox: {
    backgroundColor: "#f8fffe",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d6f7f4",
  },
  descriptionText: {
    color: "#555",
    fontSize: 14,
    lineHeight: 20,
  },

  // BUTTONS
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: "#2cd4c8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonPrimaryText: {
    color: "#004d40",
    fontWeight: "bold",
  },
  buttonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2cd4c8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonOutlineText: {
    color: "#2cd4c8",
    fontWeight: "bold",
  },

  // MODAL
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#2cd4c8",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    color: "#000",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  buttonPrimarySmall: {
    backgroundColor: "#2cd4c8",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonOutlineSmall: {
    borderWidth: 1,
    borderColor: "#2cd4c8",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
});
