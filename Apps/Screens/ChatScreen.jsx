import { 
    View, 
    Text, 
    TextInput, 
    FlatList, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    KeyboardAvoidingView, 
    Platform, 
    Image, 
    Alert 
  } from 'react-native';
  import React, { useEffect, useState, useRef } from 'react';
  import { useRoute } from '@react-navigation/native';
  import { 
    getFirestore, 
    collection, 
    query, 
    orderBy, 
    onSnapshot, 
    addDoc, 
    doc, 
    serverTimestamp, 
    updateDoc, 
    arrayUnion, 
    where, 
    getDocs 
  } from 'firebase/firestore';
  import { useUser } from '@clerk/clerk-expo';
  import { app, db, auth, storage } from '../../firebase';
  import Ionicons from '@expo/vector-icons/Ionicons';
  import { Feather } from '@expo/vector-icons';
  
  export default function ChatScreen() {
      const { params } = useRoute();
      const { chatId, product } = params;
      const { user } = useUser();
      // db is now imported directly from firebase.js
      const [messages, setMessages] = useState([]);
      const [newMessage, setNewMessage] = useState('');
      const [loading, setLoading] = useState(true);
      const flatListRef = useRef();
  
      useEffect(() => {
          if (!chatId) {
              Alert.alert('Error', 'Invalid chat ID.');
              return;
          }
  
          console.log("Chargement des messages pour le chat:", chatId);
          const messagesRef = collection(db, 'Chats', chatId, 'messages');
          const q = query(messagesRef, orderBy('timestamp', 'asc'));
          
          try {
              const unsubscribe = onSnapshot(q, (snapshot) => {
                  console.log(`${snapshot.docs.length} messages récupérés`);
                  const messageList = [];
                  snapshot.forEach((doc) => {
                      messageList.push({ 
                          id: doc.id, 
                          ...doc.data(),
                          timestamp: doc.data().timestamp?.toDate() 
                      });
                  });
                  setMessages(messageList);
                  setLoading(false);
                  
                  if (messageList.length > 0) {
                      setTimeout(() => {
                          flatListRef.current?.scrollToEnd({ animated: true });
                      }, 100);
                  }
              }, (error) => {
                  console.error('Error loading messages:', error);
                  console.error('Error details:', JSON.stringify(error, null, 2));
                  setLoading(false);
                  Alert.alert('Error', 'Failed to load messages: ' + error.message);
              });
  
              // Marquer les messages comme lus
              markMessagesAsRead();
  
              return () => unsubscribe();
          } catch (error) {
              console.error('Erreur lors de l\'initialisation du listener:', error);
              setLoading(false);
              Alert.alert('Error', 'Failed to initialize message listener: ' + error.message);
          }
      }, [chatId]);
  
      // Marquer les messages comme lus quand l'utilisateur ouvre le chat
      const markMessagesAsRead = async () => {
          if (!chatId || !user) return;
          
          try {
              const chatRef = doc(db, 'Chats', chatId);
              await updateDoc(chatRef, {
                  readBy: arrayUnion(user.primaryEmailAddress.emailAddress)
              });
              console.log("Messages marqués comme lus");
          } catch (error) {
              console.error("Erreur lors du marquage des messages comme lus:", error);
          }
      };
  
      const sendMessage = async () => {
          const messageText = newMessage.trim();
          if (!messageText || !user) return;
  
          try {
              console.log("Envoi d'un message au chat:", chatId);
              const messagesRef = collection(db, 'Chats', chatId, 'messages');
              
              // Ajout du message à la collection des messages
              const messageData = {
                  sender: user.primaryEmailAddress.emailAddress,
                  senderName: user.fullName,
                  senderImage: user.imageUrl,
                  message: messageText,
                  timestamp: serverTimestamp()
              };
              
              console.log("Données du message:", JSON.stringify(messageData, null, 2));
              const docRef = await addDoc(messagesRef, messageData);
              console.log("Message ajouté avec ID:", docRef.id);
  
              // Mise à jour des informations du chat
              const chatRef = doc(db, 'Chats', chatId);
              await updateDoc(chatRef, {
                  lastMessage: messageText,
                  lastMessageTime: serverTimestamp(),
                  lastMessageSender: user.primaryEmailAddress.emailAddress,
                  readBy: [user.primaryEmailAddress.emailAddress] // Réinitialiser les lecteurs
              });
              console.log("Informations du chat mises à jour");
  
              setNewMessage('');
          } catch (error) {
              console.error('Error sending message:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              Alert.alert(
                  'Error', 
                  'Failed to send message: ' + (error.message || 'Unknown error')
              );
          }
      };
  
      const renderMessage = ({ item }) => {
          const isCurrentUser = item.sender === user?.primaryEmailAddress?.emailAddress;
          
          return (
              <View style={[
                  styles.messageContainer,
                  isCurrentUser ? styles.sentMessage : styles.receivedMessage
              ]}>
                  {!isCurrentUser && (
                      <Image 
                          source={{ uri: item.senderImage || 'https://via.placeholder.com/150' }} 
                          style={styles.avatar}
                      />
                  )}
                  
                  <View style={isCurrentUser ? styles.sentContent : styles.receivedContent}>
                      {!isCurrentUser && (
                          <Text style={styles.senderName}>{item.senderName || 'Unknown'}</Text>
                      )}
                      <Text style={isCurrentUser ? styles.sentText : styles.receivedText}>
                          {item.message}
                      </Text>
                      <Text style={styles.timeText}>
                          {item.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'}
                      </Text>
                  </View>
              </View>
          );
      };
  
      if (loading) {
          return (
              <View style={styles.centered}>
                  <ActivityIndicator size="large" color="#3b82f6" />
              </View>
          );
      }
  
      return (
          <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.container}
              keyboardVerticalOffset={90}
          >
              <View style={styles.header}>
                  <Image 
                      source={{ uri: product?.image || 'https://via.placeholder.com/150' }} 
                      style={styles.productImage}
                  />
                  <View>
                      <Text style={styles.headerText}>{product?.title || 'Produit'}</Text>
                      <Text style={styles.priceText}>{product?.price || '0'} TND</Text>
                  </View>
              </View>
  
              <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={(item) => item.id}
                  style={styles.messageList}
                  contentContainerStyle={styles.messageListContent}
                  onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                  onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              />
  
              <View style={styles.inputContainer}>
                  <TextInput
                      style={styles.input}
                      value={newMessage}
                      onChangeText={setNewMessage}
                      placeholder="Type a message..."
                      multiline
                      placeholderTextColor="#999"
                  />
                  <TouchableOpacity 
                      onPress={sendMessage} 
                      style={styles.sendButton}
                      disabled={!newMessage.trim()}
                  >
                      <Ionicons 
                          name="send" 
                          size={24} 
                          color={newMessage.trim() ? "#fff" : "#ccc"} 
                      />
                  </TouchableOpacity>
              </View>
          </KeyboardAvoidingView>
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
      },
      header: {
          flexDirection: 'row',
          padding: 15,
          backgroundColor: '#3b82f6',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderColor: '#ddd',
      },
      productImage: {
          width: 50,
          height: 50,
          borderRadius: 8,
          marginRight: 15,
      },
      headerText: {
          color: '#fff',
          fontSize: 16,
          fontWeight: 'bold',
      },
      priceText: {
          color: '#fff',
          fontSize: 14,
          opacity: 0.8,
      },
      messageList: {
          flex: 1,
      },
      messageListContent: {
          paddingVertical: 15,
          paddingHorizontal: 10,
      },
      messageContainer: {
          flexDirection: 'row',
          marginVertical: 5,
          maxWidth: '80%',
      },
      sentMessage: {
          alignSelf: 'flex-end',
      },
      receivedMessage: {
          alignSelf: 'flex-start',
      },
      avatar: {
          width: 36,
          height: 36,
          borderRadius: 18,
          marginRight: 8,
      },
      sentContent: {
          backgroundColor: '#3b82f6',
          padding: 12,
          borderRadius: 18,
          borderTopRightRadius: 4,
      },
      receivedContent: {
          backgroundColor: '#fff',
          padding: 12,
          borderRadius: 18,
          borderTopLeftRadius: 4,
      },
      senderName: {
          fontWeight: 'bold',
          fontSize: 12,
          marginBottom: 4,
          color: '#333',
      },
      sentText: {
          color: '#fff',
          fontSize: 16,
      },
      receivedText: {
          color: '#333',
          fontSize: 16,
      },
      timeText: {
          fontSize: 10,
          color: '#999',
          marginTop: 4,
          alignSelf: 'flex-end',
      },
      inputContainer: {
          flexDirection: 'row',
          padding: 10,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderColor: '#ddd',
          alignItems: 'center',
      },
      input: {
          flex: 1,
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 25,
          paddingHorizontal: 15,
          paddingVertical: 10,
          maxHeight: 100,
          backgroundColor: '#f9f9f9',
      },
      sendButton: {
          marginLeft: 10,
          backgroundColor: '#3b82f6',
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
      },
  });