import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Image, ToastAndroid, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { app } from '../../firebaseConfig';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import { Formik } from 'formik';
import { useUser } from '@clerk/clerk-expo';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { addDoc } from 'firebase/firestore';
import {getDownloadURL, getStorage,ref,uploadBytes} from "firebase/storage"
export default function AddPostScreen() {
  const [image, setImage] = useState(null);
  const db = getFirestore(app);
  const storage = getStorage();
  const{user}=useUser();
  const [categoryList, setCategoryList] = useState([]);
 const [loading,setLoading]=useState(false);

  useEffect(() => {
    getCategoryList();
  }, []);
  
  const getCategoryList = async () => {
    setCategoryList([]);
    const querySnapshot = await getDocs(collection(db, 'Category'));
    querySnapshot.forEach((doc) => {
      console.log("Docs:", doc.data());
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

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  const onSubmitMethod = async (value) => {
    setLoading(true);
    try {
      // Vérifier si une image a été sélectionnée
      if (!image) {
        console.log('Aucune image sélectionnée');
        alert('Veuillez sélectionner une image avant de soumettre.');
        return;
      }
  
      // Convertir l'URI en Blob
      console.log('Conversion de l\'image en blob...');
      const resp = await fetch(image);
      const blob = await resp.blob();
      const storageRef = ref(storage, 'communityPost/' + Date.now() + ".jpg");
  
      // Uploader l'image dans Firebase Storage
      console.log('Upload de l\'image dans Firebase Storage...');
      const snapshot = await uploadBytes(storageRef, blob);
      console.log('Uploaded a blob or file!');
  
      // Récupérer l'URL de téléchargement
      console.log('Récupération de l\'URL de téléchargement...');
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('URL de l\'image:', downloadUrl);
  
      // Ajouter l'URL de l'image et les infos de l'utilisateur aux valeurs
      value.image = downloadUrl;
      value.userName = user.fullName;
      value.userEmail = user.primaryEmailAddress.emailAddress; // Corrigé de primaryEmailAdress.emailAdress
      value.userImage = user.imageUrl;
  
      // Ajouter le document dans Firestore
      console.log('Ajout du document dans Firestore...');
      const docRef = await addDoc(collection(db, "UserPost"), value);
      if (docRef.id) {
        setLoading(false);
      Alert.alert('Sucess!!!','Post added successfully! ')
      } else {
        console.log("Échec de l'ajout du document : docRef.id est vide");
      }
    } catch (error) {
      console.error('Erreur dans onSubmitMethod:', error.message);
      if (error.code === 'permission-denied') {
        console.log('Erreur : Permissions Firestore insuffisantes. Vérifiez vos règles Firestore.');
      }
    }
  };
  return (
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 27, fontWeight: 'bold', marginBottom: 12 }}>Add New Post</Text>
      <Text style={{ fontSize: 16, color: 'gray', marginBottom: 28 }}>Create New post and start selling</Text>
      
      <Formik 
        initialValues={{ name: '', desc: '', category: '', address: '', price: '', image: '',userName:'',userEmail:'',userImage:'' }}
        onSubmit={value=>onSubmitMethod(value) }
        validate={(values)=>{
          const errors={}
          if(!values.title)
          {
              console.log("Title not present");
              errors.name="Title Must be there"
          }
          return errors
        }}  
      >
        {({ handleChange, handleBlur, handleSubmit, values, setFieldValue ,errors}) => (
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
              value={values?.title}
              onChangeText={handleChange('title')}
            />
            
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder='Description'
              value={values?.desc}
              multiline
              onChangeText={handleChange('description')}
            />
            
            <TextInput
              style={styles.input}
              placeholder='Price'
              value={values?.price}
              keyboardType='number-pad'
              onChangeText={handleChange('price')}
            />
            
            <TextInput
              style={styles.input}
              placeholder='Address'
              value={values?.address}
              onChangeText={handleChange('address')}
            />
            
            <View style={{ borderWidth: 1, borderRadius: 10, marginTop: 15 }}>
              <Picker
                selectedValue={values?.category}
                onValueChange={itemValue => setFieldValue('category', itemValue)}
              >
                <Picker.Item label="Sélectionner une catégorie" value="" />
                {categoryList && categoryList.map((item, index) => (
                  <Picker.Item key={index} label={item?.name} value={item?.name} />
                ))}
              </Picker>
            </View>
            
            <TouchableOpacity 
  onPress={handleSubmit} 
  style={{ 
    padding: 20, 
    backgroundColor: loading ? '#ccc' : '#007BFF', // Corrigé et simplifié
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
    </View>
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