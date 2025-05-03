import { View, Text } from 'react-native';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../Screens/ProfileScreen';
import MyProducts from '../Components/MyProducts';
import ChatScreen from '../Screens/ChatScreen';
import UserChats from '../Components/UserChats';
import FavoritesScreen from '../Screens/FavoritesScreen';
import RecentlyViewedScreen from '../Screens/RecentlyViewedScreen';
import CompareProductsScreen from '../Screens/CompareProductsScreen';
import PriceAlertsScreen from '../Screens/PriceAlertsScreen';
import RecommendationsScreen from '../Screens/RecommendationsScreen';
import ReviewsScreen from '../Screens/ReviewsScreen';
import ProductDetail from '../Components/ProductDetail';
import NotificationsScreen from '../Screens/NotificationsScreen';
import EditPostScreen from '../Screens/EditPostScreen';

const Stack = createStackNavigator();

export default function ProfileStackNav() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="profile-tab"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyProducts"
        component={MyProducts}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Mes annonces'
        }}
      />
      <Stack.Screen
        name="FavoritesScreen"
        component={FavoritesScreen}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Mes favoris'
        }}
      />
      <Stack.Screen
        name="RecentlyViewedScreen"
        component={RecentlyViewedScreen}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Recently Viewed'
        }}
      />
      <Stack.Screen
        name="CompareProductsScreen"
        component={CompareProductsScreen}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Compare Products'
        }}
      />
      <Stack.Screen
        name="PriceAlertsScreen"
        component={PriceAlertsScreen}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Price Alerts'
        }}
      />
      <Stack.Screen
        name="RecommendationsScreen"
        component={RecommendationsScreen}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Recommendations'
        }}
      />
      <Stack.Screen
        name="ReviewsScreen"
        component={ReviewsScreen}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Reviews'
        }}
      />
      <Stack.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Notifications'
        }}
      />
      <Stack.Screen
        name="EditPostScreen"
        component={EditPostScreen}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Edit Post'
        }}
      />
      <Stack.Screen
        name="product-detail"
        component={ProductDetail}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Detail'
        }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Chat'
        }}
      />
      <Stack.Screen
        name="UserChats"
        component={UserChats}
        options={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitle: 'Mes Conversations'
        }}
      />
    </Stack.Navigator>
  );
}