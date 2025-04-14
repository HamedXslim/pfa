import { View, Text } from 'react-native'
import React from 'react'
import ExploreScreen from '../Screens/ExploreScreen';
import { createStackNavigator } from '@react-navigation/stack'
import ProductDetail from '../Screens/ProductDetail';
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
    </stack.Navigator>
  )
}