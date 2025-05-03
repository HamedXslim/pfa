import { View, Text, Image, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { app, db, auth, storage } from '../../firebase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';
import * as Share from 'expo-sharing';
import { firebase } from '../../firebase.native.js';

export default function ProductDetail() {
  const { params } = useRoute();
  const [product, setProduct] = useState({});
  const { user } = useUser();
  const navigation = useNavigation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [ favoriteId, setFavoriteId] = useState(null);
  const [isInCompareList, setIsInCompareList] = useState(false);
  const [compareId, setCompareId] = useState(null);
  const [hasPriceAlert, setHasPriceAlert] = useState(false);
  const [priceAlertId, setPriceAlertId] = useState(null);

  useEffect(() => {
    if (params?.product) {
      setProduct(params.product);
      setupHeaderButtons();
      
      if (user) {
        checkIfFavorite();
        checkIfInCompareList();
        checkIfHasPriceAlert();
        addToRecentlyViewed();
      }
    }
  }, [params, user]);

  const setupHeaderButtons = () => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity 
            onPress={toggleFavorite}
            style={{ marginRight: 15 }}
          >
            <FontAwesome 
              name={isFavorite ? "heart" : "heart-o"} 
              size={24} 
              color={isFavorite ? "#ff3b30" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={toggleCompare}
            style={{ marginRight: 15 }}
          >
            <FontAwesome 
              name="balance-scale" 
              size={24} 
              color={isInCompareList ? "#007aff" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={shareProduct}
            style={{ marginRight: 15 }}
          >
            <Ionicons 
              name="share" 
              size={24} 
              color="black"
            />
          </TouchableOpacity>
        </View>
      ),
    });
  };

  const addToRecentlyViewed = async () => {
    if (!user || !params?.product) return;
    
    try {
      const firestore = firebase.firestore();
      
      const recentViewsRef = firestore.collection('RecentlyViewed');
      const q = recentViewsRef
        .where('userEmail', '==', user.primaryEmailAddress.emailAddress)
        .where('postId', '==', params.product.id)
        .limit(1);
      
      const snapshot = await q.get();
      
      if (snapshot.empty) {
        await firestore.collection('RecentlyViewed').add({
          userEmail: user.primaryEmailAddress.emailAddress,
          postId: params.product.id,
          viewedAt: new Date().toISOString()
        });
      } else {
        await firestore.collection('RecentlyViewed').doc(snapshot.docs[0].id).update({
          viewedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const firestore = firebase.firestore();
      const favoritesRef = firestore.collection('Favorites');
      const q = favoritesRef
        .where('userEmail', '==', user.primaryEmailAddress.emailAddress)
        .where('postId', '==', params.product.id);
      
      const snapshot = await q.get();
      
      if (!snapshot.empty) {
        setIsFavorite(true);
        setFavoriteId(snapshot.docs[0].id);
      } else {
        setIsFavorite(false);
        setFavoriteId(null);
      }
      
      setupHeaderButtons();
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const checkIfInCompareList = async () => {
    try {
      const firestore = firebase.firestore();
      const compareRef = firestore.collection('CompareList');
      const q = compareRef
        .where('userEmail', '==', user.primaryEmailAddress.emailAddress)
        .where('productId', '==', params.product.id);
      
      const snapshot = await q.get();
      
      if (!snapshot.empty) {
        setIsInCompareList(true);
        setCompareId(snapshot.docs[0].id);
      } else {
        setIsInCompareList(false);
        setCompareId(null);
      }
      
      setupHeaderButtons();
    } catch (error) {
      console.error('Error checking compare list status:', error);
    }
  };

  const checkIfHasPriceAlert = async () => {
    try {
      const firestore = firebase.firestore();
      const alertsRef = firestore.collection('PriceAlerts');
      const q = alertsRef
        .where('userEmail', '==', user.primaryEmailAddress.emailAddress)
        .where('postId', '==', params.product.id);
      
      const snapshot = await q.get();
      
      if (!snapshot.empty) {
        setHasPriceAlert(true);
        setPriceAlertId(snapshot.docs[0].id);
      } else {
        setHasPriceAlert(false);
        setPriceAlertId(null);
      }
    } catch (error) {
      console.error('Error checking price alert status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add items to favorites');
      return;
    }

    try {
      const firestore = firebase.firestore();
      
      if (isFavorite) {
        await firestore.collection('Favorites').doc(favoriteId).delete();
        setIsFavorite(false);
        setFavoriteId(null);
        Alert.alert('Success', 'Removed from favorites');
      } else {
        const favoriteData = {
          userEmail: user.primaryEmailAddress.emailAddress,
          postId: params.product.id,
          addedAt: new Date().toISOString()
        };
        
        const docRef = await firestore.collection('Favorites').add(favoriteData);
        setIsFavorite(true);
        setFavoriteId(docRef.id);
        Alert.alert('Success', 'Added to favorites');
      }
      
      setupHeaderButtons();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const toggleCompare = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add items to compare list');
      return;
    }

    try {
      const firestore = firebase.firestore();
      
      if (isInCompareList) {
        await firestore.collection('CompareList').doc(compareId).delete();
        setIsInCompareList(false);
        setCompareId(null);
        Alert.alert('Success', 'Removed from compare list');
      } else {
        const compareRef = firestore.collection('CompareList')
          .where('userEmail', '==', user.primaryEmailAddress.emailAddress);
        
        const snapshot = await compareRef.get();
        
        if (snapshot.size >= 4) {
          Alert.alert(
            'Compare List Full',
            'You can compare up to 4 products at a time. Please remove some items first.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'View Compare List',
                onPress: () => navigation.navigate('CompareProductsScreen')
              }
            ]
          );
          return;
        }
        
        const compareData = {
          userEmail: user.primaryEmailAddress.emailAddress,
          productId: params.product.id,
          addedAt: new Date().toISOString()
        };
        
        const docRef = await firestore.collection('CompareList').add(compareData);
        setIsInCompareList(true);
        setCompareId(docRef.id);
        
        Alert.alert(
          'Success',
          'Added to compare list',
          [
            { text: 'OK', style: 'cancel' },
            {
              text: 'View Compare List',
              onPress: () => navigation.navigate('CompareProductsScreen')
            }
          ]
        );
      }
      
      setupHeaderButtons();
    } catch (error) {
      console.error('Error toggling compare list:', error);
      Alert.alert('Error', 'Failed to update compare list');
    }
  };

  const setPriceAlert = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to set price alerts');
      return;
    }

    try {
      const firestore = firebase.firestore();
      
      if (hasPriceAlert) {
        const alertDoc = await firestore.collection('PriceAlerts').doc(priceAlertId).get();
        const alertData = alertDoc.data();
        
        Alert.alert(
          'Price Alert',
          `Current alert: ${alertData.targetPrice} TND\nCurrent price: ${product.price} TND`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete Alert',
              style: 'destructive',
              onPress: async () => {
                await firestore.collection('PriceAlerts').doc(priceAlertId).delete();
                setHasPriceAlert(false);
                setPriceAlertId(null);
                Alert.alert('Success', 'Price alert deleted');
              }
            },
            {
              text: 'Edit Alert',
              onPress: () => {
                navigation.navigate('PriceAlertsScreen');
              }
            }
          ]
        );
      } else {
        Alert.prompt(
          'Set Price Alert',
          'Enter your target price in TND:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Set Alert',
              onPress: async (targetPrice) => {
                const targetPriceNum = parseFloat(targetPrice);
                
                if (isNaN(targetPriceNum) || targetPriceNum <= 0) {
                  Alert.alert('Error', 'Please enter a valid price');
                  return;
                }
                
                const alertData = {
                  userEmail: user.primaryEmailAddress.emailAddress,
                  postId: params.product.id,
                  currentPrice: parseFloat(product.price),
                  targetPrice: targetPriceNum,
                  createdAt: new Date().toISOString()
                };
                
                const docRef = await firestore.collection('PriceAlerts').add(alertData);
                setHasPriceAlert(true);
                setPriceAlertId(docRef.id);
                
                Alert.alert('Success', 'Price alert set successfully');
              }
            }
          ],
          'plain-text',
          product.price.toString()
        );
      }
    } catch (error) {
      console.error('Error setting price alert:', error);
      Alert.alert('Error', 'Failed to set price alert');
    }
  };

  const viewSellerReviews = () => {
    if (!product.userEmail) {
      Alert.alert('Error', 'Seller information not available');
      return;
    }
    
    // Navigate to ReviewsScreen through the Profile stack
    navigation.navigate('Profile', {
      screen: 'ReviewsScreen',
      params: {
        sellerId: product.userEmail,
        sellerName: product.userName
      }
    });
  };

  const deleteUserPost = async () => {
    Alert.alert('Confirm Delete', "Are you sure you want to delete this post?", [
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const q = query(collection(db, 'UserPost'), 
                          where('title', '==', product.title),
                          where('userEmail', '==', user.primaryEmailAddress.emailAddress));
            const snapshot = await getDocs(q);
            
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            
            navigation.goBack();
          } catch (error) {
            console.error("Delete error:", error);
            Alert.alert('Error', 'Failed to delete post.');
          }
        }
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const editUserPost = () => {
    // Navigate to EditPostScreen through the Profile stack
    navigation.navigate('Profile', {
      screen: 'EditPostScreen',
      params: { product }
    });
  };

  const shareProduct = async () => {
    try {
      await Share.share({
        message: `${product.title}\n${product.description}\nPrice: ${product.price} TND`,
        url: product.image
      });
    } catch (error) {
      console.error('Sharing error:', error);
    }
  };

  const sendEmailMessage = () => {
    const subject = `Regarding ${product.title}`;
    const body = `Hi ${product.userName},\n\nI'm interested in your product "${product.title}".\n\nBest regards,\n${user.fullName}`;
    Linking.openURL(`mailto:${product.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const callPhoneNumber = () => {
    if (product.phoneNumber) {
      Linking.openURL(`tel:${product.phoneNumber}`);
    } else {
      Alert.alert('No Phone Number', 'This seller has not provided a phone number.');
    }
  };

  const openSocialMedia = (platform, url) => {
    if (url) {
      Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
    } else {
      Alert.alert(`No ${platform}`, `This seller has not provided a ${platform} profile.`);
    }
  };

  const startChat = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour démarrer un chat.');
      return;
    }

    try {
      console.log("Démarrage du chat...");
      
      const chatsRef = collection(db, 'Chats');
      console.log("Vérifie l'existence d'un chat pour:", user.primaryEmailAddress.emailAddress, "et le produit:", product.id);
      
      const q = query(chatsRef, 
        where('participants', 'array-contains', user.primaryEmailAddress.emailAddress),
        where('postId', '==', product.id)
      );
      
      const chatSnapshot = await getDocs(q);
      let chatId;

      if (!chatSnapshot.empty) {
        chatId = chatSnapshot.docs[0].id;
        console.log('Chat existant trouvé, ID:', chatId);
      } else {
        console.log("Création d'un nouveau chat");
        const chatData = {
          participants: [
            user.primaryEmailAddress.emailAddress,
            product.userEmail
          ],
          postId: product.id,
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          product: {
            title: product.title,
            image: product.image,
            price: product.price
          }
        };

        try {
          const chatRef = await addDoc(collection(db, 'Chats'), chatData);
          chatId = chatRef.id;
          console.log('Nouveau chat créé, ID:', chatId);
        } catch (innerError) {
          console.error('Erreur lors de la création du chat:', innerError);
          throw new Error(`Erreur de création: ${innerError.message}`);
        }
      }

      console.log("Navigation vers l'écran de chat avec ID:", chatId);
      
      const rootNavigation = navigation.getParent();
      
      try {
        if (rootNavigation) {
          rootNavigation.navigate('home-nav', {
            screen: 'ChatScreen',
            params: {
              chatId: chatId,
              product: product
            }
          });
        } else {
          navigation.navigate('ChatScreen', {
            chatId: chatId,
            product: product
          });
        }
      } catch (navError) {
        console.error('Erreur de navigation:', navError);
        
        navigation.navigate('home');
        setTimeout(() => {
          navigation.navigate('ChatScreen', {
            chatId: chatId,
            product: product
          });
        }, 500);
      }
    } catch (error) {
      console.error('Erreur chat complète:', error);
      console.error('Détails:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Erreur', 
        'Impossible de démarrer le chat: ' + (error.message || 'Erreur inconnue')
      );
    }
  };

  return (
    <ScrollView className="bg-white">
      <Image 
        source={{ uri: product.image }}
        className="h-[320px] w-full"
        resizeMode="cover"
      />
      
      <View className="p-5">
        <Text className="text-2xl font-bold">{product?.title}</Text>
        <Text className="text-blue-500 text-lg font-semibold mt-2">{product?.price} TND</Text>
        
        <View className="flex-row items-center mt-3">
          <Text className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
            {product.category}
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between mt-4">
          <TouchableOpacity
            onPress={toggleFavorite}
            className={`bg-${isFavorite ? 'red' : 'gray'}-100 rounded-lg p-2 w-[48%] items-center mb-2`}
          >
            <FontAwesome 
              name={isFavorite ? "heart" : "heart-o"} 
              size={20} 
              color={isFavorite ? "#ff3b30" : "#666"}
            />
            <Text className={`text-${isFavorite ? 'red' : 'gray'}-800 mt-1 text-sm`}>
              {isFavorite ? 'Saved' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={toggleCompare}
            className={`bg-${isInCompareList ? 'blue' : 'gray'}-100 rounded-lg p-2 w-[48%] items-center mb-2`}
          >
            <FontAwesome 
              name="balance-scale" 
              size={20} 
              color={isInCompareList ? "#007aff" : "#666"}
            />
            <Text className={`text-${isInCompareList ? 'blue' : 'gray'}-800 mt-1 text-sm`}>
              {isInCompareList ? 'In Compare List' : 'Compare'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={setPriceAlert}
            className={`bg-${hasPriceAlert ? 'green' : 'gray'}-100 rounded-lg p-2 w-[48%] items-center mb-2`}
          >
            <FontAwesome 
              name="bell" 
              size={20} 
              color={hasPriceAlert ? "#34c759" : "#666"}
            />
            <Text className={`text-${hasPriceAlert ? 'green' : 'gray'}-800 mt-1 text-sm`}>
              {hasPriceAlert ? 'Price Alert Set' : 'Set Price Alert'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={shareProduct}
            className="bg-gray-100 rounded-lg p-2 w-[48%] items-center mb-2"
          >
            <Ionicons name="share-outline" size={20} color="#666" />
            <Text className="text-gray-800 mt-1 text-sm">Share</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold mt-5">Description</Text>
        <Text className="text-gray-700 mt-1">{product?.description}</Text>

        {product.subcategoryDetails && Object.keys(product.subcategoryDetails).length > 0 && (
          <View className="mt-5">
            <Text className="text-lg font-bold mb-2">Détails supplémentaires</Text>
            <View className="bg-gray-50 p-4 rounded-lg">
              {Object.entries(product.subcategoryDetails).map(([key, value]) => (
                <View key={key} className="flex-row items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600 w-2/5 capitalize font-medium text-sm">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <Text className="text-gray-800 flex-1 text-sm">{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
      
      <View className="p-5 bg-blue-50 border-t border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="font-bold text-lg mb-3">Seller Information</Text>
          <TouchableOpacity
            onPress={viewSellerReviews}
            className="bg-blue-100 rounded-full px-3 py-1"
          >
            <Text className="text-blue-800">View Reviews</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center">
          <Image 
            source={{ uri: product.userImage }}
            className="w-12 h-12 rounded-full"
          />
          <View className="ml-3">
            <Text className="font-bold">{product.userName}</Text>
            <Text className="text-gray-600 text-sm">{product.userEmail}</Text>
          </View>
        </View>
      </View>

      <View className="p-5">
        <Text className="font-bold text-lg mb-3">Contact Seller</Text>
        
        <View className="flex-row space-x-3 mb-5">
          <TouchableOpacity
            onPress={callPhoneNumber}
            className="flex-1 bg-green-500 rounded-lg p-3 items-center"
          >
            <Ionicons name="call" size={20} color="white" />
            <Text className="text-white mt-1">Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={sendEmailMessage}
            className="flex-1 bg-blue-500 rounded-lg p-3 items-center"
          >
            <Ionicons name="mail" size={20} color="white" />
            <Text className="text-white mt-1">Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={startChat}
            className="flex-1 bg-purple-500 rounded-lg p-3 items-center"
          >
            <Ionicons name="chatbubbles" size={20} color="white" />
            <Text className="text-white mt-1">Chat</Text>
          </TouchableOpacity>
        </View>

        {product.socialMedia && (
          <>
            <Text className="font-bold text-lg mb-3">Social Media</Text>
            <View className="flex-row space-x-3">
              {product.socialMedia.instagram && (
                <TouchableOpacity
                  onPress={() => openSocialMedia('Instagram', product.socialMedia.instagram)}
                  className="flex-1 bg-pink-500 rounded-lg p-3 items-center"
                >
                  <Ionicons name="logo-instagram" size={20} color="white" />
                  <Text className="text-white mt-1">Instagram</Text>
                </TouchableOpacity>
              )}
              
              {product.socialMedia.facebook && (
                <TouchableOpacity
                  onPress={() => openSocialMedia('Facebook', product.socialMedia.facebook)}
                  className="flex-1 bg-blue-600 rounded-lg p-3 items-center"
                >
                  <Ionicons name="logo-facebook" size={20} color="white" />
                  <Text className="text-white mt-1">Facebook</Text>
                </TouchableOpacity>
              )}
              
              {product.socialMedia.twitter && (
                <TouchableOpacity
                  onPress={() => openSocialMedia('Twitter', product.socialMedia.twitter)}
                  className="flex-1 bg-blue-400 rounded-lg p-3 items-center"
                >
                  <Ionicons name="logo-twitter" size={20} color="white" />
                  <Text className="text-white mt-1">Twitter</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      {user?.primaryEmailAddress?.emailAddress === product?.userEmail && (
        <View className="flex-row mx-5 my-3">
          <TouchableOpacity
            onPress={editUserPost}
            className="flex-1 bg-blue-500 rounded-lg p-3 items-center mr-2"
          >
            <Text className="text-white font-bold">Edit Post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={deleteUserPost}
            className="flex-1 bg-red-500 rounded-lg p-3 items-center"
          >
            <Text className="text-white font-bold">Delete Post</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}