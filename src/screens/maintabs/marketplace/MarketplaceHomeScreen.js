// screens/MarketplaceHomeScreen.js
import React, { useEffect, useState, useCallback, useContext } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchListings } from "./api/marketplace";
import { AuthContext } from "../../../authcontext";
import { Image } from "react-native";

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
      {/* Thumbnail */}
      <View style={styles.thumbWrapper}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
        ) : (
          <View style={styles.noThumb}>
            <Text style={{ color: "#aaa" }}>No Image</Text>
          </View>
        )}
      </View>

      {/* Right Content */}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.price}>€{item.base_price}</Text>

        <Text style={styles.seller}>Seller: {item.seller}</Text>

        <View style={styles.rowBetween}>
          <Text style={[styles.status, item.status === "active" && styles.statusActive]}>{item.status.toUpperCase()}</Text>

          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
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
    <View style={styles.container} edges={["top"]}>
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
    </View>
  );
};

export default MarketplaceHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 100,
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
  card: {
    flexDirection: "row",
    backgroundColor: "#f8fffe",
    borderWidth: 1,
    borderColor: "#2cd4c8",
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  thumbWrapper: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#e6f7f7",
    marginRight: 12,
  },

  thumb: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  noThumb: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  price: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "bold",
    color: "#2cd4c8",
  },

  seller: {
    marginTop: 6,
    fontSize: 12,
    color: "#777",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },

  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "bold",
    color: "#666",
    backgroundColor: "#e6e6e6",
  },

  statusActive: {
    backgroundColor: "#d2f7f2",
    color: "#0d9c7a",
  },

  date: {
    fontSize: 11,
    color: "#888",
  },
});
