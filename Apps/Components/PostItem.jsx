import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

export default function PostItem({ post }) {
  const navigation = useNavigation();

  // Validate post object
  if (!post || !post.image || !post.title) {
    return null; // Skip rendering if post is invalid
  }

  return (
    <TouchableOpacity
      className="flex-1 m-2 border-[1px] border-slate-200 rounded-lg p-2"
      onPress={() =>
        navigation.push('product-detail', {
          product: post,
        })
      }
    >
      <Image
        source={{ uri: post.image || 'https://via.placeholder.com/150' }}
        className="w-full h-[140px] rounded-lg"
      />
      <View>
        <Text className="text-blue-500 bg-blue-200 p-1 rounded px-1 text-[10px] mt-1 text-center w-[70px]">
          {post.category || 'Unknown'}
        </Text>
        <Text className="text-[15px] font-bold mt-2">{post.title}</Text>
        <Text className="text-[20px] font-bold text-blue-500">
          {post.price ? `${post.price} TND` : 'Price not available'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}