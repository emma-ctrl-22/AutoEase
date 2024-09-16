import { StyleSheet, Text, View, Switch, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

export default function Settings() {
  const [isEnabled, setIsEnabled] = useState(false)
  const toggleSwitch = () => setIsEnabled(previousState => !previousState)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.item}>
          <Ionicons name="person-outline" size={24} color="black" />
          <Text style={styles.itemText}>Profile</Text>
        </View>
        <View style={styles.item}>
          <Ionicons name="lock-closed-outline" size={24} color="black" />
          <Text style={styles.itemText}>Privacy</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.item}>
          <Ionicons name="moon-outline" size={24} color="black" />
          <Text style={styles.itemText}>Dark Mode</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View style={styles.item}>
          <Ionicons name="notifications-outline" size={24} color="black" />
          <Text style={styles.itemText}>Notifications</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>More</Text>
        <View style={styles.item}>
          <Ionicons name="information-circle-outline" size={24} color="black" />
          <Text style={styles.itemText}>About</Text>
        </View>
        <View style={styles.item}>
          <Ionicons name="help-circle-outline" size={24} color="black" />
          <Text style={styles.itemText}>Help</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontSize: 32,
    color: 'black',
    fontWeight: 'bold',
  },
  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 24,
    color: 'black',
    fontWeight: '600',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 18,
    color: 'black',
    marginLeft: 10,
    flex: 1,
  },
})
