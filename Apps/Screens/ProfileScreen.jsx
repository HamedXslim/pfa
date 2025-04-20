import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import diary from './../../assets/images/diary.png'
import LogOut from './../../assets/images/LogOut.png'
import Search from './../../assets/images/Search.png'
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import Ionicons from '@expo/vector-icons/Ionicons';
import { runInitialization } from '../utils/initializeSubcategories';

// Liste des utilisateurs administrateurs (emails)
const ADMIN_EMAILS = [
  // Ajouter ici les emails des administrateurs
  "test@example.com", // Remplacez par votre email pour tester
  "utilisateur@exemple.fr",
  "kapukupa4@gmail.com",
  "oussamatrzd19@gmail.com",
  "kapuupak5@gmail.com"
];

export default function ProfileScreen() {
    const { user } = useUser();
    const navigation = useNavigation();
    const { isLoaded, signOut } = useAuth();
    const db = getFirestore(app);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [initializing, setInitializing] = useState(false);

    // Vérifier si l'utilisateur est un administrateur
    useEffect(() => {
        if (user && user.primaryEmailAddress) {
            const email = user.primaryEmailAddress.emailAddress;
            setIsAdmin(ADMIN_EMAILS.includes(email));
        }
    }, [user]);

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
            path: 'MyProducts'
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

    // Fonction pour initialiser les sous-catégories
    const handleInitializeSubcategories = async () => {
        try {
            setInitializing(true);
            const result = await runInitialization();
            
            if (result.success) {
                Alert.alert(
                    'Succès', 
                    `${result.count} sous-catégories ont été initialisées dans Firestore.`
                );
            } else {
                Alert.alert(
                    'Information', 
                    result.message || 'Les sous-catégories existent déjà ou il y a eu une erreur.'
                );
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des sous-catégories:', error);
            Alert.alert('Erreur', 'Une erreur s\'est produite lors de l\'initialisation des sous-catégories.');
        } finally {
            setInitializing(false);
        }
    };

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

            {/* Section de gestion des sous-catégories (accessible à tous les utilisateurs) */}
            <View style={styles.adminSection}>
                <Text style={styles.adminTitle}>Gestion des catégories</Text>
                
                <TouchableOpacity 
                    style={[styles.adminButton, initializing && styles.disabledButton]}
                    onPress={handleInitializeSubcategories}
                    disabled={initializing}
                >
                    {initializing ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.adminButtonText}>
                            Initialiser les sous-catégories
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
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
    adminSection: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    adminTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#334155',
    },
    adminButton: {
        backgroundColor: '#4f46e5',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#a5a5a5',
    },
    adminButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});