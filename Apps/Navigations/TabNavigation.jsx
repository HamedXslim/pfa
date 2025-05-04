import { View, Text } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import HomeScreenStackNav from './HomeScreenStackNav';
import ScreenStackNav from './ScreenStackNav';
import AddPostScreen from '../Screens/AddPostScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import ExploreScreen from '../Screens/ExploreScreen';
import ProfileStackNav from './ProfileStackNav';
const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="home-nav"
        component={HomeScreenStackNav}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color: color, fontSize: 12,maraginBottom:3 }}>Home</Text>
          ),
          tabBarIcon:({color,size})=>(
<Ionicons name="home-sharp" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen name="Explore" component={ScreenStackNav} options={{
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
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNav}  
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color: color, fontSize: 12, maraginBottom:3 }}>Profile</Text>
          ),
          tabBarIcon:({color,size})=>(
            <Ionicons name="person-circle" size={size} color={color} />
          ),
          unmountOnBlur: false // Ne pas réinitialiser la pile en quittant l'onglet
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            // Toujours naviguer vers l'écran principal du profil quand on appuie sur l'onglet
            navigation.navigate('Profile', { screen: 'profile-tab' });
          },
        })}
      />
    </Tab.Navigator>
  );
}