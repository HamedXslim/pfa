import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { firebase } from '../../firebase.native.js';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';

export default function PriceAlertsScreen() {
  const { user } = useUser();
  const navigation = useNavigation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({});

  useEffect(() => {
    if (!user) return;
    
    navigation.setOptions({
      title: 'Price Alerts',
      headerTitleStyle: { fontWeight: 'bold' }
    });

    fetchPriceAlerts();
  }, [user]);

  const fetchPriceAlerts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const db = firebase.firestore();
      
      // Get price alerts for the current user
      const alertsRef = db.collection('PriceAlerts')
        .where('userEmail', '==', user.primaryEmailAddress.emailAddress);
      
      // We need to create this index in Firestore, so we'll remove the orderBy for now
      // .orderBy('createdAt', 'desc');
      
      const unsubscribe = alertsRef.onSnapshot(async (snapshot) => {
        const alertsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (alertsData.length === 0) {
          setAlerts([]);
          setLoading(false);
          return;
        }
        
        // Sort manually since we removed the orderBy
        alertsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Get product details for each alert
        const productsData = {};
        
        for (const alert of alertsData) {
          try {
            if (!productsData[alert.postId]) {
              const productDoc = await db.collection('UserPost').doc(alert.postId).get();
              if (productDoc.exists) {
                productsData[alert.postId] = {
                  id: productDoc.id,
                  ...productDoc.data()
                };
              }
            }
          } catch (err) {
            console.error('Error fetching product:', err);
          }
        }
        
        setProducts(productsData);
        setAlerts(alertsData);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching price alerts:', error);
      setLoading(false);
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      const db = firebase.firestore();
      await db.collection('PriceAlerts').doc(alertId).delete();
      Alert.alert('Success', 'Price alert deleted');
    } catch (error) {
      console.error('Error deleting price alert:', error);
      Alert.alert('Error', 'Failed to delete price alert');
    }
  };

  const editAlert = async (alert) => {
    const product = products[alert.postId];
    
    if (!product) {
      Alert.alert('Error', 'Product not found');
      return;
    }
    
    Alert.prompt(
      'Edit Price Alert',
      `Current price: ${product.price} TND\nEnter your target price:`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Update',
          onPress: async (targetPrice) => {
            const targetPriceNum = parseFloat(targetPrice);
            
            if (isNaN(targetPriceNum) || targetPriceNum <= 0) {
              Alert.alert('Error', 'Please enter a valid price');
              return;
            }
            
            try {
              const db = firebase.firestore();
              await db.collection('PriceAlerts').doc(alert.id).update({
                targetPrice: targetPriceNum,
                currentPrice: parseFloat(product.price),
                updatedAt: new Date().toISOString()
              });
              
              Alert.alert('Success', 'Price alert updated');
            } catch (error) {
              console.error('Error updating price alert:', error);
              Alert.alert('Error', 'Failed to update price alert');
            }
          }
        }
      ],
      'plain-text',
      alert.targetPrice.toString()
    );
  };

  const renderItem = ({ item }) => {
    const product = products[item.postId];
    
    if (!product) {
      return null;
    }
    
    const currentPrice = parseFloat(product.price);
    const targetPrice = item.targetPrice;
    const priceDropped = currentPrice <= targetPrice;
    
    return (
      <TouchableOpacity
        className="bg-white rounded-lg shadow-sm mb-3 mx-2"
        onPress={() => navigation.navigate('product-detail', { product })}
      >
        <View className="flex-row">
          <Image
            source={{ uri: product.image }}
            className="w-[100px] h-[100px] rounded-tl-lg rounded-bl-lg"
            resizeMode="cover"
          />
          
          <View className="flex-1 p-3">
            <Text className="text-lg font-bold" numberOfLines={1}>
              {product.title}
            </Text>
            
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-700">Current: </Text>
              <Text className="text-blue-500 font-bold">
                {currentPrice} TND
              </Text>
            </View>
            
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-700">Target: </Text>
              <Text className={`font-bold ${priceDropped ? 'text-green-500' : 'text-orange-500'}`}>
                {targetPrice} TND
              </Text>
            </View>
            
            {priceDropped && (
              <View className="bg-green-100 rounded-full px-2 py-1 mt-1 self-start">
                <Text className="text-green-800 text-xs">Price dropped!</Text>
              </View>
            )}
          </View>
          
          <View className="p-2 justify-between">
            <TouchableOpacity
              onPress={() => editAlert(item)}
              className="bg-blue-100 rounded-full p-2 mb-2"
            >
              <Ionicons name="pencil" size={16} color="#3b82f6" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => deleteAlert(item.id)}
              className="bg-red-100 rounded-full p-2"
            >
              <Ionicons name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-100 pt-2">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-gray-600">Loading price alerts...</Text>
        </View>
      ) : alerts.length > 0 ? (
        <FlatList
          data={alerts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 10 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <FontAwesome name="bell-o" size={70} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-700 mt-4">No price alerts</Text>
          <Text className="text-gray-500 text-center mt-2">
            Set price alerts for products you're interested in and we'll notify you when the price drops
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
