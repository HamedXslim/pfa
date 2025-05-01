import { View, ActivityIndicator, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app, db, auth, storage } from '../../firebase';
import { useRoute } from '@react-navigation/native';
import LatestItemList from '../Components/HomeScreen/LatestItemList';

export default function ItemList() {
    const { params } = useRoute();
    // db is now imported directly from firebase.js
    const [itemList, setItemList] = useState([]);
    const [loading,setLoading]=useState(false);
    useEffect(() => {
        params && getItemListByCategory();
    }, [params]);

    const getItemListByCategory = async () => {
        setItemList([]);
        setLoading(true);
        const q = query(
            collection(db, 'UserPost'),
            where('category', '==', params.category)
        );
        const querySnapshot = await getDocs(q);
        setLoading(false);
        querySnapshot.forEach(doc => {
            console.log(doc.data());
            setItemList(itemList => [...itemList, doc.data()]);
            setLoading(false);
        })
    }

    return (
        <View className="p-2">
            {loading?
            <ActivityIndicator className="mt-24" size={'large'} color={'#3b82f6'} />
:
            
            itemList.length > 0 ? (
                <LatestItemList latestItemList={itemList} heading={''} />
            ) : (
                <Text className="p-5 text-[20px] mt-24 justify-center text-center text-gray-400">
                    No post Found
                </Text>
            )}
        </View>
    );
}