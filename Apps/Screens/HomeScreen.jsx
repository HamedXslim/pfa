import { View, Text, SafeAreaView, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Slider from '../Components/Slider';
import { collection, getDocs } from 'firebase/firestore';
import { app, db, auth, storage } from '../../firebase';
import Header from '../Components/Header';
import Categories from '../Components/Categories';
import PostItem from '../Components/PostItem';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 5,
  },
  noItemsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});

export default function HomeScreen() {
  const [categoryList, setCategoryList] = useState([]);
  const [sliderList, setSliderList] = useState([]);
  const [latestItemList, setLatestItemList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getSliders(),
          getCategoryList(),
          getLatestItemList(),
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Used to Get Sliders for Home Screen
   */
  const getSliders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Sliders'));
      const sliders = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.image) {
          sliders.push(data);
        }
      });
      console.log('Sliders fetched:', sliders); // Debug log
      setSliderList(sliders);
    } catch (error) {
      console.error('Error fetching sliders:', error);
    }
  };

  /**
   * Used to Get Category List for Home Screen
   */
  const getCategoryList = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Category'));
      const categories = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name && data.icon) {
          categories.push(data);
        }
      });
      console.log('Categories fetched:', categories); // Debug log
      setCategoryList(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  /**
   * Récupère les derniers produits ajoutés
   */
  const getLatestItemList = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'UserPost'));
      const items = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.title && data.image) {
          items.push({ id: doc.id, ...data });
        }
      });
      console.log('Latest items fetched:', items); // Debug log
      setLatestItemList(items);
    } catch (error) {
      console.error('Error fetching latest items:', error);
      // Retry after 2 seconds if error occurs
      setTimeout(() => {
        getLatestItemList();
      }, 2000);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  // Function to render latest items
  const renderLatestItems = () => {
    // Ensure latestItemList is an array and filter out invalid items
    const validItemList = Array.isArray(latestItemList)
      ? latestItemList.filter(item => item && typeof item === 'object' && item.id && item.image && typeof item.image === 'string')
      : [];

    console.log('LatestItemList validItemList:', validItemList);

    if (validItemList.length === 0) {
      return (
        <View style={styles.container}>
          <Text style={styles.noItemsText}>
            Aucun article disponible pour le moment
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Derniers articles</Text>
        <FlatList
          data={validItemList}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostItem post={item} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="py-8 px-6 bg-white flex-1">
      <Header />
      {/* Slider */}
      <Slider sliderList={sliderList} />
      {/* Category List */}
      <Categories categoryList={categoryList} />
      {/* Latest Item List */}
      {renderLatestItems()}
    </SafeAreaView>
  );
}