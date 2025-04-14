import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import React from 'react'
import PostItem from './PostItem'
export default function LatestItemList({latestItemList,heading}) {
  // Vérification des données
  if (!latestItemList || latestItemList.length === 0) {
    return (
      <View className="mt-3">
        <Text className="font-bold text-[20px]">{heading}</Text>
        <Text className="text-gray-500 mt-2">No items available</Text>
      </View>
    )
  }

  return (
    <View className="mt-3">
      <Text className="font-bold text-[20px] mb-2">Latest Items</Text>
      <FlatList 
        data={latestItemList}
        numColumns={2}
        renderItem={({item}) => (
      <PostItem item={item}/>
        )}
      />
    </View>
  )
}