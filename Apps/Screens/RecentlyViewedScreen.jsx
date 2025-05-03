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

export default function RecentlyViewedScreen() {
  const { user } = useUser();
  const navigation = useNavigation();
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    navigation.setOptions({
      title: 'Recently Viewed',
      headerTitleStyle: { fontWeight: 'bold' }
    });

    fetchRecentlyViewed();
  }, [user]);

  const fetchRecentlyViewed = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const db = firebase.firestore();
      
      // Get recently viewed items for the current user
      const recentViewsRef = db.collection('RecentlyViewed')
        .where('userEmail', '==', user.primaryEmailAddress.emailAddress);
      
      // We need to create this index in Firestore, so we'll remove the orderBy for now
      // .orderBy('viewedAt', 'desc')
      // .limit(20);
      
      const unsubscribe = recentViewsRef.onSnapshot(async (snapshot) => {
        // Get all recent view items
        const recentViewItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (recentViewItems.length === 0) {
          setRecentItems([]);
          setLoading(false);
          return;
        }
        
        // Get all the post details for the recently viewed items
        const postIds = recentViewItems.map(item => item.postId);
        const postsData = [];
        
        // Fetch each post
        for (const postId of postIds) {
          try {
            const postDoc = await db.collection('UserPost').doc(postId).get();
            if (postDoc.exists) {
              postsData.push({
                id: postDoc.id,
                ...postDoc.data(),
                viewedAt: recentViewItems.find(item => item.postId === postId).viewedAt
              });
            }
          } catch (err) {
            console.error('Error fetching post:', err);
          }
        }
        
        // Sort manually since we removed the orderBy
        postsData.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));
        
        setRecentItems(postsData);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching recently viewed items:', error);
      setLoading(false);
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
          <Text className="text-gray-500 text-xs">
            Viewed: {new Date(item.viewedAt).toLocaleDateString()}
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
          <Text className="mt-2 text-gray-600">Loading recently viewed items...</Text>
        </View>
      ) : recentItems.length > 0 ? (
        <FlatList
          data={recentItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 10 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="time-outline" size={70} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-700 mt-4">No recently viewed items</Text>
          <Text className="text-gray-500 text-center mt-2">
            Products you view will appear here
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
