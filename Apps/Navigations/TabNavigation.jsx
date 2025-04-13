import { View, Text } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Screens/HomeScreen';
import ExploreScreen from '../Screens/ExploreScreen';
import AddPostScreen from '../Screens/AddPostScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color: color, fontSize: 12,maraginBottom:3 }}>Home</Text>
          ),
          tabBarIcon:({color,size})=>(
<Ionicons name="home-sharp" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color: color, fontSize: 12,maraginBottom:3 }}>Explore</Text>
          ),
          tabBarIcon:({color,size})=>(
<Ionicons name="search-circle" size={size} color={color} />
          )
        }} />
      <Tab.Screen name="AddPost" component={AddPostScreen}  options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color: color, fontSize: 12,maraginBottom:3 }}>AddPost</Text>
          ),
          tabBarIcon:({color,size})=>(
<Ionicons name="add-circle" size={size} color={color} />
          )
        }}/>
      <Tab.Screen name="Profile" component={ProfileScreen}  options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color: color, fontSize: 12,maraginBottom:3 }}>Profile</Text>
          ),
          tabBarIcon:({color,size})=>(
<Ionicons name="person-circle" size={size} color={color} />
          )
        }}/>
    </Tab.Navigator>
  );
}