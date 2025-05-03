import { View, FlatList, Image } from 'react-native';
import React from 'react';

export default function Slider({ sliderList }) {
  // Filter out invalid items and ensure sliderList is an array
  const validSliderList = Array.isArray(sliderList) 
    ? sliderList.filter(item => item && typeof item === 'object' && item.image) 
    : [];

  return (
    <View className="mt-4">
      <FlatList
        data={validSliderList}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View>
            <Image
              source={{ uri: item.image || 'https://via.placeholder.com/150' }}
              className="h-[200px] w-[330px] mr-3 rounded-lg object-contain"
            />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}