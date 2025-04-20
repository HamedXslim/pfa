import { View, Text } from 'react-native'
import React from 'react'
import { app } from '../../firebaseConfig';
import ProductDetail from '../Screens/ProductDetail';
import ProfileScreen from '../Screens/ProfileScreen';
import MyProducts from '../Screens/MyProducts';
import ChatScreen from '../Screens/ChatScreen';
import UserChats from '../Screens/UserChats';
import { createStackNavigator } from '@react-navigation/stack';
const Stack=createStackNavigator();
export default function ProfileStackNav() {
  return (
   <Stack.Navigator>
<Stack.Screen name='profile-tab' component={ProfileScreen}
options={{
    headerShown:false
}} />
<Stack.Screen name='my-product' component={MyProducts}
  options={{
    headerStyle: {backgroundColor: '#3b82f6'},
    headerTintColor: '#fff',
    headerTitle:'My Products'
 }} />
 <Stack.Screen name='product-detail' component={ProductDetail}
     options={{
         headerStyle: {backgroundColor: '#3b82f6'},
         headerTintColor: '#fff',
         headerTitle:'Detail'
      }}/>
 <Stack.Screen
   name='ChatScreen'
   component={ChatScreen}
   options={{
     headerStyle: {backgroundColor: '#3b82f6'},
     headerTintColor: '#fff',
     headerTitle: 'Chat'
   }}
 />
 <Stack.Screen
   name='UserChats'
   component={UserChats}
   options={{
     headerStyle: {backgroundColor: '#3b82f6'},
     headerTintColor: '#fff',
     headerTitle: 'Mes Conversations'
   }}
 />
   </Stack.Navigator>
  )
}