// src/screens/Profile.tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/AppNavigator'
import { COLORS } from '../theme/colors'

type ProfileNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>

const Profile: React.FC = () => {
  const navigation = useNavigation<ProfileNavigationProp>()

  return (
    <View style={styles.container}>
      {/* Profile Information */}
      <View style={styles.profileInfo}>
        <Ionicons name="person-circle-outline" size={100} color={COLORS.primary} />
        <Text style={styles.nameText}>Don Don</Text>
        <Text style={styles.emailText}>don@example.com</Text>
      </View>

      {/* History Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('HistoryScreen')}
        accessibilityRole="button"
        accessibilityLabel="View Score History"
      >
        <Ionicons name="time-outline" size={24} color={COLORS.almostWhite} />
        <Text style={styles.buttonText}>View Score History</Text>
      </TouchableOpacity>

      {/* Tips Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TipsScreen')}
        accessibilityRole="button"
        accessibilityLabel="View Health Tips"
      >
        <Ionicons name="bulb-outline" size={24} color={COLORS.almostWhite} />
        <Text style={styles.buttonText}>View Health Tips</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 50,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 10,
  },
  emailText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 5,
  },
  button: {
    flexDirection: 'row', // Align icon and text horizontally
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    width: '80%',
    marginVertical: 10,
    shadowColor: COLORS.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android
  },
  buttonText: {
    fontSize: 16,
    color: COLORS.almostWhite,
    marginLeft: 10, // Space between icon and text
    fontWeight: '600',
  },
})
