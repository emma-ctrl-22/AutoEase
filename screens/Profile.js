import React from 'react'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import { Avatar, Button, Divider } from 'react-native-paper'

export default function Profile() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={100} label="DR" style={styles.avatar} />
        <Text style={styles.name}>Daniel Rockson</Text>
        <Text style={styles.username}>@danielrockson</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>About Me</Text>
        <Text style={styles.sectionText}>
          Hi, I'm Daniel Rockson, a passionate developer with experience in React Native and other cool technologies. I love building beautiful and functional applications.
        </Text>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Contact Information</Text>
        <Text style={styles.sectionText}>Email: daniel.rockson@example.com</Text>
        <Text style={styles.sectionText}>Phone: +1 234 567 890</Text>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Settings</Text>
        <Button mode="contained" style={styles.button}>Edit Profile</Button>
        <Button mode="outlined" style={styles.button}>Change Password</Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    backgroundColor: '#6200ea',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  username: {
    fontSize: 18,
    color: '#777',
  },
  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#ccc',
  },
  button: {
    marginVertical: 10,
  },
})
