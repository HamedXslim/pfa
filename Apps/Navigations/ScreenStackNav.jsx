import { View, Text } from 'react-native'
import React from 'react'
import ExploreScreen from '../Screens/ExploreScreen';
import { createStackNavigator } from '@react-navigation/stack'
import ProductDetail from '../Components/ProductDetail';
import ChatScreen from '../Screens/ChatScreen';
import ItemList from '../Components/ItemList';
import SearchResultsScreen from '../Screens/SearchResultsScreen';
const stack=createStackNavigator();
export default function ScreenStackNav() {

  return (
    <stack.Navigator>
    <stack.Screen name='explore-tab' component={ExploreScreen}
    options={
        {
            headerShown:false
        }
    }/>
    <stack.Screen name='product-detail' component={ProductDetail}
    options={{
        headerStyle: {backgroundColor: '#3b82f6'},
        headerTintColor: '#fff',
        headerTitle:'Detail'
     }}/>
    <stack.Screen
        name='ChatScreen'
        component={ChatScreen}
        options={{
            headerStyle: {backgroundColor: '#3b82f6'},
            headerTintColor: '#fff',
            headerTitle: 'Chat'
        }}
    />
    <stack.Screen
        name='item-list'
        component={ItemList}
        options={({ route }) => ({
            title: route.params.searchQuery ? `Search: ${route.params.searchQuery}` : route.params.category,
            headerStyle: {backgroundColor: '#3b82f6'},
            headerTintColor: '#fff',
        })}
    />
    <stack.Screen
        name='search-results'
        component={SearchResultsScreen}
        options={{
            headerStyle: {backgroundColor: '#3b82f6'},
            headerTintColor: '#fff',
        }}
    />
    </stack.Navigator>
  )
}