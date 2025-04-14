import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore'
import { useUser } from '@clerk/clerk-expo'

import LatestItemList from '../Components/HomeScreen/LatestItemList'
import { app } from '../../firebaseConfig'
import { useNavigation } from '@react-navigation/native'
export default function MyProducts() {
    const db=getFirestore(app)
    const{user}=useUser();
    const navigation=useNavigation();
    const [productList, setProductList] = useState([]);
    useEffect(()=>{
        user&&getUserPost()
    },[user])
    useEffect(()=>{
navigation.addListener('focus',(e)=>{
  
  getUserPost();
})
    },[navigation])
    /**
     * Used to get User Post only
     */
    const getUserPost=async()=>{
        setProductList([]);
        const q= query(collection(db,'UserPost'),where('userEmail','==',user?.primaryEmailAddress?.emailAddress));
        const snapshot=await getDocs(q);
        snapshot.forEach(doc=>{
            setProductList(productList=>[...productList,doc.data()]);
        })
    }
    return (
        <View>
            <LatestItemList latestItemList={productList}
            
            />
        </View>
    )
}