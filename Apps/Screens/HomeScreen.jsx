import { View, Text,Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Slider from '../Components/HomeScreen/Slider'
import { collection } from 'firebase/firestore'
import { getDocs } from 'firebase/firestore'
import { app } from '../../firebaseConfig'
import { getFirestore } from 'firebase/firestore'
import Header from '../Components/HomeScreen/Header'
export default function HomeScreen() {
  const db = getFirestore(app);
  const [sliderList,setSliderList]=useState([]);
  useEffect(()=>{
      getSliders();
  },[]);
  /**
   * Used to Get Sliders for Home Screen
   */
  const getSliders=async()=> {
    setSliderList([])
const querySnapshot=await getDocs(collection (db,"Sliders"));
querySnapshot.forEach((doc) => {
 
  setSliderList(sliderList=>[...sliderList,doc.data()]);
});
  }
  return (
    <View className="py-8 px-6 bg-white flex-1">
      <Header/>
      {/* Slider */}
      <Slider sliderList={sliderList}/>
    </View>
  )
}