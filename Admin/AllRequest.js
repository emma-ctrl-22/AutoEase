import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import axios from 'axios';

export default function AllRequest({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'No user is logged in.');
          navigation.goBack();
          return;
        }

        const userId = user.uid;

        const servicesQuery = query(
          collection(db, 'services'),
          where('businessId', '==', userId)
        );
        const servicesSnapshot = await getDocs(servicesQuery);
        const servicesMap = {};
        servicesSnapshot.docs.forEach(serviceDoc => {
          servicesMap[serviceDoc.id] = serviceDoc.data();
        });

        const requestsQuery = query(
          collection(db, 'requests'),
          where('serviceId', 'in', Object.keys(servicesMap))
        );
        const requestsSnapshot = await getDocs(requestsQuery);

        const fetchedRequests = await Promise.all(requestsSnapshot.docs.map(async (requestDoc) => {
          const requestData = { id: requestDoc.id, ...requestDoc.data() };
          console.log(requestData, 'requestData');

          const userDocRef = doc(db, 'users', requestData.userId);
          const userDocSnapshot = await getDoc(userDocRef);
          const userData = userDocSnapshot.exists() ? userDocSnapshot.data() : null;

          return {
            ...requestData,
            service: servicesMap[requestData.serviceId],
            userFullName: userData ? userData.fullName : 'Unknown User',
            userPhoneNumber: userData ? userData.phone : 'Unknown Phone Number',
          };
        }));

        setRequests(fetchedRequests);
      } catch (error) {
        console.error("Error fetching data: ", error);
        Alert.alert('Error', 'Failed to fetch requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigation]);

  const sendSuccessLoginSms = async (phone, fullName) => {
    const endPoint = 'https://apps.mnotify.net/smsapi';
    const apiKey = 'TUX6IqmI8FGQEjY2isJROxxCP';
    const successLoginMessage = `Hello ${fullName}! You have successfully created your AutoEase account. Kindly, log in to enjoy all our services.`;
    const url = `${endPoint}?key=${apiKey}&to=${phone}&msg=${encodeURIComponent(successLoginMessage)}&sender_id=AutoEase`;

    try {
      const response = await axios.get(url); // Use GET request for mNotify API
      console.log('Success Login SMS Response:', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  const updateRequestStatus = async (id, status, userPhoneNumber, userFullName) => {
    try {
      const requestRef = doc(db, 'requests', id);
      await updateDoc(requestRef, {
        status: status,
        paid: false,
      });
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === id ? { ...req, status, paid: false } : req
        )
      );

      if (status === 'accepted') {
        // Send SMS only when request is accepted
        sendSuccessLoginSms(userPhoneNumber, userFullName);
      }

      Alert.alert(`Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}`, `You have ${status} request ${id}`);
    } catch (error) {
      console.error(`Error updating request: ${error}`);
      Alert.alert('Error', `Failed to update request ${id}. Please try again.`);
    }
  };

  const handleAccept = (id, userPhoneNumber, userFullName) => {
    updateRequestStatus(id, 'accepted', userPhoneNumber, userFullName);
  };

  const handleReject = (id) => {
    updateRequestStatus(id, 'rejected');
  };

  const renderItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Image source={{ uri: item?.service.imageUrl }} style={styles.serviceImage} />
      <View style={styles.requestInfo}>
        <Text style={styles.customerName}>{item.userFullName}</Text>
        <Text style={styles.serviceName}>{item.service.serviceName}</Text>
        <Text style={styles.servicePrice}>Price: {item.service.price}</Text>
      </View>
      <View style={styles.buttons}>
        {item.status === 'accepted' ? (
          item.paid ? (
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>Paid</Text>
            </View>
          ) : (
            <View style={styles.awaitingPayment}>
              <Text style={styles.awaitingPaymentText}>Awaiting Payment</Text>
            </View>
          )
        ) : (
          <>
            <TouchableOpacity
              onPress={() => handleAccept(item.id, item.userPhoneNumber, item.userFullName)}
              style={styles.button}
            >
              <Ionicons name="checkmark-circle" size={28} color="green" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleReject(item.id)}
              style={styles.button}
            >
              <Ionicons name="close-circle" size={28} color="red" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No requests available.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  requestInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceName: {
    fontSize: 16,
    color: '#555',
  },
  servicePrice: {
    fontSize: 14,
    color: '#888',
  },
  buttons: {
    flexDirection: 'row',
  },
  button: {
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paidBadge: {
    backgroundColor: 'green',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  paidText: {
    color: 'white',
    fontWeight: 'bold',
  },
  awaitingPayment: {
    backgroundColor: 'orange',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
  },
  awaitingPaymentText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
