// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTankId, setActiveTankId] = useState(null);

  useEffect(() => {
    // Load saved tank on app start
    AsyncStorage.getItem("activeTankId").then((id) => {
      if (id) setActiveTankId(id);
    });
  }, []);

  const activateTank = async (tankId) => {
    setActiveTankId(tankId);
    await AsyncStorage.setItem("activeTankId", String(tankId));
  };

  const clearActiveTank = async () => {
    setActiveTankId(null);
    await AsyncStorage.removeItem("activeTankId");
  };

  useEffect(() => {
    // Load token from storage when app starts
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (storedToken) setToken(storedToken);
      } catch (error) {
        console.error("Error loading token:", error);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (newToken) => {
    setToken(newToken);
    await AsyncStorage.setItem("authToken", newToken);
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem("authToken");
  };

  return <AuthContext.Provider value={{ token, login, logout, loading, activeTankId, activateTank, clearActiveTank }}>{children}</AuthContext.Provider>;
};
