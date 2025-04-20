import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import LoginScreen from './Apps/Screens/LoginScreen';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import TabNavigation from './Apps/Navigations/TabNavigation';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
