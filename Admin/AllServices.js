import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig'; // Adjust this import based on your project structure
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const AllServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setBusinessId(user.uid);
    } else {
      Alert.alert('Error', 'No user is logged in.');
      navigation.goBack();
    }
  }, []);

  useEffect(() => {
    if (!businessId) return;

    const fetchServices = async () => {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, where('businessId', '==', businessId));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const servicesData = [];
        snapshot.forEach((doc) => {
          servicesData.push({ id: doc.id, ...doc.data() });
        });
        setServices(servicesData);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching services:', error);
        setLoading(false);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    };

    fetchServices();
  }, [businessId]);

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'services', id));
              Alert.alert('Success', 'Service deleted successfully!');
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', 'Failed to delete service. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedService.serviceName || !selectedService.price) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      await updateDoc(doc(db, 'services', selectedService.id), {
        serviceName: selectedService.serviceName,
        price: selectedService.price,
        carName: selectedService.carName || '',
        carDescription: selectedService.carDescription || '',
        // Add other fields if necessary
      });
      setModalVisible(false);
      Alert.alert('Success', 'Service updated successfully!');
    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert('Error', 'Failed to update service. Please try again.');
    }
  };

  const handleChange = (field, value) => {
    setSelectedService({ ...selectedService, [field]: value });
  };

  const renderServiceItem = ({ item }) => (
    <View style={styles.serviceItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <Text style={styles.servicePrice}>${item.price}</Text>
        {item.businessType === 'carRental' && (
          <>
            <Text style={styles.carName}>{item.carName}</Text>
            <Text style={styles.carDescription}>{item.carDescription}</Text>
          </>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={styles.actionButton}
        >
          <Ionicons name="pencil" size={24} color="#1C3530" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.actionButton}
        >
          <Ionicons name="trash" size={24} color="#D9534F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Services</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1C3530" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>You have no services.</Text>
          }
          contentContainerStyle={
            services.length === 0 && styles.emptyContainer
          }
        />
      )}

      {/* Edit Service Modal */}
      {selectedService && (
        <Modal visible={modalVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Service</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Name</Text>
              <TextInput
                style={styles.input}
                value={selectedService.serviceName}
                onChangeText={(value) => handleChange('serviceName', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={selectedService.price}
                onChangeText={(value) => handleChange('price', value)}
                keyboardType="numeric"
              />
            </View>

            {selectedService.businessType === 'carRental' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Car Name</Text>
                  <TextInput
                    style={styles.input}
                    value={selectedService.carName}
                    onChangeText={(value) => handleChange('carName', value)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Car Description</Text>
                  <TextInput
                    style={styles.textArea}
                    value={selectedService.carDescription}
                    onChangeText={(value) =>
                      handleChange('carDescription', value)
                    }
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: '#555' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      )}
    </View>
  );
};

export default AllServices;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C3530',
    textAlign: 'center',
    marginBottom: 16,
  },
  serviceItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C3530',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 18,
    color: '#28A745',
    marginBottom: 8,
  },
  carName: {
    fontSize: 18,
    color: '#555',
    marginBottom: 4,
  },
  carDescription: {
    fontSize: 16,
    color: '#777',
  },
  actions: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C3530',
    textAlign: 'center',
    marginBottom: 20,
    marginTop:20
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    color: '#1C3530',
    marginBottom: 5,
  },
  input: {
    height: 48,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 100,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: '#FFF',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#1C3530',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
  },
});
