import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../../firebase.native.js';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Header() {
  const { user } = useUser();
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch unread notifications count
  useEffect(() => {
    if (!user) return;
    
    const db = firebase.firestore();
    // Modified query to avoid the composite index requirement
    const notificationsRef = db.collection('Notifications')
      .where('userEmail', '==', user.primaryEmailAddress.emailAddress);
    
    const unsubscribe = notificationsRef.onSnapshot((snapshot) => {
      // Filter the unread notifications client-side
      const unreadNotifications = snapshot.docs.filter(doc => doc.data().read === false);
      setUnreadCount(unreadNotifications.length);
    });
    
    return () => unsubscribe();
  }, [user]);

  const goToNotifications = () => {
    navigation.navigate('Profile', { screen: 'NotificationsScreen' });
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to the dedicated search results screen
      navigation.navigate('Explore', { 
        screen: 'search-results',
        params: { searchQuery: searchQuery.trim() }
      });
      console.log('Searching for:', searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <View className="mt-5" 
     
    >
      {/* User info section */}
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-3">
          <Image
            source={{ uri: user?.imageUrl }}
            className="rounded-full w-12 h-12"
          />
          <View className="flex flex-col">
            <Text className="text-[16px]">Welcome</Text>
            <Text className="text-[20px] font-bold">{user?.fullName}</Text>
          </View>
        </View>
        
        {/* Notification icon */}
        <TouchableOpacity
          onPress={goToNotifications}
          className="relative p-2"
        >
          <Ionicons name="notifications" size={28} color="#3b82f6" />
          {unreadCount > 0 && (
            <View className="absolute top-0 right-0 bg-red-500 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
              <Text className="text-white text-xs font-bold">{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View className="p-[9px] px-5 flex flex-row items-center
       bg-white mt-5 rounded-full
        border-blue-300 border-[1px]">
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="search-circle" size={24} color="gray" />
        </TouchableOpacity>
        <TextInput
          placeholder="Search products..."
          className="ml-2 text-[18px] flex-1"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}