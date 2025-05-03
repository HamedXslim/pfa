import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { firebase } from '../../firebase.native.js';
import { FontAwesome } from '@expo/vector-icons';

export default function ReviewsScreen() {
  const { user } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  const { sellerId, sellerName } = route.params;
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [averageRating, setAverageRating] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userReviewId, setUserReviewId] = useState(null);

  useEffect(() => {
    if (!sellerId) return;
    
    navigation.setOptions({
      title: `Reviews for ${sellerName}`,
      headerTitleStyle: { fontWeight: 'bold' }
    });

    fetchReviews();
  }, [sellerId]);

  const fetchReviews = async () => {
    if (!sellerId) return;
    
    try {
      setLoading(true);
      const db = firebase.firestore();
      
      // Get reviews for this seller
      const reviewsRef = db.collection('Reviews')
        .where('sellerId', '==', sellerId)
        .orderBy('createdAt', 'desc');
      
      const unsubscribe = reviewsRef.onSnapshot((snapshot) => {
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculate average rating
        if (reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / reviewsData.length);
        }
        
        // Check if current user has already reviewed this seller
        if (user) {
          const userReview = reviewsData.find(
            review => review.reviewerEmail === user.primaryEmailAddress.emailAddress
          );
          
          if (userReview) {
            setUserHasReviewed(true);
            setUserReviewId(userReview.id);
          } else {
            setUserHasReviewed(false);
            setUserReviewId(null);
          }
        }
        
        setReviews(reviewsData);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to leave a review');
      return;
    }
    
    if (!reviewText.trim()) {
      Alert.alert('Error', 'Please enter review text');
      return;
    }
    
    try {
      const db = firebase.firestore();
      
      if (userHasReviewed) {
        // Update existing review
        await db.collection('Reviews').doc(userReviewId).update({
          rating,
          reviewText,
          updatedAt: new Date().toISOString()
        });
        
        Alert.alert('Success', 'Your review has been updated');
      } else {
        // Add new review
        const reviewData = {
          sellerId,
          sellerName,
          reviewerEmail: user.primaryEmailAddress.emailAddress,
          reviewerName: user.fullName,
          reviewerImage: user.imageUrl,
          rating,
          reviewText,
          createdAt: new Date().toISOString()
        };
        
        await db.collection('Reviews').add(reviewData);
        Alert.alert('Success', 'Your review has been submitted');
      }
      
      // Reset form and close modal
      setReviewText('');
      setRating(5);
      setModalVisible(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const deleteReview = async () => {
    if (!userReviewId) return;
    
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete your review?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = firebase.firestore();
              await db.collection('Reviews').doc(userReviewId).delete();
              
              setUserHasReviewed(false);
              setUserReviewId(null);
              Alert.alert('Success', 'Your review has been deleted');
            } catch (error) {
              console.error('Error deleting review:', error);
              Alert.alert('Error', 'Failed to delete review');
            }
          }
        }
      ]
    );
  };

  const editReview = () => {
    if (!userReviewId) return;
    
    // Find user's review
    const userReview = reviews.find(review => review.id === userReviewId);
    
    if (userReview) {
      setReviewText(userReview.reviewText);
      setRating(userReview.rating);
      setModalVisible(true);
    }
  };

  const renderStars = (count) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity 
          key={i} 
          onPress={() => modalVisible && setRating(i)}
          disabled={!modalVisible}
        >
          <FontAwesome 
            name={i <= count ? "star" : "star-o"} 
            size={modalVisible ? 32 : 16} 
            color="#FFD700" 
            style={{ marginRight: 5 }}
          />
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={{ flexDirection: 'row' }}>
        {stars}
      </View>
    );
  };

  const renderReviewItem = ({ item }) => (
    <View className="bg-white p-4 rounded-lg mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <Text className="font-bold text-lg mr-2">{item.reviewerName}</Text>
          {renderStars(item.rating)}
        </View>
        <Text className="text-gray-500 text-xs">
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <Text className="text-gray-700">{item.reviewText}</Text>
      
      {user && item.reviewerEmail === user.primaryEmailAddress.emailAddress && (
        <View className="flex-row justify-end mt-2">
          <TouchableOpacity 
            onPress={editReview}
            className="bg-blue-100 rounded-full px-3 py-1 mr-2"
          >
            <Text className="text-blue-800">Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={deleteReview}
            className="bg-red-100 rounded-full px-3 py-1"
          >
            <Text className="text-red-800">Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Review Summary */}
      <View className="bg-white p-4 mb-2">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-bold">{sellerName}</Text>
            <View className="flex-row items-center mt-1">
              {renderStars(Math.round(averageRating))}
              <Text className="ml-2 text-gray-700">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={() => {
              if (!user) {
                Alert.alert('Login Required', 'Please login to leave a review');
                return;
              }
              
              if (userHasReviewed) {
                Alert.alert(
                  'You already reviewed this seller',
                  'Would you like to edit your review?',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    },
                    {
                      text: 'Edit Review',
                      onPress: editReview
                    }
                  ]
                );
              } else {
                setModalVisible(true);
              }
            }}
          >
            <Text className="text-white font-bold">
              {userHasReviewed ? 'Edit Review' : 'Write Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Reviews List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text>Loading reviews...</Text>
        </View>
      ) : reviews.length > 0 ? (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 10 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <FontAwesome name="comments-o" size={70} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-700 mt-4">No reviews yet</Text>
          <Text className="text-gray-500 text-center mt-2">
            Be the first to review this seller
          </Text>
        </View>
      )}
      
      {/* Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end">
            <View className="bg-white p-5 rounded-t-3xl">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold">
                  {userHasReviewed ? 'Edit Your Review' : 'Write a Review'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <FontAwesome name="times" size={24} color="black" />
                </TouchableOpacity>
              </View>
              
              <Text className="font-bold mb-2">Rating</Text>
              <View className="flex-row mb-4 justify-center">
                {renderStars(rating)}
              </View>
              
              <Text className="font-bold mb-2">Your Review</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 min-h-[100px] mb-4"
                multiline
                placeholder="Share your experience with this seller..."
                value={reviewText}
                onChangeText={setReviewText}
              />
              
              <TouchableOpacity
                className="bg-blue-500 py-3 rounded-lg items-center"
                onPress={submitReview}
              >
                <Text className="text-white font-bold">
                  {userHasReviewed ? 'Update Review' : 'Submit Review'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
