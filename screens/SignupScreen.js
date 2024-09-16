import React, { useState } from 'react';
import {
  StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Pressable, Alert
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../firebaseConfig'; // Firebase imports
import Ionicons from '@expo/vector-icons/Ionicons';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios'; // Import axios for sending SMS

// Custom Tabs Component
const Tab = ({ selectedTab, onPress, title }) => (
  <TouchableOpacity
    style={[styles.tabButton, selectedTab === title && styles.activeTab]}
    onPress={() => onPress(title)}
  >
    <Text style={[styles.tabText, selectedTab === title && styles.activeTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const SignupScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('User');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(''); // New state for phone number
  
  // Business-specific state
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');

  const sendSuccessLoginSms = async (phone) => {
    const endPoint = 'https://apps.mnotify.net/smsapi';
    const apiKey = 'TUX6IqmI8FGQEjY2isJROxxCP';
    const successLoginMessage = `Hello ${fullName}! You have successfully created your AutoEase account. Kindly, Log in to enjoy all our services.`;
    const url = `${endPoint}?key=${apiKey}&to=${phone}&msg=${encodeURIComponent(successLoginMessage)}&sender_id=AutoEase`;

    try {
      const response = await axios.post(url);
      console.log('Success Login SMS Response:', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || (selectedTab === 'User' && !fullName) || !phone) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (selectedTab === 'User') {
        // Save user details in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          fullName: fullName,
          phone: phone, // Save phone number
          role: 'customer',
        });
      } else if (selectedTab === 'Business Owner') {
        if (!businessName || !businessType || !location) {
          Alert.alert('Error', 'Please fill all business fields.');
          return;
        }
        
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          fullName: businessName,
          phone: phone, // Save phone number
          role: 'businessOwner',
        });
        // Save business details in Firestore
        await setDoc(doc(db, 'businesses', user.uid), {
          email: user.email,
          businessName: businessName,
          businessType: businessType,
          location: location,
          role: 'businessOwner',
        });
      }

      // Send SMS after successful signup
      await sendSuccessLoginSms(phone);

      Alert.alert('Sign Up Successful', `Welcome, ${selectedTab}! Log in to start using AutoEase`);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/car1.png')} style={styles.imageStyle} />
        <Text style={styles.logoText}>
          Welcome! Please sign up to continue.
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <Tab selectedTab={selectedTab} onPress={setSelectedTab} title="User" />
        <Tab selectedTab={selectedTab} onPress={setSelectedTab} title="Business Owner" />
      </View>

      <View style={styles.formContainer}>
        {/* Render form based on selected tab */}
        {selectedTab === 'User' ? (
          <>
            <View style={styles.inputGroup}>
              <Ionicons name="person" size={24} color="black" style={styles.sideIcon} />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                placeholder="Full Name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Ionicons name="call" size={24} color="black" style={styles.sideIcon} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Ionicons name="mail" size={24} color="black" style={styles.sideIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-sharp" size={24} color="black" style={styles.sideIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholder="Password"
                secureTextEntry
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Ionicons name="business" size={24} color="black" style={styles.sideIcon} />
              <TextInput
                value={businessName}
                onChangeText={setBusinessName}
                style={styles.input}
                placeholder="Business Name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Ionicons name="phone" size={24} color="black" style={styles.sideIcon} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Ionicons name="mail" size={24} color="black" style={styles.sideIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-sharp" size={24} color="black" style={styles.sideIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholder="Password"
                secureTextEntry
              />
            </View>
            <View style={styles.inputGroup}>
              <Ionicons name="briefcase" size={24} color="black" style={styles.sideIcon} />
              <RNPickerSelect
                placeholder={{ label: 'Select Business Type', value: '' }}
                items={[
                  { label: 'Car Wash', value: 'Car Wash' },
                  { label: 'Rentals', value: 'Rentals' },
                  { label: 'Towing', value: 'Towing' }
                ]}
                style={pickerSelectStyles}
                onValueChange={(value) => setBusinessType(value)}
                value={businessType}
              />
            </View>
            <View style={styles.inputGroup}>
              <Ionicons name="location-sharp" size={24} color="black" style={styles.sideIcon} />
              <TextInput
                value={location}
                onChangeText={setLocation}
                style={styles.input}
                placeholder="Business Location"
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.loginGroup}>
        <TouchableOpacity style={styles.registerBtn} onPress={handleSignup}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Sign Up</Text>
        </TouchableOpacity>

        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signTxt}>Already have an account? Log In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

// Styles copied and adapted from LoginScreen
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center"
  },
  logoContainer: {
    width: "75%",
    height: "15%",
    display: "flex",
    flexDirection: "column",
    gap: "0.3%",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "5%",
  },
  logoText: {
    textAlign: 'center',
    width: "95%",
    color: "#000000",
    marginBottom: "2%"
  },
  
  imageStyle: {
    width: 150,
    height: '80%'
  },
  formContainer: {
    width: "100%",
    height: "50%",
    marginTop: "2%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  inputGroup: {
    backgroundColor: "#ECECEC",
    width: "85%",
    height: "15%",
    borderRadius: 5,
    display: "flex",
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between"
  },
  sideIcon: {
    marginLeft: "4%"
  },
  registerBtn: {
    width: "85%",
    height: "25%",
    backgroundColor: "#1C3530",
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  input: {
    width: "90%",
    height: "90%",
    borderRadius: 10,
    fontSize: 18,
    marginLeft: "2%"
  },
  loginGroup: {
    position: 'absolute',
    width: "100%",
    height: "35%",
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  signTxt: {
    color: "#000000",
    fontSize: 16
  },
  tabContainer: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  tabButton: {
    width: "48%",
    height: 50,
    borderRadius: 5,
    backgroundColor: "#F3F3F3",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  activeTab: {
    backgroundColor: "#1C3530",
  },
  tabText: {
    color: "#000",
    fontSize: 18
  },
  activeTabText: {
    color: "#fff",
  },
});

// Styles for RNPickerSelect
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is not cut off
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is not cut off
  },
});

export default SignupScreen;
