import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

export default function Categories({ categoryList }) {
  const navigation = useNavigation();

  // Ensure categoryList is an array and filter out invalid items
  const validCategoryList = Array.isArray(categoryList)
    ? categoryList.filter(item => item && typeof item === 'object' && item.name && item.icon && typeof item.icon === 'string')
    : [];

  console.log('Categories validCategoryList:', validCategoryList);

  return (
    <View className="mt-3">
      <Text className="font-bold text-[20px]">Categories</Text>
      {validCategoryList.length === 0 ? (
        <Text className="text-gray-500 text-center mt-2">No categories available</Text>
      ) : (
        <FlatList
          data={validCategoryList}
          numColumns={4}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('item-list', {
                  category: item.name,
                })
              }
              className="flex-1 items-center justify-center p-2 border-[1px] border-blue-200 m-1 h-[80px] rounded-lg bg-blue-50"
            >
              <View className="w-[40px] h-[40px] items-center justify-center bg-white rounded-full">
                <Image
                  source={{ uri: item.icon || 'https://via.placeholder.com/40' }}
                  className="w-[24px] h-[24px]"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-[12px] mt-1">{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => `category-${index}`}
        />
      )}
    </View>
  );
}