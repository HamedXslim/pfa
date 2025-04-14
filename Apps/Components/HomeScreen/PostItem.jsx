import { View, Text,TouchableOpacity,Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import ProductDetail from '../../Screens/ProductDetail';
export default function PostItem({item}) {

    const navigation=useNavigation();
  return (
    <TouchableOpacity className="flex-1 m-2 border-[1px] border-slate-200 rounded-lg p-2" 
     onPress={()=>navigation.push('product-detail',
        {
            product:item
        }
     )}>
       
    <Image 
      source={{uri: item.image}}
      className="w-full h-[140px] rounded-lg "/>
    <View>
      <Text className="text-blue-500 bg-blue-200 p-1 rounded px-1 text-[10px] mt-1 text-center w-[70px] ">
        {item.category}
      </Text>
<Text className="text-[15px] font-bold mt-2">
{item.title}
</Text>
<Text className="text-[20px] font-bold text-blue-500">
{item.price} TND
</Text>
    </View>
    
  </TouchableOpacity>
  )
}