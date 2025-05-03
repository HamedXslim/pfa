import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
  Modal
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newTargetPrice, setNewTargetPrice] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Add back button to header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile', { screen: 'profile-tab' })}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
        const notificationPromises = [];
        
        for (const alert of alertsData) {
          try {
            if (!productsData[alert.postId]) {
              const productDoc = await db.collection('UserPost').doc(alert.postId).get();
              if (productDoc.exists) {
                const productData = {
                  id: productDoc.id,
                  ...productDoc.data()
                };
                productsData[alert.postId] = productData;
                
                // Check if price has dropped below target and create notification if needed
                const currentPrice = parseFloat(productData.price);
                const targetPrice = parseFloat(alert.targetPrice);
                
                // If current price is now at or below target price and we haven't notified yet
                if (currentPrice <= targetPrice && !alert.notified) {
                  // Create notification
                  notificationPromises.push(
                    db.collection('Notifications').add({
                      userEmail: user.primaryEmailAddress.emailAddress,
                      postId: alert.postId,
                      message: `Prix baissé! ${productData.title} est maintenant à ${currentPrice} TND (votre cible: ${targetPrice} TND)`,
                      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                      read: false,
                      type: 'price_alert'
                    })
                  );
                  
                  // Mark alert as notified
                  notificationPromises.push(
                    db.collection('PriceAlerts').doc(alert.id).update({
                      notified: true,
                      updatedAt: new Date().toISOString()
                    })
                  );
                  
                  // Show alert to user
                  Alert.alert(
                    'Prix baissé!',
                    `${productData.title} est maintenant à ${currentPrice} TND (votre cible: ${targetPrice} TND)`,
                    [{ text: 'OK' }]
                  );
                }
                
                // If price went back up, reset notification flag
                if (currentPrice > targetPrice && alert.notified) {
                  notificationPromises.push(
                    db.collection('PriceAlerts').doc(alert.id).update({
                      notified: false,
                      updatedAt: new Date().toISOString()
                    })
                  );
                }
              }
            }
          } catch (err) {
            console.error('Error fetching product:', err);
          }
        }
        
        // Process all notification promises
        if (notificationPromises.length > 0) {
          await Promise.all(notificationPromises);
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
    
    // Using Alert.alert with TextInput instead of Alert.prompt for better cross-platform support
    Alert.alert(
      'Edit Price Alert',
      `Current price: ${product.price} TND\nEnter your target price below:`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Update',
          onPress: async () => {
            // We'll use a different approach since we can't get input directly from Alert on Android
            showEditAlertDialog(alert, product);
          }
        }
      ]
    );
  };
  
  // Function to show a custom dialog for editing price alerts
  const showEditAlertDialog = (alert, product) => {
    setModalVisible(true);
    setSelectedAlert(alert);
    setSelectedProduct(product);
    setNewTargetPrice(alert.targetPrice.toString());
  };
  
  // Function to save the updated price alert
  const saveUpdatedAlert = async () => {
    if (!selectedAlert || !selectedProduct) return;
    
    const targetPriceNum = parseFloat(newTargetPrice);
    
    if (isNaN(targetPriceNum) || targetPriceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    
    try {
      setModalLoading(true);
      const db = firebase.firestore();
      await db.collection('PriceAlerts').doc(selectedAlert.id).update({
        targetPrice: targetPriceNum,
        currentPrice: parseFloat(selectedProduct.price),
        updatedAt: new Date().toISOString()
      });
      
      setModalVisible(false);
      setModalLoading(false);
      setSelectedAlert(null);
      setSelectedProduct(null);
      setNewTargetPrice('');
      
      Alert.alert('Success', 'Price alert updated');
    } catch (error) {
      setModalLoading(false);
      console.error('Error updating price alert:', error);
      Alert.alert('Error', 'Failed to update price alert');
    }
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
      
      {/* Modal for editing price alerts */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedAlert(null);
          setSelectedProduct(null);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edit Price Alert</Text>
            
            {selectedProduct && (
              <View style={styles.productInfo}>
                <Image 
                  source={{ uri: selectedProduct.image }}
                  style={styles.productImage}
                />
                <Text style={styles.productTitle} numberOfLines={1}>
                  {selectedProduct.title}
                </Text>
                <Text style={styles.productPrice}>
                  Current Price: {selectedProduct.price} TND
                </Text>
              </View>
            )}
            
            <Text style={styles.label}>Your Target Price:</Text>
            <TextInput
              style={styles.input}
              value={newTargetPrice}
              onChangeText={setNewTargetPrice}
              placeholder="Enter target price"
              keyboardType="numeric"
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedAlert(null);
                  setSelectedProduct(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.buttonSave, modalLoading && styles.buttonDisabled]}
                onPress={saveUpdatedAlert}
                disabled={modalLoading}
              >
                {modalLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#3b82f6'
  },
  productInfo: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  productPrice: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500'
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonCancel: {
    backgroundColor: '#e5e7eb',
    marginRight: 8
  },
  buttonSave: {
    backgroundColor: '#3b82f6',
    marginLeft: 8
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff'
  }
});
