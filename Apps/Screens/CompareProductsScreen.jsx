import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { firebase } from '../../firebase.native.js';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';

export default function CompareProductsScreen() {
  const { user } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Compare Products',
      headerTitleStyle: { fontWeight: 'bold' }
    });

    fetchCompareList();
  }, [user]);

  const fetchCompareList = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const db = firebase.firestore();
      
      // Get compare list for the current user
      const compareRef = db.collection('CompareList')
        .where('userEmail', '==', user.primaryEmailAddress.emailAddress);
      
      const unsubscribe = compareRef.onSnapshot(async (snapshot) => {
        const compareItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (compareItems.length === 0) {
          setCompareList([]);
          setProducts([]);
          setLoading(false);
          return;
        }
        
        setCompareList(compareItems);
        
        // Get all the post details for the compare list
        const productIds = compareItems.map(item => item.productId);
        const productsData = [];
        
        // Fetch each product
        for (const productId of productIds) {
          try {
            const productDoc = await db.collection('UserPost').doc(productId).get();
            if (productDoc.exists) {
              productsData.push({
                id: productDoc.id,
                ...productDoc.data(),
                compareId: compareItems.find(item => item.productId === productId).id
              });
            }
          } catch (err) {
            console.error('Error fetching product:', err);
          }
        }
        
        setProducts(productsData);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching compare list:', error);
      setLoading(false);
    }
  };

  const removeFromCompare = async (compareId) => {
    try {
      const db = firebase.firestore();
      await db.collection('CompareList').doc(compareId).delete();
      Alert.alert('Success', 'Product removed from compare list');
    } catch (error) {
      console.error('Error removing product from compare:', error);
      Alert.alert('Error', 'Failed to remove product from compare list');
    }
  };

  // Get all unique subcategory names across all products
  const getSubcategoryNames = () => {
    const subcategoryNames = new Set();
    
    products.forEach(product => {
      if (product.subcategoryDetails) {
        Object.keys(product.subcategoryDetails).forEach(name => {
          subcategoryNames.add(name);
        });
      }
    });
    
    return Array.from(subcategoryNames).sort();
  };

  // Render a comparison table for the products
  const renderComparisonTable = () => {
    const subcategoryNames = getSubcategoryNames();
    
    return (
      <View className="mt-4">
        {/* Table header with product images and titles */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header row with images and titles */}
            <View className="flex-row">
              <View className="w-[120px] p-2 bg-gray-100">
                <Text className="font-bold">Product</Text>
              </View>
              
              {products.map(product => (
                <View key={product.id} className="w-[150px] items-center p-2">
                  <TouchableOpacity
                    onPress={() => navigation.navigate('product-detail', { product })}
                  >
                    <Image
                      source={{ uri: product.image }}
                      className="w-[100px] h-[100px] rounded-lg"
                      resizeMode="cover"
                    />
                    <Text className="text-center mt-2 font-bold" numberOfLines={2}>
                      {product.title}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => removeFromCompare(product.compareId)}
                    className="absolute top-0 right-0 bg-red-100 rounded-full p-1"
                  >
                    <Ionicons name="close" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            {/* Price row */}
            <View className="flex-row border-t border-gray-200">
              <View className="w-[120px] p-2 bg-gray-100">
                <Text className="font-bold">Price</Text>
              </View>
              
              {products.map(product => (
                <View key={`${product.id}-price`} className="w-[150px] p-2">
                  <Text className="text-center text-blue-500 font-bold">
                    {product.price} TND
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Category row */}
            <View className="flex-row border-t border-gray-200">
              <View className="w-[120px] p-2 bg-gray-100">
                <Text className="font-bold">Category</Text>
              </View>
              
              {products.map(product => (
                <View key={`${product.id}-category`} className="w-[150px] p-2">
                  <Text className="text-center">
                    {product.category}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Description row */}
            <View className="flex-row border-t border-gray-200">
              <View className="w-[120px] p-2 bg-gray-100">
                <Text className="font-bold">Description</Text>
              </View>
              
              {products.map(product => (
                <View key={`${product.id}-desc`} className="w-[150px] p-2">
                  <Text className="text-center" numberOfLines={3}>
                    {product.description}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Seller row */}
            <View className="flex-row border-t border-gray-200">
              <View className="w-[120px] p-2 bg-gray-100">
                <Text className="font-bold">Seller</Text>
              </View>
              
              {products.map(product => (
                <View key={`${product.id}-seller`} className="w-[150px] p-2">
                  <Text className="text-center">
                    {product.userName}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Subcategory details rows */}
            {subcategoryNames.map(name => (
              <View key={name} className="flex-row border-t border-gray-200">
                <View className="w-[120px] p-2 bg-gray-100">
                  <Text className="font-bold capitalize">
                    {name.replace(/([A-Z])/g, ' $1')}
                  </Text>
                </View>
                
                {products.map(product => (
                  <View key={`${product.id}-${name}`} className="w-[150px] p-2">
                    <Text className="text-center">
                      {product.subcategoryDetails && product.subcategoryDetails[name] 
                        ? product.subcategoryDetails[name] 
                        : '-'}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
            
            {/* Date posted row */}
            <View className="flex-row border-t border-gray-200">
              <View className="w-[120px] p-2 bg-gray-100">
                <Text className="font-bold">Posted</Text>
              </View>
              
              {products.map(product => (
                <View key={`${product.id}-date`} className="w-[150px] p-2">
                  <Text className="text-center text-xs">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-gray-600">Loading products to compare...</Text>
        </View>
      ) : products.length > 0 ? (
        <ScrollView contentContainerStyle={{ padding: 10 }}>
          <View className="bg-blue-50 p-4 rounded-lg mb-4">
            <Text className="text-blue-800 font-bold text-lg">Compare Products</Text>
            <Text className="text-blue-600 mt-1">
              Comparing {products.length} {products.length === 1 ? 'product' : 'products'}
            </Text>
          </View>
          
          {renderComparisonTable()}
          
          <TouchableOpacity
            className="mt-6 bg-blue-500 py-3 px-6 rounded-full self-center mb-6"
            onPress={() => navigation.navigate('Explore', { screen: 'explore-tab' })}
          >
            <Text className="text-white font-bold">Add More Products</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <FontAwesome name="balance-scale" size={70} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-700 mt-4">No products to compare</Text>
          <Text className="text-gray-500 text-center mt-2">
            Add products to your compare list to see them side by side
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
