// MainTabs.js
import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign, MaterialCommunityIcons, Entypo, Feather } from "@expo/vector-icons";
import Header from "./header";
import DashboardScreen from "../screens/dashboard";
import ProductsScreen from "../screens/maintabs/products";
import TankScanScreen from "../screens/tankScanSreen";
import TanksScreen from "../screens/maintabs/tanks";
import SettingsScreen from "../screens/maintabs/settings";
import WaterScreen from "../screens/maintabs/water";
import TanksStackNavigator from "../screens/maintabs/tanks";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["bottom"]}>
      <View style={{ flex: 1 }}>
        <Header />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#222",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              height: 70,
              position: "absolute",
            },
            tabBarActiveTintColor: "#00CED1",
            tabBarInactiveTintColor: "#fff",
            tabBarShowLabel: true,
          }}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              tabBarIcon: ({ color }) => <AntDesign name="home" size={22} color={color} />,
            }}
          />
          <Tab.Screen
            name="Tanks"
            component={TanksStackNavigator}
            options={{
              tabBarIcon: ({ color }) => <MaterialCommunityIcons name="waves" size={22} color={color} />,
            }}
          />

          <Tab.Screen
            name="Water"
            component={WaterScreen}
            options={{
              tabBarIcon: ({ color }) => <Entypo name="drop" size={22} color={color} />,
            }}
          />
          <Tab.Screen
            name="Store"
            component={ProductsScreen}
            options={{
              tabBarIcon: ({ color }) => <AntDesign name="shoppingcart" size={22} color={color} />,
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color }) => <Feather name="settings" size={22} color={color} />,
            }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
}
