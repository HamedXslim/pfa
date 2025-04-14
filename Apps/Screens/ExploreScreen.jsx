import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore'
import LatestItemList from '../Components/HomeScreen/LatestItemList';
import { app } from '../../firebaseConfig';
import { ActivityIndicator } from 'react-native';

export default function ExploreScreen() {
  const db = getFirestore(app)
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts();
  }, []); // Ajout d'un tableau de dépendances vide

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'UserPost'), // Correction de 'userPost' à 'UserPost'
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const products = [];
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      
      setProductList(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="p-5 py-8">
      <Text className="text-[30px] font-bold">Explore More</Text>
      <LatestItemList latestItemList={productList}/>
    </View>
  )
}