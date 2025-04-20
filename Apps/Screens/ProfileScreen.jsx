import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
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
    const navigation = useNavigation();
    const { isLoaded, signOut } = useAuth();
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

    // Menu items
    const menuList = [
        {
            id: 1,
            name: 'My product',
            icon: diary,
            path: 'my-product'
        },
        {
            id: 2,
            name: 'Explore',
            icon: Search,
            path: 'explore'
        },
        {
            id: 3,
            name: 'Mes messages',
            icon: 'chatbubbles-outline',
            path: 'UserChats',
            showBadge: hasUnreadMessages,
            badgeCount: unreadCount
        },
        {
            id: 4,
            name: 'LogOut',
            icon: LogOut
        }
    ];

    const onMenuPress = (item) => {
        if (item.name == 'LogOut') {
            signOut();
            return;
        }
        item?.path ? navigation.navigate(item.path) : null;
    };

    return (
        <View className="p-5 bg-white flex-1">
            <View className="items-center mt-14">
                <Image 
                    source={{ uri: user?.imageUrl }}
                    className="w-[100px] h-[100px] rounded-full"
                />

                <View className="flex-row items-center mt-2">
                    <Text className="font-bold text-[25px]">
                        {user?.fullName}
                    </Text>
                    
                    {/* Icône de notification à côté du nom (optionnel) */}
                    {hasUnreadMessages && (
                        <View style={styles.notificationDot}/>
                    )}
                </View>

                <Text className="text-[18px] mt-2 text-gray-500">
                    {user?.primaryEmailAddress?.emailAddress}
                </Text>
            </View>

            <FlatList
                data={menuList}
                numColumns={3}
                style={{ marginTop: 20 }}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        onPress={() => onMenuPress(item)}
                        className="flex-1 p-3 border-[1px] 
                            items-center
                            m-4 rounded-lg border-blue-400
                            bg-blue-50 mx-2 mt-4"
                    >
                        {typeof item.icon === 'string' ? (
                            <View style={styles.iconContainer}>
                                <Ionicons name={item.icon} size={30} color="#3b82f6" />
                                {item.showBadge && (
                                    <View style={styles.badgeMenu}>
                                        <Text style={styles.badgeText}>
                                            {item.badgeCount > 9 ? '9+' : item.badgeCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <Image 
                                source={item.icon}
                                className="w-[50px] h-[50px]"
                            />
                        )}
                        <Text className="text-[12px] mt-2 text-blue-700">{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    notificationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ef4444',
        marginLeft: 8,
    },
    badgeMenu: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    iconContainer: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
});