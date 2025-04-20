import { View, Text, Image, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Share from 'expo-sharing';

export default function ProductDetail() {
    const { params } = useRoute();
    const [product, setProduct] = useState({});
    const { user } = useUser();
    const db = getFirestore(app);
    const navigation = useNavigation();

    useEffect(() => {
        if (params?.product) {
            setProduct(params.product);
            shareButton();
        }
    }, [params]);

    const shareButton = () => {
        navigation.setOptions({
            headerRight: () => (
                <Ionicons 
                    name="share" 
                    size={24} 
                    color="black"
                    style={{ marginRight: 15 }}
                    onPress={() => shareProduct()}
                />
            ),
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
            {
                text: 'Cancel',
                style: 'cancel',
            }
        ]);
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
            
            // 1. Vérifier si un chat existe déjà
            const chatsRef = collection(db, 'Chats');
            console.log("Vérifie l'existence d'un chat pour:", user.primaryEmailAddress.emailAddress, "et le produit:", product.id);
            
            const q = query(chatsRef, 
                where('participants', 'array-contains', user.primaryEmailAddress.emailAddress),
                where('postId', '==', product.id)
            );
            
            const chatSnapshot = await getDocs(q);
            let chatId;

            if (!chatSnapshot.empty) {
                // Chat existe déjà
                chatId = chatSnapshot.docs[0].id;
                console.log('Chat existant trouvé, ID:', chatId);
            } else {
                // Créer un nouveau chat
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

            // 2. Naviguer vers le chat
            console.log("Navigation vers l'écran de chat avec ID:", chatId);
            
            // Obtenez l'état parent de navigation 
            const rootNavigation = navigation.getParent();
            
            try {
                // Essai avec le navigateur parent d'abord
                if (rootNavigation) {
                    rootNavigation.navigate('home-nav', {
                        screen: 'ChatScreen',
                        params: {
                            chatId: chatId,
                            product: product
                        }
                    });
                } else {
                    // Fallback avec le navigateur actuel
                    navigation.navigate('ChatScreen', {
                        chatId: chatId,
                        product: product
                    });
                }
            } catch (navError) {
                console.error('Erreur de navigation:', navError);
                
                // Dernier recours: naviguer vers l'écran d'accueil puis vers le chat
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

                <Text className="text-lg font-bold mt-5">Description</Text>
                <Text className="text-gray-700 mt-1">{product?.description}</Text>
            </View>
            
            <View className="p-5 bg-blue-50 border-t border-b border-gray-200">
                <Text className="font-bold text-lg mb-3">Seller Information</Text>
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
                <TouchableOpacity
                    onPress={deleteUserPost}
                    className="mx-5 my-3 bg-red-500 rounded-lg p-3 items-center"
                >
                    <Text className="text-white font-bold">Delete Post</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}