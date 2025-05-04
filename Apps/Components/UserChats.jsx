import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { app, db, auth, storage } from '../../firebase';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function UserChats() {
  const { user } = useUser();
  const navigation = useNavigation();
  // db is now imported directly from firebase.js
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, 'Chats');
    const q = query(
      chatsRef, 
      where('participants', 'array-contains', user.primaryEmailAddress.emailAddress),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsList = [];
      const notificationsToCreate = [];
      
      // Ajouter des logs pour débogage
      console.log(`Observing ${snapshot.docs.length} chats for user: ${user.primaryEmailAddress.emailAddress}`);
      
      snapshot.docChanges().forEach((change) => {
        // Vérifier si c'est un nouveau message ou une mise à jour
        if (change.type === 'added' || change.type === 'modified') {
          const chatData = change.doc.data();
          console.log(`Chat ${change.doc.id} ${change.type}:`, {
            lastMessageSender: chatData.lastMessageSender,
            lastMessage: chatData.lastMessage,
            notificationSent: chatData.notificationSent,
            readBy: chatData.readBy
          });
          
          // Vérifier si c'est un message non lu envoyé par quelqu'un d'autre
          const isUnread = 
            chatData.lastMessageSender && 
            chatData.lastMessageSender !== user.primaryEmailAddress.emailAddress &&
            (!chatData.readBy || !chatData.readBy.includes(user.primaryEmailAddress.emailAddress));
          
          // Si c'est un nouveau message non lu et que l'expéditeur n'est pas l'utilisateur actuel
          // et que la notification n'a pas encore été envoyée
          if (isUnread && chatData.lastMessage && chatData.notificationSent !== true) {
            console.log(`Preparing notification for chat ${change.doc.id}`);
            // Préparer une notification à créer
            notificationsToCreate.push({
              chatId: change.doc.id,
              productTitle: chatData.product?.title || 'Produit',
              senderEmail: chatData.lastMessageSender,
              message: chatData.lastMessage || 'Nouveau message'
            });
          }
        }
      });
      
      // Récupérer les données complètes pour l'affichage
      snapshot.forEach((doc) => {
        const chatData = doc.data();
        const isUnread = 
          chatData.lastMessageSender && 
          chatData.lastMessageSender !== user.primaryEmailAddress.emailAddress &&
          (!chatData.readBy || !chatData.readBy.includes(user.primaryEmailAddress.emailAddress));
        
        chatsList.push({
          id: doc.id,
          ...chatData,
          isUnread: isUnread,
          lastMessageTime: chatData.lastMessageTime?.toDate() || new Date()
        });
      });
      
      // Créer des notifications pour les nouveaux messages
      if (notificationsToCreate.length > 0) {
        console.log(`Creating ${notificationsToCreate.length} notifications for new messages`);
        
        try {
          const notificationsRef = collection(db, 'Notifications');
          
          for (const notifData of notificationsToCreate) {
            console.log('Creating notification for chat:', notifData.chatId);
            
            // Créer une notification pour chaque nouveau message
            const notificationData = {
              userEmail: user.primaryEmailAddress.emailAddress,
              postId: notifData.chatId, // Utiliser chatId comme postId pour pouvoir naviguer vers le chat
              message: `Nouveau message: ${notifData.message} (${notifData.productTitle})`,
              createdAt: serverTimestamp(),
              read: false,
              type: 'message',
              senderEmail: notifData.senderEmail
            };
            
            console.log('Notification data:', notificationData);
            
            // Ajouter la notification à Firestore
            const notifRef = await addDoc(notificationsRef, notificationData);
            console.log('Notification created with ID:', notifRef.id);
            
            // Marquer que la notification a été envoyée pour ce chat
            const chatDoc = doc(db, 'Chats', notifData.chatId);
            await updateDoc(chatDoc, {
              notificationSent: true
            });
            console.log('Chat marked as notified:', notifData.chatId);
          }
        } catch (error) {
          console.error('Error creating message notifications:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        }
      } else {
        console.log('No new notifications to create');
      }
      
      setChats(chatsList);
      setLoading(false);
    }, (error) => {
      console.error("Error loading chats:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const openChat = (chatId, product) => {
    navigation.navigate('ChatScreen', {
      chatId,
      product
    });
  };

  const renderChatItem = ({ item }) => {
    // Trouver l'autre participant
    const otherParticipant = item.participants?.find(
      p => p !== user?.primaryEmailAddress?.emailAddress
    );

    return (
      <TouchableOpacity 
        style={[styles.chatItem, item.isUnread && styles.unreadItem]} 
        onPress={() => openChat(item.id, item.product)}
      >
        <Image 
          source={{ uri: item.product?.image || 'https://via.placeholder.com/150' }} 
          style={styles.productImage} 
        />
        
        <View style={styles.chatInfo}>
          <Text style={styles.productTitle} numberOfLines={1}>
            {item.product?.title || 'Produit sans nom'}
          </Text>
          
          <Text style={styles.participantEmail} numberOfLines={1}>
            {otherParticipant || 'Utilisateur inconnu'}
          </Text>
          
          <View style={styles.messageRow}>
            <Text 
              style={[styles.lastMessage, item.isUnread && styles.unreadText]} 
              numberOfLines={1}
            >
              {item.lastMessage || 'Pas de messages'}
            </Text>
            
            <Text style={styles.timeText}>
              {item.lastMessageTime?.toLocaleString([], {
                hour: '2-digit', 
                minute: '2-digit',
                month: 'short',
                day: 'numeric'
              }) || ''}
            </Text>
          </View>
        </View>
        
        {item.isUnread && (
          <View style={styles.unreadBadge}>
            <Ionicons name="chatbubble" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="chatbubbles-outline" size={60} color="#d1d5db" />
        <Text style={styles.emptyText}>Vous n'avez pas encore de conversations</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
    textAlign: 'center',
  },
  listContent: {
    padding: 15,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  productTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  participantEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    marginRight: 10,
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#3b82f6',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 