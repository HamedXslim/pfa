// HomeScreenStackNav.js
import { View, Text } from 'react-native';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../Screens/HomeScreen';
import ProductDetail from '../Components/ProductDetail';
import ItemList from '../Components/ItemList';
import ChatScreen from '../Screens/ChatScreen';

const Stack = createStackNavigator();

export default function HomeScreenStackNav() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="item-list"
        component={ItemList}
        options={({ route }) => ({
          title: route.params.category,
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
        })}
      />
      <Stack.Screen
        name="product-detail"
        component={ProductDetail}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Detail',
        }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Chat',
        }}
      />
    </Stack.Navigator>
  );
}