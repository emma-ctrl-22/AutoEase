// Home.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust the import path based on your project structure

export default function Home({ navigation }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("carRental");

  useEffect(() => {
    const servicesRef = collection(db, "services");
    let q;
    if (selectedTab === "carRental") {
      q = query(servicesRef, where("businessType", "==", "carRental"));
    } else {
      q = query(servicesRef, where("businessType", "==", "carWash"));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const servicesData = [];
        snapshot.forEach((doc) => {
          servicesData.push({ id: doc.id, ...doc.data() });
        });
        setServices(servicesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching services: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedTab]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.InputGroup}>
        <TextInput placeholder="Search here" style={styles.input} />
        <FontAwesome name="search" size={24} color="black" style={styles.searchIcon} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabItem, selectedTab === "carRental" && styles.selectedTab]}
          onPress={() => {
            setSelectedTab("carRental");
            setLoading(true);
          }}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "carRental" && styles.selectedTabText,
            ]}
          >
            Car Rentals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, selectedTab === "carWash" && styles.selectedTab]}
          onPress={() => {
            setSelectedTab("carWash");
            setLoading(true);
          }}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "carWash" && styles.selectedTabText,
            ]}
          >
            Car Wash
          </Text>
        </TouchableOpacity>
      </View>

      {/* Service List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : services.length === 0 ? (
        <Text style={styles.noServicesText}>No services available.</Text>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate("VehicleDetail", { service: item })}
            >
              <View style={styles.serviceItem}>
                <Image source={{ uri: item.imageUrl }} style={styles.serviceImage} />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{item.serviceName}</Text>
                  {selectedTab === "carRental" && (
                    <Text style={styles.serviceTransmission}>{item.transmission}</Text>
                  )}
                  <Text style={styles.servicePrice}>${item.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          style={styles.serviceList}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#f5f5f5",
  },
  InputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    elevation: 2, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.1, // For iOS shadow
    shadowRadius: 5, // For iOS shadow
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
  },
  selectedTab: {
    backgroundColor: "#1C3530",
  },
  tabText: {
    fontSize: 16,
    color: "#000",
  },
  selectedTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  serviceItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    elevation: 2, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.1, // For iOS shadow
    shadowRadius: 5, // For iOS shadow
  },
  serviceImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  serviceInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  serviceTransmission: {
    fontSize: 16,
    color: "#777",
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  noServicesText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#777",
  },
});
