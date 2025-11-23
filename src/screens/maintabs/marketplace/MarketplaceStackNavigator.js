// MarketplaceStackNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MarketplaceHomeScreen from "./MarketplaceHomeScreen";
import ListingDetailsScreen from "./ListingDetailsScreen";
import CreateListingScreen from "./CreateListingScreen";
import ListingBidsScreen from "./ListingBidsScreen";
import MyListingsScreen from "./MyListingsScreen";

const MarketplaceStack = createNativeStackNavigator();

export default function MarketplaceStackNavigator() {
  return (
    <MarketplaceStack.Navigator screenOptions={{ headerShown: false }}>
      <MarketplaceStack.Screen name="MarketplaceHome" component={MarketplaceHomeScreen} />
      <MarketplaceStack.Screen name="ListingDetails" component={ListingDetailsScreen} />
      <MarketplaceStack.Screen name="CreateListing" component={CreateListingScreen} />
      <MarketplaceStack.Screen name="ListingBids" component={ListingBidsScreen} />
      <MarketplaceStack.Screen name="MyListings" component={MyListingsScreen} />
    </MarketplaceStack.Navigator>
  );
}
