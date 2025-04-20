// AddPostScreen.js
import { View, ScrollView, Text, TextInput, StyleSheet, Button, TouchableOpacity, Image, ToastAndroid, ActivityIndicator, Alert, KeyboardAvoidingView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { app } from '../../firebaseConfig';
import { getFirestore, getDocs, collection, addDoc } from 'firebase/firestore';
import { Formik } from 'formik';
import { useUser } from '@clerk/clerk-expo';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

export default function AddPostScreen() {
  const [image, setImage] = useState(null);
  const db = getFirestore(app);
  const storage = getStorage();
  const { user } = useUser();
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = async () => {
    setCategoryList([]);
    const querySnapshot = await getDocs(collection(db, 'Category'));
    querySnapshot.forEach((doc) => {
      setCategoryList(categoryList => [...categoryList, doc.data()]);
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onSubmitMethod = async (value) => {
    setLoading(true);
    try {
      if (!image) {
        alert('Veuillez sélectionner une image avant de soumettre.');
        return;
      }

      const resp = await fetch(image);
      const blob = await resp.blob();
      const storageRef = ref(storage, 'communityPost/' + Date.now() + ".jpg");

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      value.image = downloadUrl;
      value.userName = user.fullName;
      value.userEmail = user.primaryEmailAddress.emailAddress;
      value.userImage = user.imageUrl;
      value.createdAt = new Date().toISOString();
      // Assurez-vous que socialMedia est un objet
      value.socialMedia = {
        instagram: value.instagram || "",
        facebook: value.facebook || "",
        twitter: value.twitter || ""
      };
      delete value.instagram; // Supprimer les champs temporaires
      delete value.facebook;
      delete value.twitter;

      const docRef = await addDoc(collection(db, "UserPost"), value);
      if (docRef.id) {
        setLoading(false);
        Alert.alert('Success!!!', 'Post added successfully!');
      }
    } catch (error) {
      console.error('Erreur dans onSubmitMethod:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView>
      <ScrollView style={{ padding: 40 }}>
        <Text style={{ fontSize: 27, fontWeight: 'bold', marginBottom: 12 }}>Add New Post</Text>
        <Text style={{ fontSize: 16, color: 'gray', marginBottom: 28 }}>Create New post and start selling</Text>

        <Formik
          initialValues={{
            title: '',
            description: '',
            category: '',
            address: '',
            price: '',
            phoneNumber: '',
            instagram: '',
            facebook: '',
            twitter: '',
            image: '',
            userName: '',
            userEmail: '',
            userImage: '',
            createdAt: new Date().toISOString()
          }}
          onSubmit={value => onSubmitMethod(value)}
          validate={(values) => {
            const errors = {};
            if (!values.title) {
              errors.title = "Title Must be there";
            }
            return errors;
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors }) => (
            <View>
              <TouchableOpacity onPress={pickImage}>
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{ width: 100, height: 100, borderRadius: 15 }}
                  />
                ) : (
                  <Image
                    source={require('./../../assets/images/placeholder.png')}
                    style={{ width: 100, height: 100, borderRadius: 15 }}
                  />
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder='Title'
                value={values.title}
                onChangeText={handleChange('title')}
              />

              <TextInput
                style={[styles.input, { height: 100 }]}
                placeholder='Description'
                value={values.description}
                multiline
                onChangeText={handleChange('description')}
              />

              <TextInput
                style={styles.input}
                placeholder='Price'
                value={values.price}
                keyboardType='number-pad'
                onChangeText={handleChange('price')}
              />

              <TextInput
                style={styles.input}
                placeholder='Address'
                value={values.address}
                onChangeText={handleChange('address')}
              />

              <TextInput
                style={styles.input}
                placeholder='Phone Number (e.g., +21612345678)'
                value={values.phoneNumber}
                keyboardType='phone-pad'
                onChangeText={handleChange('phoneNumber')}
              />

              <TextInput
                style={styles.input}
                placeholder='Instagram Profile URL'
                value={values.instagram}
                onChangeText={handleChange('instagram')}
              />

              <TextInput
                style={styles.input}
                placeholder='Facebook Profile URL'
                value={values.facebook}
                onChangeText={handleChange('facebook')}
              />

              <TextInput
                style={styles.input}
                placeholder='Twitter Profile URL'
                value={values.twitter}
                onChangeText={handleChange('twitter')}
              />

              <View style={{ borderWidth: 1, borderRadius: 10, marginTop: 15 }}>
                <Picker
                  selectedValue={values.category}
                  onValueChange={itemValue => setFieldValue('category', itemValue)}
                >
                  <Picker.Item label="Select Category" value="" />
                  {categoryList.map((item, index) => (
                    <Picker.Item key={index} label={item.name} value={item.name} />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                style={{
                  padding: 20,
                  backgroundColor: loading ? '#ccc' : '#007BFF',
                  borderRadius: 50,
                  marginTop: 20
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 17,
    fontSize: 17,
  }
});