import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../firebase.native.js';
import { useUser } from '@clerk/clerk-expo';

export default function EditPostScreen({ route, navigation }) {
  // Get post data from route params
  const { product } = route.params || { product: {} };
  const { user } = useUser();

  // Add back button to header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Retour</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // State for form fields
  const [title, setTitle] = useState(product.title || '');
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(product.price ? product.price.toString() : '');
  const [category, setCategory] = useState(product.category || 'Autres');
  const [location, setLocation] = useState(product.address || '');
  const [images, setImages] = useState([product.image].filter(Boolean) || []);
  const [phoneNumber, setPhoneNumber] = useState(product.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [subcategoryDetails, setSubcategoryDetails] = useState(product.subcategoryDetails || {});
  const [socialMedia, setSocialMedia] = useState(product.socialMedia || { facebook: '', instagram: '', twitter: '' });

  // Categories list
  const categories = [
    'Électronique', 'Vêtements', 'Maison', 'Jardinage', 
    'Automobile', 'Immobilier', 'Services', 'Autres'
  ];

  // Function to pick images
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Function to remove an image
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Function to handle subcategory details update
  const updateSubcategoryDetails = (key, value) => {
    setSubcategoryDetails(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Function to handle social media update
  const updateSocialMedia = (platform, value) => {
    setSocialMedia(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!title || !description || !price || !category || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    setLoading(true);

    try {
      const db = firebase.firestore();
      const postRef = db.collection('UserPost').doc(product.id);
      
      // Get the current post data to compare prices
      const currentPostDoc = await postRef.get();
      const currentPostData = currentPostDoc.data();
      const oldPrice = parseFloat(currentPostData.price);
      const newPrice = parseFloat(price);
      
      // Update the post
      await postRef.update({
        title,
        description,
        price,
        category,
        address: location,
        image: images[0], // Use the first image as the main image
        phoneNumber,
        subcategoryDetails,
        socialMedia,
        updatedAt: new Date().toISOString()
      });
      
      // If price has changed, check for price alerts
      if (oldPrice !== newPrice) {
        // Get all price alerts for this post
        const alertsSnapshot = await db.collection('PriceAlerts')
          .where('postId', '==', product.id)
          .get();
        
        // Process each alert
        const notificationPromises = [];
        
        alertsSnapshot.forEach(doc => {
          const alert = doc.data();
          
          // Update the current price in the alert
          notificationPromises.push(
            db.collection('PriceAlerts').doc(doc.id).update({
              currentPrice: newPrice,
              updatedAt: new Date().toISOString()
            })
          );
          
          // If price dropped to or below target price, create notification
          if (newPrice <= alert.targetPrice && oldPrice > alert.targetPrice) {
            // Only send notification if the alert was created by a different user (not the post owner)
            if (alert.userEmail !== user.primaryEmailAddress.emailAddress) {
              console.log(`Sending notification to ${alert.userEmail} for price drop`);
              notificationPromises.push(
                db.collection('Notifications').add({
                  userEmail: alert.userEmail,
                  postId: product.id,
                  message: `Price alert: ${title} is now ${newPrice} TND (your target: ${alert.targetPrice} TND)`,
                  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                  read: false,
                  type: 'price_alert'
                })
              );
            } else {
              console.log('Skipping notification for post owner');
            }
          }
        });
        
        // Wait for all notifications to be created
        await Promise.all(notificationPromises);
      }
      
      setLoading(false);
      Alert.alert(
        'Success', 
        'Post updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      setLoading(false);
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post');
    }
  };

  // Render subcategory details form based on category
  const renderSubcategoryFields = () => {
    switch(category) {
      case 'Car':
        return (
          <View style={styles.subcategoryContainer}>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
            
            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              value={subcategoryDetails.brand || ''}
              onChangeText={(value) => updateSubcategoryDetails('brand', value)}
              placeholder="Enter brand"
            />
            
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              value={subcategoryDetails.model || ''}
              onChangeText={(value) => updateSubcategoryDetails('model', value)}
              placeholder="Enter model"
            />
            
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={styles.input}
              value={subcategoryDetails.year || ''}
              onChangeText={(value) => updateSubcategoryDetails('year', value)}
              placeholder="Enter year"
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Mileage</Text>
            <TextInput
              style={styles.input}
              value={subcategoryDetails.mileage || ''}
              onChangeText={(value) => updateSubcategoryDetails('mileage', value)}
              placeholder="Enter mileage"
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={subcategoryDetails.color || ''}
              onChangeText={(value) => updateSubcategoryDetails('color', value)}
              placeholder="Enter color"
            />
            
            <Text style={styles.label}>Fuel Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={subcategoryDetails.fuelType || 'Gasoline'}
                onValueChange={(value) => updateSubcategoryDetails('fuelType', value)}
                style={styles.picker}
              >
                <Picker.Item label="Gasoline" value="Gasoline" />
                <Picker.Item label="Diesel" value="Diesel" />
                <Picker.Item label="Electric" value="Electric" />
                <Picker.Item label="Hybrid" value="Hybrid" />
              </Picker>
            </View>
            
            <Text style={styles.label}>Transmission</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={subcategoryDetails.transmission || 'Manual'}
                onValueChange={(value) => updateSubcategoryDetails('transmission', value)}
                style={styles.picker}
              >
                <Picker.Item label="Manual" value="Manual" />
                <Picker.Item label="Automatic" value="Automatic" />
              </Picker>
            </View>
          </View>
        );
        
      case 'Electronics':
        return (
          <View style={styles.subcategoryContainer}>
            <Text style={styles.sectionTitle}>Electronics Details</Text>
            
            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={subcategoryDetails.type || 'Smartphone'}
                onValueChange={(value) => updateSubcategoryDetails('type', value)}
                style={styles.picker}
              >
                <Picker.Item label="Smartphone" value="Smartphone" />
                <Picker.Item label="Laptop" value="Laptop" />
                <Picker.Item label="Tablet" value="Tablet" />
                <Picker.Item label="TV" value="TV" />
                <Picker.Item label="Camera" value="Camera" />
                <Picker.Item label="Audio" value="Audio" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
            
            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              value={subcategoryDetails.brand || ''}
              onChangeText={(value) => updateSubcategoryDetails('brand', value)}
              placeholder="Enter brand"
            />
            
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              value={subcategoryDetails.model || ''}
              onChangeText={(value) => updateSubcategoryDetails('model', value)}
              placeholder="Enter model"
            />
            
            <Text style={styles.label}>Condition</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={subcategoryDetails.condition || 'New'}
                onValueChange={(value) => updateSubcategoryDetails('condition', value)}
                style={styles.picker}
              >
                <Picker.Item label="New" value="New" />
                <Picker.Item label="Like New" value="Like New" />
                <Picker.Item label="Good" value="Good" />
                <Picker.Item label="Fair" value="Fair" />
                <Picker.Item label="Poor" value="Poor" />
              </Picker>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Price (TND)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            {categories.map((cat, index) => (
              <Picker.Item key={index} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
        />

        {/* Render category-specific fields */}
        {renderSubcategoryFields()}

        <Text style={styles.sectionTitle}>Social Media</Text>
        <Text style={styles.label}>Facebook</Text>
        <TextInput
          style={styles.input}
          value={socialMedia.facebook}
          onChangeText={(value) => updateSocialMedia('facebook', value)}
          placeholder="Enter Facebook profile or page"
        />
        
        <Text style={styles.label}>Instagram</Text>
        <TextInput
          style={styles.input}
          value={socialMedia.instagram}
          onChangeText={(value) => updateSocialMedia('instagram', value)}
          placeholder="Enter Instagram handle"
        />
        
        <Text style={styles.label}>Twitter</Text>
        <TextInput
          style={styles.input}
          value={socialMedia.twitter}
          onChangeText={(value) => updateSocialMedia('twitter', value)}
          placeholder="Enter Twitter handle"
        />

        <Text style={styles.sectionTitle}>Images</Text>
        <View style={styles.imagesContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
            <Text style={styles.addImageButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Updating...' : 'Update Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    color: '#3b82f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },
  subcategoryContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
    margin: 4,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'red',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 4,
  },
  addImageButtonText: {
    fontSize: 30,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
