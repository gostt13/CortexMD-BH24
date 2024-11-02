// src/screens/MainMenu.tsx
import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator' // Ensure correct import path
import { COLORS } from '../theme/colors'
import { Ionicons } from '@expo/vector-icons'

type MainMenuNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Tabs' // Assuming 'Tabs' is the initial route
>

const MainMenu: React.FC = () => {
  const navigation = useNavigation<MainMenuNavigationProp>()

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* App Logo */}
      <Image
        source={require('../../assets/logo.jpeg')}
        style={styles.image}
        accessible
        accessibilityLabel="CortexMD Logo"
      />

      {/* App Title */}
      <Text style={styles.title}>CortexMD</Text>

      {/* Mission Statement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.sectionContent}>
          At CortexMD, our mission is to revolutionize early disease detection through innovative motion analysis. By harnessing the power of advanced machine learning algorithms, we aim to identify subtle movement patterns that may indicate the onset of neurological and musculoskeletal disorders.
        </Text>
      </View>

      {/* Research & Methodology */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Research & Methodology</Text>
        <Text style={styles.sectionContent}>
          Our approach integrates cutting-edge computer vision techniques with comprehensive biomechanical analysis. Users can record short video clips of their movements, which are then processed by our backend system to assess potential health risks. This non-invasive method facilitates early intervention, enabling timely medical support and enhancing overall patient outcomes.
        </Text>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepContainer}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          <Text style={styles.stepText}>Record a 15-20 second video of your movement.</Text>
        </View>
        <View style={styles.stepContainer}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          <Text style={styles.stepText}>Upload the video for analysis.</Text>
        </View>
        <View style={styles.stepContainer}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          <Text style={styles.stepText}>Receive a probability score indicating potential health risks.</Text>
        </View>
        <Text style={styles.sectionContent}>
          If the analysis detects signs that exceed our confidence threshold, you will be advised to consult with healthcare professionals for further evaluation.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* Navigate to ModelExample */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate({ name: 'ModelExample', params: { score: 0 } })}
          accessibilityRole="button"
          accessibilityLabel="Learn About Our ML Model"
        >
          <Ionicons size={24} color={COLORS.almostWhite} />
          <Text style={styles.buttonText}>Learn About Our ML Model</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default MainMenu

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 75,
    marginVertical: 20,
    marginTop: 50,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: COLORS.lightTeal,
    padding: 15,
    borderRadius: 10,
    shadowColor: COLORS.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.darkTeal,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 10,
    flexShrink: 1,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  button: {
    flexDirection: 'row', // Align icon and text horizontally
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
    justifyContent: 'center',
    shadowColor: COLORS.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android
  },
  buttonText: {
    color: COLORS.almostWhite,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10, // Space between icon and text
  },
})
