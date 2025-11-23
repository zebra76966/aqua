// screens/MarketplaceHomeScreen.js
import React, { useEffect, useState, useCallback, useContext } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchListings } from "./api/marketplace";
import { AuthContext } from "../../../authcontext";

const MarketplaceHomeScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadListings = async () => {
    setError("");
    try {
      const data = await fetchListings(token);
      setListings(data);
    } catch (err) {
      setError(err.message || "Failed to load listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadListings();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ListingDetails", { listingId: item.id })}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>${item.base_price}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.location}>{item.location}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#2cd4c8" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Text style={styles.header}>Marketplace</Text>

        <TouchableOpacity style={{ ...styles.myListingsBtn, paddingHorizontal: 10 }} onPress={() => navigation.navigate("MyListings")}>
          <Text style={styles.myListingsText}>My Listings</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No listings yet.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("CreateListing")}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MarketplaceHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  center: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2cd4c8",
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#2cd4c8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f8fffe",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2cd4c8",
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: "#777",
  },
  location: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  errorText: {
    color: "#b00020",
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2cd4c8",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  fabText: {
    color: "#004d40",
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "bold",
  },
  myListingsBtn: {
    borderWidth: 1,
    borderColor: "#2cd4c8",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  myListingsText: {
    color: "#2cd4c8",
    fontWeight: "bold",
    fontSize: 16,
  },
});
