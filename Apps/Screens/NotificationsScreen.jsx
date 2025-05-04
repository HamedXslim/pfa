import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { firebase } from '../../firebase.native.js';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function NotificationsScreen() {
  const { user } = useUser();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    navigation.setOptions({
      title: 'Notifications',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('home-nav', { screen: 'home' })}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      )
    });

    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const db = firebase.firestore();
      
      console.log('Fetching notifications for user:', user.primaryEmailAddress.emailAddress);
      
      // Modified query to avoid requiring a composite index
      const notificationsRef = db.collection('Notifications')
        .where('userEmail', '==', user.primaryEmailAddress.emailAddress);

      const unsubscribe = notificationsRef.onSnapshot((snapshot) => {
        console.log(`Found ${snapshot.docs.length} notifications`);
        
        // Sort notifications client-side by createdAt in descending order
        const notificationsData = snapshot.docs
          .map(doc => {
            const data = doc.data();
            console.log('Notification data:', { id: doc.id, type: data.type, message: data.message });
            return {
              id: doc.id,
              ...data
            };
          })
          .sort((a, b) => {
            // Handle missing or invalid createdAt fields
            if (!a.createdAt) return 1;  // a goes after b
            if (!b.createdAt) return -1; // a goes before b
            
            try {
              // Safely convert to date objects and compare
              const dateA = a.createdAt && typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(0);
              const dateB = b.createdAt && typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(0);
              
              // Sort in descending order (newest first)
              return dateB.getTime() - dateA.getTime();
            } catch (error) {
              console.log('Error sorting dates:', error);
              return 0; // Keep original order if error occurs
            }
          });
        
        // Log notification types for debugging
        const messageNotifications = notificationsData.filter(n => n.type === 'message');
        console.log(`Found ${messageNotifications.length} message notifications`);
          
        setNotifications(notificationsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const db = firebase.firestore();
      await db.collection('Notifications').doc(notificationId).update({
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className={`bg-white rounded-lg shadow-sm mb-3 mx-2 p-4 ${item.read ? 'opacity-70' : ''}`}
      onPress={() => {
        markAsRead(item.id);
        // Naviguer différemment selon le type de notification
        if (item.type === 'message') {
          // Pour les notifications de message, naviguer vers le ChatScreen
          navigation.navigate('ChatScreen', { chatId: item.postId, product: { title: 'Conversation' } });
        } else {
          // Pour les autres types de notifications (price_alert, etc.), naviguer vers le détail du produit
          navigation.navigate('product-detail', { product: { id: item.postId } });
        }
      }}
    >
      <Text className="text-gray-700">{item.message}</Text>
      <Text className="text-gray-500 text-xs mt-2">
        {item.createdAt && typeof item.createdAt.toDate === 'function' 
          ? new Date(item.createdAt.toDate()).toLocaleString() 
          : 'Date not available'}
      </Text>
      {!item.read && (
        <View className="absolute top-2 right-2 bg-red-500 w-2 h-2 rounded-full" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100 pt-2">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-gray-600">Loading notifications...</Text>
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 10 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="notifications-off-outline" size={70} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-700 mt-4">No notifications</Text>
          <Text className="text-gray-500 text-center mt-2">
            You'll be notified when important events occur
          </Text>
        </View>
      )}
    </View>
  );
}