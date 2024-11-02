// src/screens/ModelExample.tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { COLORS } from '../theme/colors'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/AppNavigator'

type ModelExampleNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ModelExample'
>

const ModelExample: React.FC = () => {
  const navigation = useNavigation<ModelExampleNavigationProp>()
  const [loading, setLoading] = useState(false)

  // Function to simulate score calculation
  const calculateScore = async () => {
    setLoading(true)
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate a score between 0 and 10,000
      const generatedScore = Math.floor(Math.random() * 10001)

      // Navigate to ScoreScreen with the generated score
      navigation.navigate('ScoreScreen', { score: generatedScore })
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'Failed to calculate score.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={40} color={COLORS.primary} />
        <Text style={styles.headerText}>ML Model Overview</Text>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How Our ML Model Works</Text>
        <Text style={styles.sectionContent}>
          Our machine learning model leverages advanced computer vision and deep learning techniques to analyze subtle movement patterns captured in video recordings. By processing these patterns, the model can identify early signs of neurological and musculoskeletal disorders, enabling timely intervention and improved patient outcomes.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featureContainer}>
          <Ionicons name="speedometer-outline" size={24} color={COLORS.secondary} />
          <Text style={styles.featureText}>Real-time Movement Analysis</Text>
        </View>
        <View style={styles.featureContainer}>
          <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.secondary} />
          <Text style={styles.featureText}>High Accuracy Detection</Text>
        </View>
        <View style={styles.featureContainer}>
          <Ionicons name="sync-circle-outline" size={24} color={COLORS.secondary} />
          <Text style={styles.featureText}>Continuous Learning</Text>
        </View>
      </View>

      {/* Conclusion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        <Text style={styles.sectionContent}>
          By utilizing our ML model, healthcare providers can benefit from:
        </Text>
        <View style={styles.benefitsList}>
          <Ionicons name="checkmark-outline" size={20} color={COLORS.primary} />
          <Text style={styles.benefitText}>Early Detection of Diseases</Text>
        </View>
        <View style={styles.benefitsList}>
          <Ionicons name="checkmark-outline" size={20} color={COLORS.primary} />
          <Text style={styles.benefitText}>Non-Invasive Assessment</Text>
        </View>
        <View style={styles.benefitsList}>
          <Ionicons name="checkmark-outline" size={20} color={COLORS.primary} />
          <Text style={styles.benefitText}>Enhanced Patient Monitoring</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {/* Navigate to ScoreScreen */}
        <TouchableOpacity
          style={styles.button}
          onPress={calculateScore}
          accessibilityRole="button"
          accessibilityLabel="Calculate Your Health Score"
        >
          <Ionicons name="calculator-outline" size={24} color={COLORS.almostWhite} />
          <Text style={styles.buttonText}>Calculate Your Health Score</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 10 }} />}
      </View>
    </ScrollView>
  )
}

export default ModelExample

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 10,
  },
  section: {
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
  featureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 10,
  },
  benefitsList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  benefitText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 5,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row', // Align icon and text horizontally
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    width: '80%',
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
