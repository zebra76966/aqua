import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import LoginScreen from "./src/screens/login";
import SignupScreen from "./src/screens/signup";
import TankSetupScreen from "./src/screens/tanksetup";
import TankScanScreen from "./src/screens/tankScanSreen";
import TankSuccessScreen from "./src/screens/TankSuccessScreen";
import PhScanScreen from "./src/screens/phScanSreen";
import MainTabs from "./src/components/MainTabs";

import { ThemeProvider } from "./src/themecontext";
import { AuthProvider } from "./src/authcontext";
import ImagePreview from "./src/screens/imageprevirew";
import AddTank from "./src/screens/maintabs/forms/addTank";
import TankAddWaterParams from "./src/screens/tankWaterParams";
import FirstScreen from "./src/screens/home";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="First" screenOptions={{ headerShown: false }}>
              {/* Screens WITHOUT navbar */}
              <Stack.Screen name="First" component={FirstScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="tankSetup" component={TankSetupScreen} />
              <Stack.Screen name="TankScan" component={TankScanScreen} />
              <Stack.Screen name="PhScanScreen" component={PhScanScreen} />
              <Stack.Screen name="TankAddWaterParams" component={TankAddWaterParams} />
              <Stack.Screen name="TankSuccess" component={TankSuccessScreen} />
              <Stack.Screen name="ImagePreview" component={ImagePreview} />

              {/* Screens WITH navbar */}
              <Stack.Screen name="MainTabs" component={MainTabs} />
              {/* <Stack.Screen name="UpdateTank" component={UpdateTankScreen} /> */}
              {/* <Stack.Screen name="AddTank" component={AddTank} /> */}
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
