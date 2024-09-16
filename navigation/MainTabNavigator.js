import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import HomeScreen from '../screens/Home';
import ServicesScreen from '../screens/Services';
import BookingsScreen from '../screens/Bookings';
import Settings from '../screens/Settings';
import { Entypo,AntDesign } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{
      tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle: {
    height: '10%',
    elevation: 0.1,
    backgroundColor: '#000',
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
  },
  tabBarActiveTintColor:"white"
    }}>
      <Tab.Screen name="OnBoard" component={HomeScreen} options={{headerShown:false,tabBarIcon: ({ color, size }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
             <Entypo name="home" size={24} color="white" />
            </View>
          )}} />
      <Tab.Screen name="Services" component={ServicesScreen} options={{headerShown:false,tabBarIcon: ({ color, size }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
             <Entypo name="compass" size={24} color="white" />
            </View>
          )}}  />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{headerShown:false,tabBarIcon: ({ color, size }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
             <Entypo name="bookmark" size={24} color="white" />
            </View>
          )}}  />
      <Tab.Screen name="Profile" component={Settings} options={{headerShown:false,tabBarIcon: ({ color, size }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
             <AntDesign name="setting" size={24} color="white" />
            </View>
          )}}  />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
