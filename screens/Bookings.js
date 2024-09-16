import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { auth, db } from '../firebaseConfig'; // Adjust the path as necessary
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'; // Icons for payment methods

export default function Bookings() {
  const [userId, setUserId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null); // For the booking to be paid
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state

  // Listen for authentication state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchBookings = async () => {
        if (!userId) return;
        setLoading(true); // Start loading

        try {
          // Fetch requests where userId matches the logged-in user
          const requestsRef = collection(db, 'requests');
          const q = query(requestsRef, where('userId', '==', userId));
          const querySnapshot = await getDocs(q);

          const bookingsData = [];

          for (const docSnap of querySnapshot.docs) {
            const requestData = docSnap.data();

            // Fetch service details using serviceId
            const serviceRef = doc(db, 'services', requestData.serviceId);
            const serviceSnap = await getDoc(serviceRef);

            if (serviceSnap.exists()) {
              const serviceData = serviceSnap.data();

              bookingsData.push({
                id: docSnap.id,
                requestId: docSnap.id,
                serviceId: requestData.serviceId,
                status: requestData.status,
                paid: requestData.paid || false, // Add the paid field
                serviceName: serviceData.serviceName,
                serviceType: serviceData.serviceType,
                price: serviceData.price,
              });
            } else {
              console.log('No such service!');
            }
          }

          setBookings(bookingsData);
        } catch (error) {
          console.error('Error fetching bookings: ', error);
        } finally {
          setLoading(false); // Stop loading
        }
      };

      fetchBookings();
    }, [userId]) // Dependency array includes userId
  );

  const handleMakePayment = (booking) => {
    setSelectedBooking(booking); // Set the selected booking for payment
    setIsModalVisible(true); // Show the modal
  };

  const handlePayment = async (method) => {
    // Update Firestore to mark the booking as paid
    if (!selectedBooking) return;

    const requestRef = doc(db, 'requests', selectedBooking.requestId);
    await updateDoc(requestRef, { paid: true });

    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === selectedBooking.id ? { ...booking, paid: true } : booking
      )
    );

    setIsModalVisible(false); // Hide the modal
    alert(`Payment successful with ${method}!`); // Show confirmation message
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Bookings</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : bookings.length === 0 ? (
        <Text style={styles.noBookingsText}>No bookings found.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.bookingItem}>
              <Text style={styles.item}>{item.serviceName}</Text>
              <Text style={styles.type}>{item.serviceType}</Text>
              <Text style={styles.amount}>Price: ${item.price}</Text>
              <View style={styles.statusContainer}>
                {item.paid ? (
                  <Text style={styles.paidBadge}>Paid</Text>
                ) : item.status === 'accepted' ? (
                  <TouchableOpacity
                    style={styles.paymentButton}
                    onPress={() => handleMakePayment(item)}
                  >
                    <Text style={styles.paymentButtonText}>Make Payment</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.statusText}>{item.status}</Text>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* Modal for payment options */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Select Payment Method</Text>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => handlePayment('Cash')}
            >
              <FontAwesome name="money" size={24} color="green" />
              <Text style={styles.paymentOptionText}>Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => handlePayment('Bank Transfer')}
            >
              <MaterialIcons name="account-balance" size={24} color="blue" />
              <Text style={styles.paymentOptionText}>Bank Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => handlePayment('Visa')}
            >
              <FontAwesome name="cc-visa" size={24} color="navy" />
              <Text style={styles.paymentOptionText}>Visa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => handlePayment('Mobile Money')}
            >
              <FontAwesome name="mobile-phone" size={24} color="orange" />
              <Text style={styles.paymentOptionText}>Mobile Money</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000',
    marginLeft: 20,
  },
  bookingItem: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    alignSelf: 'center',
  },
  item: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  type: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  amount: {
    fontSize: 16,
    color: '#000',
    marginTop: 5,
  },
  statusContainer: {
    marginTop: 10,
  },
  paidBadge: {
    backgroundColor: 'green',
    color: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  paymentButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#777',
  },
  noBookingsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#777',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    width: '100%',
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
  },
  paymentOptionText: {
    fontSize: 18,
    marginLeft: 15,
  },
  closeButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
