import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity } from 'react-native'; // Utilise TextInput de react-native
import React, { useEffect, useState } from 'react';
import { app } from '../../firebaseConfig';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import { Formik } from 'formik';
import { Picker } from '@react-native-picker/picker';
export default function AddPostScreen() {
  const db = getFirestore(app);
  const[categoryList,setCategoryList]=useState([])
  useEffect(()=>{
getCategoryList();
  },[])
  const getCategoryList=async()=>{
    setCategoryList([]);
const querySnapshot=await getDocs(collection(db,'Category'));
querySnapshot.forEach((doc)=>{
  console.log("Docs:",doc.data());
  setCategoryList(CategoryList=>[...CategoryList,doc.data()])
})
 }
  return (
    <View className="p-10">
      <Text className="text-[27px] font-bold mb-3">Add New Post</Text>
      <Text className="text-[16px] text-gray-500 mb-7">Create New post and start selling</Text>
   <Formik initialValues={{ name: '', desc: '', category: '', address: '' ,price:'', image:''}}
    onSubmit={(value)=>console.log(value)}
        >
         { ({handleChange,handleBlur,handleSubmit,values,setFieldValue})=>(
         <View>
         <TextInput
         style={styles.input}
         placeholder='Title'
         value={values?.title}
         onChangeText={handleChange('title')}
         />
         <TextInput
         style={styles.input}
         placeholder='Description'
         value={values?.desc}
         numberOfLines={5}
         onChangeText={handleChange('description')}
         />
          <TextInput
         style={styles.input}
         placeholder='Price'
         value={values?.price}
         keyboardType='number-pad'
         onChangeText={handleChange('price')}
         />  <TextInput
         style={styles.input}
         placeholder='Adress'
         value={values?.address}
        
         onChangeText={handleChange('adress')}
         />
        {/*Category List Dropdown*/}
        <View style={{borderWidth:1,borderRadius:10,marginTop:15}}>
        <Picker
        selectedValue={values?.category}
        className="border-2"
        onValueChange={itemValue=>setFieldValue('category',itemValue)}
        >{categoryList&&categoryList.map((item,index)=>(
          <Picker.Item key={index}
   label={item?.name} value={item?.name}/>
))}
        </Picker>
        </View>
        <TouchableOpacity onPress={handleSubmit} className="p-5 bg-blue-500 rounded-full">
          <Text className="text-white text-center text-[16px]">Submit</Text>
        </TouchableOpacity>
         {/* <Button onPress={handleSubmit}
          title="Submit"  
         className="mt-7"
         
         /> */}
         </View>
         )}
        </Formik>

   </View>
  )
}
const styles = StyleSheet.create({
  input:{
    borderWidth:1,
    borderRadius:10,
    padding:10,
    paddinggTop:15,
    marginTop:10,
    marginBottom:5,
    paddingHorizontal:17,
    textAlignVertical:'top',
    fontSize:17,
}
})