import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Pressable, Button, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Ensure Firebase imports
import Ionicons from '@expo/vector-icons/Ionicons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the user role from Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { role } = docSnap.data();
        if (role === 'customer') {
          // Navigate to the customer stack
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else if (role === 'businessOwner') {
          // Navigate to the business owner stack
          navigation.reset({
            index: 0,
            routes: [{ name: 'Admin' }],
          });
        }
      } else {
        console.log('No such document!');
        Alert.alert('Error', 'User data not found. Please contact support.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/car1.png')} style={styles.imageStyle} />
        <Text style={styles.logoText}>
          Welcome back kindly sign in to access {"\n"}your account.
        </Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Ionicons name="person" size={24} color="black" style={styles.sideIcon} />
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed-sharp" size={24} color="black" style={styles.sideIcon} />
          <TextInput
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
            placeholder="Password"
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.loginGroup}>
        <Text style={styles.resetPwd}>
          Click the link below to reset login credentials {"\n"} Forgot Password
        </Text>

        <TouchableOpacity style={styles.registerBtn} onPress={handleLogin}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Log In</Text>
        </TouchableOpacity>

        <Pressable onPress={()=>{navigation.navigate('Signup')}}>
          <Text style={styles.signTxt}>Don't have an account? Sign Up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center"
  },
  logoContainer: {
    width: "75%",
    height: "20%",
    display: "flex",
    flexDirection: "column",
    gap: "0.3%",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "5%"
  },
  logoText: {
    textAlign: 'center',
    width: "95%",
    color: "#6E6D7A",
    marginBottom: "2%"
  },
  formContainer: {
    width: "100%",
    height: "25%",
    marginTop: "2%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  inputGroup: {
    backgroundColor: "#ECECEC",
    width: "85%",
    height: "33%",
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
    width: "100%",
    height: "30%",
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
    width: "90%",
    marginBottom: 0,
    top: "70%",
    height: "30%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  resetPwd: {
    color: "#6E6D7A",
    textAlign: "center"
  },
  imageStyle: {
    width: 150,
    height: 150
  },
  signTxt: {
    color: "#6E6D7A",
    textAlign: "center"
  }
});

export default LoginScreen;
