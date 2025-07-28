import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { AntDesign, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

export default function DashboardScreen() {
  return (
    <View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 200 }}>
        {/* Header */}

        {/* Tank Info */}
        <View style={styles.tankHeader}>
          <Text style={styles.tankTitle}>Tank #1</Text>
          <View style={styles.tankSettingsIcons}>
            <Feather name="settings" size={20} color="black" />
          </View>
        </View>

        {/* Health Circle */}
        <View style={styles.healthSection}>
          <View style={styles.healthCircle}>
            <Text style={styles.healthPercent}>85%</Text>
            <Text style={styles.healthText}>Healthy</Text>
          </View>
          <View style={styles.weekHealthTextBox}>
            <Text style={styles.weekPercent}>30%</Text>
            <Text style={styles.weekText}>Last 7 days</Text>
          </View>
        </View>

        {/* Maintenance Task */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="tool" size={18} color="#00CED1" />
            <Text style={styles.cardTitle}>Maintenance Task</Text>
          </View>
          <Text style={styles.cardContent}>Water change required.</Text>
          <Text style={styles.cardDate}>Today</Text>
        </View>

        {/* Quick Add Log */}
        <TouchableOpacity style={styles.quickAddLog}>
          <Text style={styles.quickAddText}>QUICK ADD LOG</Text>
          <AntDesign name="pluscircle" size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Alerts */}
        <View style={[styles.card, { backgroundColor: "#fff5f5" }]}>
          <View style={styles.cardHeader}>
            <Feather name="alert-triangle" size={18} color="#ff4d4d" />
            <Text style={styles.cardTitle}>Alerts</Text>
          </View>
          <Text style={{ color: "red" }}>pH levels are High</Text>
          <Text style={{ color: "#ffa500" }}>Compatibility Issue in tank1</Text>
        </View>

        {/* Recommended Products */}
        <View style={styles.recommendHeaderRow}>
          <Text style={styles.sectionTitle}>RECOMMENDED PRODUCTS</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
          <View style={styles.productCard}>
            <Image source={require("../assets/prod1.jpg")} style={styles.productImage} />
            <Text style={styles.productTitle}>Product #1</Text>
            <Text style={styles.productDesc}>small desc...</Text>
            <Text style={styles.productPrice}>$582.25</Text>
            <View style={styles.productButtons}>
              <TouchableOpacity style={styles.cartButton}>
                <Text style={styles.buttonText}>ADD TO CART</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buyButton}>
                <Text style={styles.buttonText}>BUY NOW</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.productCard}>
            <Image source={require("../assets/prod2.jpg")} style={styles.productImage} />
            <Text style={styles.productTitle}>Product #2</Text>
            <Text style={styles.productDesc}>small desc...</Text>
            <Text style={styles.productPrice}>$582.25</Text>
            <View style={styles.productButtons}>
              <TouchableOpacity style={styles.cartButton}>
                <Text style={styles.buttonText}>ADD TO CART</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buyButton}>
                <Text style={styles.buttonText}>BUY NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.productCard}>
            <Image source={require("../assets/prod3.jpg")} style={styles.productImage} />
            <Text style={styles.productTitle}>Product #2</Text>
            <Text style={styles.productDesc}>small desc...</Text>
            <Text style={styles.productPrice}>$582.25</Text>
            <View style={styles.productButtons}>
              <TouchableOpacity style={styles.cartButton}>
                <Text style={styles.buttonText}>ADD TO CART</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buyButton}>
                <Text style={styles.buttonText}>BUY NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#F8F8F8", padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    height: 100,
    backgroundColor: "#F8F8F8",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  logo: { width: 40, height: 40 },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 10 },
  profileImage: { width: 30, height: 30, borderRadius: 15 },
  tankHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  tankTitle: { fontWeight: "bold", fontSize: 18 },
  tankSettingsIcons: {},
  healthSection: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 20 },
  healthCircle: { alignItems: "center", justifyContent: "center", width: 150, height: 150, borderRadius: 75, borderWidth: 10, borderColor: "#00CED1", borderRightColor: "#000" },
  healthPercent: { fontSize: 28, fontWeight: "bold", color: "#00CED1" },
  healthText: { color: "#888" },
  weekHealthTextBox: { alignItems: "center" },
  weekPercent: { fontWeight: "bold", color: "#00CED1", fontSize: 16 },
  weekText: { color: "#777", fontSize: 12 },
  card: { backgroundColor: "white", padding: 16, borderRadius: 12, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  cardTitle: { marginLeft: 8, fontWeight: "bold" },
  cardContent: { fontSize: 14, marginVertical: 4 },
  cardDate: { color: "#FFD700", fontSize: 12 },
  quickAddLog: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#00CED1", padding: 12, borderRadius: 30, marginBottom: 20 },
  quickAddText: { color: "white", fontWeight: "bold" },
  recommendHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontWeight: "bold" },
  seeAll: { color: "#00CED1", fontWeight: "bold" },
  productScroll: { paddingVertical: 10 },
  productCard: { backgroundColor: "white", width: 200, borderRadius: 12, padding: 10, marginRight: 16, position: "relative" },
  productImage: { width: "100%", height: 90, borderRadius: 8 },
  productTitle: { fontWeight: "bold", marginTop: 6 },
  productDesc: { fontSize: 12, color: "#666" },
  productPrice: { color: "#00CED1", fontWeight: "bold", marginTop: 4 },
  productButtons: { flexDirection: "row", marginTop: 8, justifyContent: "space-between", gap: 8 },
  cartButton: { backgroundColor: "#111", padding: 6, borderRadius: 6, flex: 1, alignItems: "center", justifyContent: "center" },
  buyButton: { backgroundColor: "#00CED1", padding: 6, borderRadius: 6, flex: 1, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "white", fontSize: 10, fontWeight: "bold" },
});
