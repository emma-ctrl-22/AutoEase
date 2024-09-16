import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db, auth, storage } from '../firebaseConfig'; 
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const AddService = ({ navigation }) => {
  const [businessType, setBusinessType] = useState('carWash');
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [carName, setCarName] = useState('');
  const [carDescription, setCarDescription] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setBusinessId(user.uid);
    } else {
      Alert.alert('Error', 'No user is logged in.');
      navigation.goBack();
    }
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Permission is needed to access your photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('ImagePicker Result:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddService = async () => {
    if (
      !serviceName ||
      !price ||
      !imageUri ||
      (businessType === 'carRental' && (!carName || !carDescription))
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      setUploading(true);

      // Upload image to Firebase Storage
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const imageRef = ref(
        storage,
        `serviceImages/${Date.now()}_${serviceName}.jpg`
      );

      await uploadBytes(imageRef, blob);

      // Get the download URL
      const downloadURL = await getDownloadURL(imageRef);

      // Prepare service data
      const serviceData = {
        businessType,
        serviceName,
        price,
        imageUrl: downloadURL,
        businessId,
      };

      if (businessType === 'carRental') {
        serviceData.carName = carName;
        serviceData.carDescription = carDescription;
      }

      // Add service to Firestore
      const servicesCollection = collection(db, 'services');
      await setDoc(doc(servicesCollection), serviceData);

      setUploading(false);
      Alert.alert('Success', 'Service added successfully!');

      // Reset the form fields
      setServiceName('');
      setPrice('');
      setCarName('');
      setCarDescription('');
      setImageUri(null);
      setBusinessType('carWash');

    } catch (error) {
      console.error('Error adding service:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to add service. Please try again.');
    }
  };

  // Define the tabs
  const tabs = [
    { label: 'Car Wash', value: 'carWash' },
    { label: 'Car Rental', value: 'carRental' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Service</Text>

      {/* Top Tabs for Business Type Selection */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[
              styles.tab,
              businessType === tab.value && styles.activeTab,
            ]}
            onPress={() => setBusinessType(tab.value)}
          >
            <Text
              style={[
                styles.tabLabel,
                businessType === tab.value && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Inputs for Service Details */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Service Name</Text>
        <TextInput
          style={styles.input}
          value={serviceName}
          onChangeText={setServiceName}
          placeholder="Enter service name"
        />
      </View>



      <View style={styles.inputGroup}>
        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
          keyboardType="numeric"
        />
      </View>

      {/* Additional Inputs for Car Rental */}
      {businessType === 'carRental' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Car Name</Text>
            <TextInput
              style={styles.input}
              value={carName}
              onChangeText={setCarName}
              placeholder="Enter car name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Car Description</Text>
            <TextInput
              style={styles.textArea}
              value={carDescription}
              onChangeText={setCarDescription}
              placeholder="Enter car description"
              multiline
              numberOfLines={4}
            />
          </View>
        </>
      )}

      {/* Image Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Service Image</Text>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerText}>Select Image</Text>
          </TouchableOpacity>
        )}
        {imageUri && (
          <TouchableOpacity style={styles.changeImage} onPress={pickImage}>
            <Text style={styles.changeImageText}>Change Image</Text>
          </TouchableOpacity>
        )}
      </View>

      {uploading ? (
        <ActivityIndicator size="large" color="#1C3530" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleAddService}>
          <Text style={styles.buttonText}>Add Service</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ... [Styles remain unchanged, or add new styles as needed below]
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 5,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#eee',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  activeTab: {
    backgroundColor: '#1C3530',
    borderColor: '#1C3530',
  },
  tabLabel: {
    fontSize: 16,
    color: '#000',
  },
  activeTabLabel: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#1C3530',
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F8F8F8',
  },
  textArea: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F8F8F8',
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#1C3530',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePicker: {
    height: 200,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  imagePickerText: {
    color: '#888',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  changeImage: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  changeImageText: {
    color: '#1C3530',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default AddService;
