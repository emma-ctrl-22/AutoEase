// Services.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Services() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const businessesRef = collection(db, 'businesses');
        const querySnapshot = await getDocs(businessesRef);
        const businessesData = [];
        querySnapshot.forEach((doc) => {
          businessesData.push({ id: doc.id, ...doc.data() });
        });
        setBusinesses(businessesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching businesses: ', error);
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleProviderPress = (business) => {
    navigation.navigate('ServiceDetail', { business });
  };

  // Updated filter function with defensive check
  const filteredBusinesses = businesses.filter((business) => {
    const name = business.businessName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.InputGroup}>
        <TextInput
          placeholder="Search business here"
          style={styles.input}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <FontAwesome name="search" size={24} color="black" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : filteredBusinesses.length === 0 ? (
        <Text style={styles.noBusinessesText}>No businesses found.</Text>
      ) : (
        <FlatList
          data={filteredBusinesses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleProviderPress(item)}
              style={styles.businessItem}
            >
              <Image
                source={
                  item.imageUrl
                    ? { uri: item.imageUrl }
                    : require('../assets/car2.png')
                }
                style={styles.businessImage}
              />
              <View style={styles.businessInfo}>
                <Text style={styles.businessName}>
                  {item.businessName || 'Unnamed Business'}
                </Text>
                <Text style={styles.businessType}>
                  {item.businessType || 'No Type Provided'}
                </Text>
                <Text style={styles.businessLocation}>
                  {item.location || 'No Location Provided'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          style={styles.businessList}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#f5f5f5',
  },
  InputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  businessList: {
    width: '100%',
  },
  businessItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    padding: 10,
  },
  businessImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  businessInfo: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: 'center',
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  businessType: {
    fontSize: 16,
    color: '#777',
    marginBottom: 5,
  },
  businessLocation: {
    fontSize: 16,
    color: '#777',
  },
  noBusinessesText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#777',
  },
});
