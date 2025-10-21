import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri, exchangeCodeAsync, useAutoDiscovery, ResponseType } from "expo-auth-session";

import styles from "./login.stylesheet";
import useThemeStyles from "../useThemeStyle";
import { baseUrl } from "../config";
import { AuthContext } from "../authcontext";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

// --- IDs from backend ---
const ANDROID_CLIENT_ID = "859674051212-kp746doga77holq4lqe2eiducpoqliuv.apps.googleusercontent.com";
const WEB_CLIENT_ID = "859674051212-0gn7dvr1jslospmpe8mkm4aooqct0f8p.apps.googleusercontent.com";
// TODO: Replace with your iOS client ID when backend provides it
const IOS_CLIENT_ID = "859674051212-xxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com";

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { colors } = useThemeStyles();
  const { token, login, loading } = useContext(AuthContext);

  // Redirect if token exists
  useEffect(() => {
    if (!loading && token) {
      navigation.replace("tankSetup");
    }
  }, [loading, token, navigation]);

  // Google discovery document (endpoints)
  const discovery = useAutoDiscovery("https://accounts.google.com");

  // ✅ Correct redirectUri setup
  const redirectUri = makeRedirectUri({
    useProxy: true, // forces https://auth.expo.dev/...
  });

  // Build Google request
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      androidClientId: ANDROID_CLIENT_ID,
      iosClientId: IOS_CLIENT_ID,
      webClientId: WEB_CLIENT_ID,
      responseType: ResponseType.Code,
      scopes: ["openid", "email", "profile"],
      redirectUri, // <- matches the https://auth.expo.dev/... one
    },
    discovery
  );

  // Handle response
  useEffect(() => {
    console.log("Redirect URI being used:", redirectUri);
    (async () => {
      if (!response || response.type !== "success" || !discovery || !request) return;

      try {
        setIsLoading(true);

        const { code } = response.params;

        // Exchange code for tokens
        const tokenResult = await exchangeCodeAsync(
          {
            clientId: Platform.OS === "android" ? ANDROID_CLIENT_ID : Platform.OS === "ios" ? IOS_CLIENT_ID : WEB_CLIENT_ID,
            code,
            redirectUri: request.redirectUri,
            codeVerifier: request.codeVerifier,
          },
          discovery
        );

        const idToken = tokenResult.idToken || tokenResult.id_token;
        if (!idToken) throw new Error("No id_token returned from Google");

        // Send id_token to your backend
        // const r = await fetch(`${baseUrl}/user/google-login/`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ id_token: idToken }),
        // });
        // const data = await r.json();
        // if (!r.ok) throw new Error(data.detail || "Google login failed");
        // await login(data.token);

        await login(idToken); // temp
        navigation.navigate("tankSetup");
      } catch (err) {
        Alert.alert("Google Login Error", err?.message || String(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [response, discovery, request]);

  // Username/password fallback
  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/user/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      await login(data.access);
      navigation.navigate("tankSetup");
    } catch (error) {
      Alert.alert("Login Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGooglePress = async () => {
    if (!request) {
      Alert.alert("Please wait", "Google sign-in is still initializing.");
      return;
    }
    try {
      setIsLoading(true);
      // ✅ Force Expo Proxy redirect (auth.expo.dev)
      await promptAsync({ useProxy: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.logo}>aqua</Text>
      <Text style={styles.welcome}>Welcome Back!</Text>

      <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#2cd4c8" value={username} onChangeText={setUsername} autoCapitalize="none" />

      <View style={styles.passwordContainer}>
        <TextInput style={styles.passwordInput} placeholder="Password" placeholderTextColor="#2cd4c8" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color="#2cd4c8" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialIcons}>
        <TouchableOpacity onPress={handleGooglePress} disabled={!request || isLoading}>
          <FontAwesome name="google" size={30} color="#2cd4c8" />
        </TouchableOpacity>
        <FontAwesome name="apple" size={30} color="#2cd4c8" />
        <FontAwesome name="linkedin" size={30} color="#2cd4c8" />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#004d40" />
        ) : (
          <>
            <Text style={styles.buttonText}>CONTINUE</Text>
            <Ionicons name="arrow-forward" size={20} color="#004d40" />
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.switchText}>
          Don't have an account? <Text style={styles.link}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
