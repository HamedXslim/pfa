import { View, Text, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import Slider from '../Components/HomeScreen/Slider'
import { collection } from 'firebase/firestore'
import { getDocs } from 'firebase/firestore'
import { app, db, auth, storage } from '../../firebase';
import { getFirestore } from 'firebase/firestore'
import Header from '../Components/HomeScreen/Header'
import Categories from '../Components/HomeScreen/Categories'
import LatestItemList from '../Components/HomeScreen/LatestItemList'

export default function HomeScreen() {
  // db is now imported directly from firebase.js
  const[categoryList,setCategoryList]=useState([]);
  const [sliderList,setSliderList]=useState([]);
  const [latestItemList,setLatestItemList]=useState([]);
  useEffect(()=>{
      getSliders();
      getCategoryList();
      getLatestItemList();
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
    const getCategoryList = async () => {
      setCategoryList([]);
      const querySnapshot = await getDocs(collection(db, 'Category'));
      querySnapshot.forEach((doc) => {
        console.log("Docs:", doc.data());
        setCategoryList(categoryList => [...categoryList, doc.data()]);
      });
    };

    /**
     * Récupère les derniers produits ajoutés
     */
    const getLatestItemList = async () => {
      setLatestItemList([]);
      try {
        const querySnapShot = await getDocs(collection(db, 'UserPost'));
        querySnapShot.forEach((doc) => {
          console.log("Docs", doc.data());
          setLatestItemList(latestItemList => [...latestItemList, { id: doc.id, ...doc.data() }]);
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        // Continuer quand même pour ne pas bloquer l'interface
        setTimeout(() => {
          getLatestItemList();
        }, 2000); // Réessayer après 2 secondes
      }
    }
  return (
    <SafeAreaView className="py-8 px-6 bg-white flex-1">
      <Header/>
      {/* Slider */}
      <Slider sliderList={sliderList}/>
     {/* Category List */}
     <Categories categoryList={categoryList} />
     {/* Latest Item List */}
     <LatestItemList latestItemList={latestItemList}
     heading={'Latest items'} />
    </SafeAreaView>
  )
}