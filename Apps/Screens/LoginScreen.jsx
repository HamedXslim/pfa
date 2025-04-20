import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth, useAuth } from '@clerk/clerk-expo';
import { useWarmUpBrowser } from '../../hooks/warmUpBrowser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmUpBrowser();
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, signOut } = useAuth();
  
  // S'assurer que l'utilisateur est déconnecté au démarrage
  useEffect(() => {
    const resetAuth = async () => {
      try {
        if (isLoaded) {
          await signOut();
          console.log("Session réinitialisée au démarrage");
        }
      } catch (err) {
        console.log("Pas de session active à réinitialiser");
      }
    };
    resetAuth();
  }, [isLoaded]);

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPress = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Commencer le flux OAuth
      const result = await startOAuthFlow();
      
      if (result.createdSessionId) {
        // La session a été créée avec succès
        await result.setActive({ session: result.createdSessionId });
        console.log("Connexion réussie, sessionId:", result.createdSessionId);
      } else if (result.signIn || result.signUp) {
        // L'authentification progresse mais n'est pas terminée
        console.log("En cours d'authentification...");
        
        if (result.signIn) {
          const completeSignIn = await result.signIn.create();
          await result.setActive({ session: completeSignIn.createdSessionId });
        } else if (result.signUp) {
          const completeSignUp = await result.signUp.create();
          await result.setActive({ session: completeSignUp.createdSessionId });
        }
      } else {
        // Authentification interrompue ou annulée
        console.log("Authentification annulée ou incomplète");
      }
    } catch (err) {
      console.error('Erreur OAuth détaillée:', JSON.stringify(err, null, 2));
      Alert.alert(
        "Erreur de connexion", 
        "Impossible de se connecter: " + (err.message || "Erreur inconnue")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <View className="flex-1">
      <Image
        source={require('./../../assets/images/login.png')}
        className="w-full h-[400px] object-cover"
      />
      <View className="p-8 bg-white mt-[-20px] rounded-t-3xl flex-1">
        <Text className="text-[30px] font-bold">Community MarketPlace</Text>
        <Text className="text-[18px] text-slate-500 mt-7">
          Buy Sell MarketPlace where you can sell old item and make real money
        </Text>
        <TouchableOpacity 
          onPress={onPress} 
          className="p-4 bg-blue-500 rounded-full mt-20"
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white text-center text-[18px]">
              Get Started
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}