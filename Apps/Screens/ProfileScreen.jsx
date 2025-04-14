import { View, Text, Image,FlatList,TouchableOpacity } from 'react-native';
import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import diary from './../../assets/images/diary.png'
import LogOut from './../../assets/images/LogOut.png'
import Search from './../../assets/images/Search.png'
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const { user } = useUser();
    const navigation=useNavigation();
    const {isLoaded,signOut}=useAuth();
const menuList=[
  
  {
    id:1,
    name:'My product',
    icon:diary,
    path:'my-product'
  },
  {
    id:2,
    name:'Explore',
    icon:Search,
    path:'explore'
  },
  {
    id:3,
    name:'LogOut',
    icon:LogOut
  }

]

const onMenuPress=(item)=>{
  if(item.name=='LogOut')
  {
    signOut();
    return ;
  }
item?.path?navigation.navigate(item.path):null;
}
    return (
        <View className="p-5 bg-white flex-1">
            <View className="items-center mt-14">
                <Image 
                    source={{ uri: user?.imageUrl }}
                    className="w-[100px] h-[100px] rounded-full"
                />
                <Text className="font-bold text-[25px] mt-2">
                    {user?.fullName}
                </Text>
                <Text className="text-[18px] mt-2 text-gray-500">
                    {user?.primaryEmailAddress?.emailAddress}
                </Text>
            </View>
            <FlatList
  data={menuList}
  numColumns={3}
  style={{marginTop:20}}
  renderItem={({item, index}) => (
    <TouchableOpacity 
    onPress={()=>onMenuPress(item)}
    className="flex-1 p-3 borde-[1px] 
    items-center
     m-4 rounded-lg border-blue-400
     bg-blue-50 mx-2 mt-4">
      {item?.icon && <Image source={item?.icon}
      className="w-[50px] h-[50px]"/>}
      <Text className="text-[12px] mt-2 text-blue-700 ">{item.name}</Text>
    </TouchableOpacity>
  )}
/>
        </View>
    );
  }