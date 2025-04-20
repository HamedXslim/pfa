import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import diary from './../../assets/images/diary.png'
import LogOut from './../../assets/images/LogOut.png'
import Search from './../../assets/images/Search.png'
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
    const { user } = useUser();
    const navigation=useNavigation();
    const {isLoaded,signOut}=useAuth();
    const db = getFirestore(app);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Surveiller les nouveaux messages
    useEffect(() => {
        if (!user) return;

        console.log("Configuration du listener de messages pour:", user.primaryEmailAddress.emailAddress);
        
        // Récupérer tous les chats où l'utilisateur est participant
        const chatsRef = collection(db, 'Chats');
        const q = query(chatsRef, where('participants', 'array-contains', user.primaryEmailAddress.emailAddress));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let newUnreadCount = 0;
            
            snapshot.forEach((doc) => {
                const chatData = doc.data();
                
                // Vérifier si le dernier message n'a pas été lu et n'a pas été envoyé par l'utilisateur actuel
                if (
                    chatData.lastMessageSender && 
                    chatData.lastMessageSender !== user.primaryEmailAddress.emailAddress &&
                    (!chatData.readBy || !chatData.readBy.includes(user.primaryEmailAddress.emailAddress))
                ) {
                    newUnreadCount++;
                }
            });
            
            setUnreadCount(newUnreadCount);
            setHasUnreadMessages(newUnreadCount > 0);
            console.log("Messages non lus:", newUnreadCount);
        });

        return () => unsubscribe();
    }, [user]);

    // Ouvrir la liste des conversations
    const openChats = () => {
        navigation.navigate('UserChats');
    };

    const menuList=[
        {
            id:1,
            name:'My product',
            icon:diary,
            path:'my-product'
        },
        {
            id:2,
            name:'Explore',
            icon:Search,
            path:'explore'
        },
        {
            id:3,
            name:'LogOut',
            icon:LogOut
        }
    ]

    const onMenuPress=(item)=>{
        if(item.name=='LogOut')
        {
            signOut();
            return ;
        }
        item?.path?navigation.navigate(item.path):null;
    }
    return (
        <ScrollView className="p-5 bg-white flex-1">
            <View className="items-center justify-center mt-5">
                <Image 
                    source={{ uri: user?.imageUrl }}
                    className="w-[100px] h-[100px] rounded-full"
                />
                <View className="flex-row items-center mt-3">
                    <Text className="text-[25px] font-bold">{user?.fullName}</Text>
                    
                    {/* Icône de notification de messages */}
                    {hasUnreadMessages && (
                        <TouchableOpacity 
                            onPress={openChats} 
                            style={styles.notificationBadge}
                        >
                            <Ionicons name="chatbubble" size={22} color="#fff" />
                            {unreadCount > 0 && (
                                <View style={styles.counter}>
                                    <Text style={styles.counterText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
                <Text className="text-gray-500 mt-1">{user?.primaryEmailAddress.emailAddress}</Text>
            </View>

            <View className="mt-10">
                <TouchableOpacity
                    className="bg-blue-500 p-3 rounded-lg flex-row items-center"
                    onPress={() => navigation.navigate('my-product')}
                >
                    <Ionicons name="list" size={24} color="#fff" />
                    <Text className="text-white text-[17px] ml-3 font-medium">Mes produits</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-blue-500 p-3 rounded-lg flex-row items-center mt-5"
                    onPress={openChats}
                >
                    <Ionicons name="chatbubbles" size={24} color="#fff" />
                    <Text className="text-white text-[17px] ml-3 font-medium">Mes conversations</Text>
                    {unreadCount > 0 && (
                        <View style={styles.badgeSmall}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    notificationBadge: {
        backgroundColor: '#3b82f6',
        width: 35,
        height: 35,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    counter: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    badgeSmall: {
        backgroundColor: 'red',
        borderRadius: 15,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});