// ServiceDetails.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the import path based on your project structure

export default function ServiceDetails({ route }) {
  const { business } = route.params;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRef = collection(db, 'services');
        const q = query(servicesRef, where('businessId', '==', business.id));
        const querySnapshot = await getDocs(q);
        const servicesData = [];
        querySnapshot.forEach((doc) => {
          servicesData.push({ id: doc.id, ...doc.data() });
        });
        setServices(servicesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services: ', error);
        setLoading(false);
      }
    };

    fetchServices();
  }, [business.id]);

  return (
    <View style={styles.container}>
      {/* Business Details */}
      <Image
        source={
          business.imageUrl
            ? { uri: business.imageUrl }
            : require('../assets/car2.png')
        }
        style={styles.businessImage}
      />
      <Text style={styles.businessName}>{business.businessName}</Text>
      <Text style={styles.businessType}>{business.businessType}</Text>
      <Text style={styles.businessLocation}>{business.location}</Text>
      {business.about && <Text style={styles.businessAbout}>{business.about}</Text>}

      <Text style={styles.sectionTitle}>Services</Text>

      {/* Services List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : services.length === 0 ? (
        <Text style={styles.noServicesText}>No services available for this business.</Text>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.serviceItem}>
              <Image
                source={
                  item.imageUrl
                    ? { uri: item.imageUrl }
                    : require('../assets/car2.png')
                }
                style={styles.serviceImage}
              />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.serviceName}</Text>
                <Text style={styles.servicePrice}>${item.price}</Text>
                {item.businessType === 'carRental' && item.transmission && (
                  <Text style={styles.serviceTransmission}>{item.transmission}</Text>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  businessImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  businessType: {
    fontSize: 18,
    color: '#777',
    marginBottom: 5,
  },
  businessLocation: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  businessAbout: {
    fontSize: 16,
    color: '#555',
    textAlign: 'justify',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    padding: 10,
  },
  serviceImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  serviceInfo: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  serviceTransmission: {
    fontSize: 16,
    color: '#777',
  },
  noServicesText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#777',
    marginTop: 20,
  },
});
