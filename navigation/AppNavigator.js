import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';
import ServiceDetail from '../screens/ServiceDetail';
import VehicleDetail from '../screens/VehicleDetail';
import Profile from '../screens/Profile';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import DrawerNavigatorAdmin from '../Admin/DrawerNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole ? (
          <>
            {userRole === 'customer' ? (
              <Stack.Screen name="Main" component={DrawerNavigator} />
            ) : (
              <Stack.Screen name="Admin" component={DrawerNavigatorAdmin} />
            )}
            <Stack.Screen name="ServiceDetail" component={ServiceDetail} />
            <Stack.Screen name="VehicleDetail" component={VehicleDetail} />
            <Stack.Screen name="Profile" component={Profile} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;