import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { firebase } from '../../firebase.native.js';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const { user } = useUser();
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Set up the screen title
    navigation.setOptions({
      title: 'My Favorites',
      headerTitleStyle: { fontWeight: 'bold' }
    });

    // Fetch user favorites
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const db = firebase.firestore();
      
      // Get user favorites reference
      const favoritesRef = db.collection('Favorites')
        .where('userEmail', '==', user.primaryEmailAddress.emailAddress);
      
      // Set up real-time listener for favorites
      const unsubscribe = favoritesRef.onSnapshot(async (snapshot) => {
        // Get all favorite post IDs
        const favoriteItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (favoriteItems.length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }
        
        // Get all the post details for the favorites
        const postIds = favoriteItems.map(item => item.postId);
        const postsData = [];
        
        // Fetch each post
        for (const postId of postIds) {
          try {
            const postDoc = await db.collection('UserPost').doc(postId).get();
            if (postDoc.exists) {
              postsData.push({
                id: postDoc.id,
                ...postDoc.data(),
                favoriteId: favoriteItems.find(item => item.postId === postId).id
              });
            }
          } catch (err) {
            console.error('Error fetching post:', err);
          }
        }
        
        setFavorites(postsData);
        setLoading(false);
      });
      
      // Clean up listener on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load favorites');
    }
  };

  const removeFromFavorites = async (favoriteId) => {
    try {
      const db = firebase.firestore();
      await db.collection('Favorites').doc(favoriteId).delete();
      Alert.alert('Success', 'Removed from favorites');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      Alert.alert('Error', 'Failed to remove from favorites');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-sm mb-3 mx-2"
      onPress={() => navigation.navigate('product-detail', { product: item })}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-[150px] rounded-t-lg"
        resizeMode="cover"
      />
      
      <View className="p-3">
        <View className="flex-row justify-between items-start">
          <Text className="text-lg font-bold flex-1 mr-2" numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity
            onPress={() => removeFromFavorites(item.favoriteId)}
            className="p-1"
          >
            <FontAwesome name="heart" size={24} color="#ff3b30" />
          </TouchableOpacity>
        </View>
        
        <Text className="text-blue-500 font-bold mt-1">
          {item.price} TND
        </Text>
        
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-gray-500 text-xs">
            {item.category}
          </Text>
          <Text className="text-gray-500 text-xs">
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100 pt-2">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-gray-600">Loading favorites...</Text>
        </View>
      ) : favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 10 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <FontAwesome name="heart-o" size={70} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-700 mt-4">No favorites yet</Text>
          <Text className="text-gray-500 text-center mt-2">
            Items you add to favorites will appear here
          </Text>
          <TouchableOpacity
            className="mt-6 bg-blue-500 py-3 px-6 rounded-full"
            onPress={() => navigation.navigate('Explore', { screen: 'explore-tab' })}
          >
            <Text className="text-white font-bold">Browse Products</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
