import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./src/screens/login";
import SignupScreen from "./src/screens/signup";
import TankSetupScreen from "./src/screens/tanksetup";
import TankScanScreen from "./src/screens/tankScanSreen";
import TankSuccessScreen from "./src/screens/TankSuccessScreen";
import PhScanScreen from "./src/screens/phScanSreen";
import MainTabs from "./src/components/MainTabs";
import { ThemeProvider } from "./src/themecontext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          {/* Screens WITHOUT navbar */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="tankSetup" component={TankSetupScreen} />
          <Stack.Screen name="TankScan" component={TankScanScreen} />
          <Stack.Screen name="PhScanScreen" component={PhScanScreen} />
          <Stack.Screen name="TankSuccess" component={TankSuccessScreen} />

          {/* Screens WITH navbar */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
