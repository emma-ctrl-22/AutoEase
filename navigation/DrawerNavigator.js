import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Make sure this path is correct

import MainTabNavigator from './MainTabNavigator';
import PaymentMethod from '../screens/PaymentMethod';
import Settings from '../screens/Settings';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigation to login screen will be handled by AppNavigator
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.logoutContainer}>
        <DrawerItem
          label="Logout"
          onPress={handleLogout}
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )}
        />
      </View>
    </View>
  );
};

const DrawerNavigator = () => {
  const navigation = useNavigation();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="Home"
      screenOptions={{
        headerTitle: "AutoEase",
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            style={styles.avatarContainer}
          >
            <Avatar.Text size={30} label="EN" />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen name="Home" component={MainTabNavigator} />
      <Drawer.Screen name="PaymentMethods" component={PaymentMethod} />
      <Drawer.Screen name="Settings" component={Settings} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  logoutContainer: {
    marginBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

export default DrawerNavigator;