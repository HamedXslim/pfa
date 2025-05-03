import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { firebase } from '../../firebase.native.js';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';

export default function RecommendationsScreen() {
  const { user } = useUser();
  const navigation = useNavigation();
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    if (!user) return;
    
    navigation.setOptions({
      title: 'Recommendations',
      headerTitleStyle: { fontWeight: 'bold' }
    });

    fetchUserInterests();
  }, [user]);

  const fetchUserInterests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const db = firebase.firestore();
      const interests = new Set();
      
      // Get user's favorite categories
      const favoritesRef = db.collection('Favorites')
        .where('userEmail', '==', user.primaryEmailAddress.emailAddress);
      
      const favoritesSnapshot = await favoritesRef.get();
      
      // Get post IDs from favorites
      const favoritePostIds = favoritesSnapshot.docs.map(doc => doc.data().postId);
      
      // Fetch each favorite post to get its category
      for (const postId of favoritePostIds) {
        try {
          const postDoc = await db.collection('UserPost').doc(postId).get();
          if (postDoc.exists) {
            const postData = postDoc.data();
            if (postData.category) {
              interests.add(postData.category);
            }
          }
        } catch (err) {
          console.error('Error fetching favorite post:', err);
        }
      }
      
      // Get recently viewed categories
      const recentViewsRef = db.collection('RecentlyViewed')
        .where('userEmail', '==', user.primaryEmailAddress.emailAddress);
      
      const recentViewsSnapshot = await recentViewsRef.get();
      
      // Get post IDs from recently viewed
      const recentPostIds = recentViewsSnapshot.docs.map(doc => doc.data().postId);
      
      // Fetch each recently viewed post to get its category
      for (const postId of recentPostIds) {
        try {
          const postDoc = await db.collection('UserPost').doc(postId).get();
          if (postDoc.exists) {
            const postData = postDoc.data();
            if (postData.category) {
              interests.add(postData.category);
            }
          }
        } catch (err) {
          console.error('Error fetching recently viewed post:', err);
        }
      }
      
      // Convert Set to Array
      const interestsArray = Array.from(interests);
      setUserInterests(interestsArray);
      
      if (interestsArray.length > 0) {
        fetchRecommendations(interestsArray);
      } else {
        // If no interests found, show popular items
        fetchPopularItems();
      }
    } catch (error) {
      console.error('Error fetching user interests:', error);
      setLoading(false);
    }
  };

  const fetchRecommendations = async (interests) => {
    try {
      const db = firebase.firestore();
      let allRecommendations = [];
      
      // For each interest category, fetch some products
      for (const category of interests) {
        try {
          // We'll use a simple query without complex ordering to avoid index issues
          const postsRef = db.collection('UserPost')
            .where('category', '==', category)
            .limit(5);
          
          const snapshot = await postsRef.get();
          
          const categoryPosts = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            // Filter out user's own posts
            .filter(post => post.userEmail !== user.primaryEmailAddress.emailAddress);
          
          allRecommendations = [...allRecommendations, ...categoryPosts];
        } catch (err) {
          console.error(`Error fetching recommendations for ${category}:`, err);
        }
      }
      
      // Shuffle recommendations for variety
      allRecommendations = shuffleArray(allRecommendations);
      
      // Remove duplicates
      const uniqueRecommendations = removeDuplicates(allRecommendations);
      
      setRecommendedItems(uniqueRecommendations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoading(false);
    }
  };

  const fetchPopularItems = async () => {
    try {
      const db = firebase.firestore();
      
      // Just get some recent posts as "popular" items
      const postsRef = db.collection('UserPost')
        .limit(10);
      
      const snapshot = await postsRef.get();
      
      const popularPosts = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Filter out user's own posts
        .filter(post => post.userEmail !== user.primaryEmailAddress.emailAddress);
      
      setRecommendedItems(popularPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching popular items:', error);
      setLoading(false);
    }
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Remove duplicate products by ID
  const removeDuplicates = (array) => {
    const seen = new Set();
    return array.filter(item => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
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
        <Text className="text-lg font-bold" numberOfLines={1}>
          {item.title}
        </Text>
        
        <Text className="text-blue-500 font-bold mt-1">
          {item.price} TND
        </Text>
        
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-gray-500 text-xs">
            {item.category}
          </Text>
          <View className="bg-blue-100 rounded-full px-2 py-1">
            <Text className="text-blue-800 text-xs">Recommended</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderInterestBadge = (interest, index) => (
    <View key={index} className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2">
      <Text className="text-blue-800">{interest}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100 pt-2">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-gray-600">Finding recommendations for you...</Text>
        </View>
      ) : recommendedItems.length > 0 ? (
        <FlatList
          data={recommendedItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 10 }}
          ListHeaderComponent={
            userInterests.length > 0 ? (
              <View className="mb-4">
                <Text className="text-gray-700 font-bold mb-2 ml-2">Based on your interests:</Text>
                <View className="flex-row flex-wrap ml-2">
                  {userInterests.map(renderInterestBadge)}
                </View>
              </View>
            ) : null
          }
        />
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <FontAwesome name="thumbs-up" size={70} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-700 mt-4">No recommendations yet</Text>
          <Text className="text-gray-500 text-center mt-2">
            Browse more products to get personalized recommendations
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
