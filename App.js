import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, ActivityIndicator } from 'react-native';
import LoginScreen from './Apps/Screens/LoginScreen';
import TabNavigation from './Apps/Navigations/TabNavigation';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';

// Token cache personnalisé pour Clerk
const tokenCache = {
  async getToken(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      console.error("Error getting token from cache:", err);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return await AsyncStorage.setItem(key, value);
    } catch (err) {
      console.error("Error saving token to cache:", err);
    }
  }
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [clerkLoaded, setClerkLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to dynamically import Clerk components
    const loadClerk = async () => {
      try {
        // Wait a moment to ensure all native modules are registered
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dynamically import Clerk
        const { ClerkProvider, SignedIn, SignedOut } = await import('@clerk/clerk-expo');
        global.ClerkProvider = ClerkProvider;
        global.SignedIn = SignedIn;
        global.SignedOut = SignedOut;
        
        setClerkLoaded(true);
      } catch (err) {
        console.error("Failed to load Clerk:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadClerk();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 20 }}>Loading app...</Text>
      </View>
    );
  }

  if (error) {
    // Fallback UI when Clerk fails to load
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="auto" />
        <NavigationContainer>
          <TabNavigation/>
        </NavigationContainer>
      </View>
    );
  }

  // If Clerk loaded successfully, use it
  if (clerkLoaded && global.ClerkProvider) {
    const ClerkProvider = global.ClerkProvider;
    const SignedIn = global.SignedIn;
    const SignedOut = global.SignedOut;

    return (
      <ClerkProvider 
        publishableKey='pk_test_dGFsZW50ZWQtdGVhbC02NC5jbGVyay5hY2NvdW50cy5kZXYk'
        tokenCache={tokenCache}
      >
        <View className="flex-1 bg-white">
          <StatusBar style="auto" />
         
          <SignedIn>
           <NavigationContainer>
            <TabNavigation/>
           </NavigationContainer>
          </SignedIn>
          <SignedOut>
            <LoginScreen/>
          </SignedOut>
        
        </View>
      </ClerkProvider>
    );
  }

  // Fallback UI if something unexpected happened
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="auto" />
      <NavigationContainer>
        <TabNavigation/>
      </NavigationContainer>
    </View>
  );
}
