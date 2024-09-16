// VehicleDetail.js
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { auth, db } from '../firebaseConfig'; // Adjust the import path based on your project structure
import { addDoc, collection } from 'firebase/firestore';

export default function VehicleDetail({ route, navigation }) {
  const { service } = route.params;

  const handleBookNow = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Not Logged In", "Please log in to book a service.");
      navigation.navigate("Login"); // Navigate to login screen if user is not logged in
      return;
    }

    try {
      const requestsRef = collection(db, "requests");
      await addDoc(requestsRef, {
        userId: user.uid,
        serviceId: service.id,
        status: "pending",
        createdAt: new Date(),
      });
      Alert.alert("Success", "Your booking request has been sent!");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding request: ", error);
      Alert.alert("Error", "Failed to send booking request. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: service.imageUrl }} style={styles.serviceImage} />
      <View style={styles.content}>
        <Text style={styles.serviceName}>{service.serviceName}</Text>
        {service.businessType === "carRental" && (
          <Text style={styles.serviceTransmission}>{service.transmission}</Text>
        )}
        <Text style={styles.servicePrice}>${service.price}</Text>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.serviceDescription}>{service.carDescription}</Text>

        {service.businessType === "carRental" && (
          <View style={styles.specContainer}>
            <View style={styles.specItem}>
              <FontAwesome name="users" size={24} color="#1C3530" />
              <Text style={styles.specText}>{service.seats} Seats</Text>
            </View>
            <View style={styles.specItem}>
              <FontAwesome name="tachometer" size={24} color="#1C3530" />
              <Text style={styles.specText}>{service.engineCapacity} cc</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleBookNow}>
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  serviceImage: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 20,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  serviceTransmission: {
    fontSize: 18,
    color: "#777",
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 22,
    color: "#000",
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  serviceDescription: {
    fontSize: 16,
    color: "#555",
    textAlign: "justify",
    marginBottom: 15,
  },
  specContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  specItem: {
    alignItems: "center",
  },
  specText: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#1C3530",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
