import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width / 2) - 20;

export default function PostItem({ post }) {
  const navigation = useNavigation();

  const openDetail = () => {
    navigation.navigate('product-detail', {
      product: post
    });
  };

  // Formater le prix pour l'affichage
  const formatPrice = (price) => {
    if (!price) return "Prix non défini";
    return `${price} TND`;
  };

  // Extraire la première sous-catégorie pour l'affichage (optionnel)
  const getMainSubcategory = () => {
    if (!post.subcategoryDetails) return null;
    
    const subcats = Object.entries(post.subcategoryDetails);
    if (subcats.length === 0) return null;
    
    // Prendre le premier élément des sous-catégories (pour simplifier)
    const [key, value] = subcats[0];
    return value;
  };

  const mainSubcategory = getMainSubcategory();

  return (
    <TouchableOpacity style={styles.container} onPress={openDetail}>
      <View style={styles.card}>
        <Image 
          source={{ uri: post.image }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {post.title}
          </Text>
          
          <Text style={styles.price}>
            {formatPrice(post.price)}
          </Text>
          
          {post.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.category} numberOfLines={1}>
                {post.category}
              </Text>
              
              {mainSubcategory && (
                <Text style={styles.subcategory} numberOfLines={1}>
                  {mainSubcategory}
                </Text>
              )}
            </View>
          )}
          
          <View style={styles.footer}>
            <View style={styles.userInfo}>
              {post.userImage ? (
                <Image 
                  source={{ uri: post.userImage }} 
                  style={styles.userImage}
                />
              ) : (
                <View style={styles.userImagePlaceholder}>
                  <FontAwesome name="user" size={12} color="#666" />
                </View>
              )}
              
              <Text style={styles.userName} numberOfLines={1}>
                {post.userName || "Utilisateur"}
              </Text>
            </View>
            
            <Text style={styles.date}>
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    margin: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
  },
  infoContainer: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 6,
  },
  category: {
    fontSize: 12,
    color: '#4b5563',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  subcategory: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  userImagePlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  userName: {
    fontSize: 11,
    color: '#4b5563',
    flex: 1,
  },
  date: {
    fontSize: 10,
    color: '#9ca3af',
  },
}); 