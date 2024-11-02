// src/screens/ScoreScreen.tsx
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation, RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/AppNavigator'
import { COLORS } from '../theme/colors'
import Svg, { Rect, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg'

type ScoreScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ScoreScreen'
>

type ScoreScreenRouteProp = RouteProp<RootStackParamList, 'ScoreScreen'>

type Props = {
  route: ScoreScreenRouteProp
}

const ScoreScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<ScoreScreenNavigationProp>()
  const { healthScore } = route.params

  // Determine feedback based on the score
  const isHealthy = healthScore <= 5000

  // Example tips
  const tips = [
    'Incorporate strength training exercises into your routine.',
    'Engage in memory-enhancing activities like puzzles and reading.',
    'Maintain a balanced diet rich in proteins and vitamins.',
    'Ensure adequate sleep to aid muscle recovery and cognitive function.',
  ]

  // Function to handle hospital navigation
  const handleHospitalNavigation = () => {
    const hospitalAddress = '123 Health St, Wellness City'
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      hospitalAddress
    )}`
    Linking.openURL(url).catch(err => console.error('Error opening maps', err))
  }

  // Define graph constants
  const GRAPH_WIDTH = Dimensions.get('window').width - 40 // 20 padding on each side
  const GRAPH_HEIGHT = 30
  const MAX_SCORE = 10000
  const GRAPH_RANGES = [
    { label: '0', value: 0, color: COLORS.darkGreen },
    { label: '2,500', value: 2500, color: COLORS.lightGreen },
    { label: '5,000', value: 5000, color: COLORS.yellow },
    { label: '7,500', value: 7500, color: COLORS.orange },
    { label: '10,000', value: 10000, color: COLORS.red },
  ]

  // Calculate the position of the arrow based on the score
  const getArrowPosition = () => {
    const clampedScore = Math.min(Math.max(healthScore, 0), MAX_SCORE)
    const ratio = clampedScore / MAX_SCORE
    return ratio * GRAPH_WIDTH
  }

  // Determine the color of the arrow based on the score
  const getArrowColor = () => {
    for (let i = GRAPH_RANGES.length - 1; i >= 0; i--) {
      if (healthScore >= GRAPH_RANGES[i].value) {
        return GRAPH_RANGES[i].color
      }
    }
    return COLORS.darkGreen // Fallback color
  }

  // Define colors for the gradient ranges
  const gradientColors = [
    { offset: '0%', color: COLORS.darkGreen },
    { offset: '25%', color: COLORS.lightGreen },
    { offset: '50%', color: COLORS.yellow },
    { offset: '75%', color: COLORS.orange },
    { offset: '100%', color: COLORS.red },
  ]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={40} color={COLORS.primary} />
        <Text style={styles.headerText}>Your Health Score</Text>
      </View>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{healthScore}</Text>
        <Text style={styles.scoreLabel}>Health Score</Text>
      </View>

      {/* Horizontal Gradient Graph */}
      <View style={styles.graphContainer}>
        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT + 40}>
          {/* Gradient Definition */}
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              {gradientColors.map((stop, index) => (
                <Stop key={index} offset={stop.offset} stopColor={stop.color} />
              ))}
            </LinearGradient>
          </Defs>

          {/* Arrow Indicator */}
          <Polygon
            points={`
              ${getArrowPosition() - 10},10
              ${getArrowPosition() + 10},10
              ${getArrowPosition()},30
            `}
            fill={getArrowColor()}
          />

          {/* Gradient Rectangle */}
          <Rect
            x="0"
            y="35" // Position the graph below the arrow
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            fill="url(#gradient)"
            rx={GRAPH_HEIGHT / 2}
            ry={GRAPH_HEIGHT / 2}
          />
        </Svg>

        {/* Labels */}
        <View style={styles.labelsContainer}>
          {GRAPH_RANGES.map((range, index) => (
            <View
              key={index}
              style={[
                styles.labelContainer,
                { left: (range.value / MAX_SCORE) * GRAPH_WIDTH - 15 }, // Adjust label position
              ]}
            >
              <Text style={styles.labelText}>{range.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Feedback Section */}
      <View style={styles.section}>
        {isHealthy ? (
          <>
            <Text style={styles.sectionTitle}>All Good!</Text>
            <Text style={styles.sectionContent}>
              Your health score indicates that you're in good shape. Here are some tips to maintain and further enhance your well-being:
            </Text>
            <View style={styles.tipsContainer}>
              {tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Attention Needed</Text>
            <Text style={styles.sectionContent}>
              Your health score suggests that you may be at risk. Please review the following report and consider seeking medical attention.
            </Text>
            {/* Placeholder for Report */}
            <View style={styles.reportContainer}>
              <Text style={styles.reportText}>Detailed Report:</Text>
              <Text style={styles.reportContent}>
                Based on your recorded movements, there are indications of potential musculoskeletal and neurological concerns. It's recommended to consult with a healthcare professional for a comprehensive evaluation.
              </Text>
            </View>
            {/* Hospital Guidance */}
            <View style={styles.guidanceContainer}>
              <Text style={styles.guidanceTitle}>Next Steps:</Text>
              <TouchableOpacity style={styles.guidanceButton} onPress={handleHospitalNavigation}>
                <Ionicons name="navigate-outline" size={24} color={COLORS.almostWhite} />
                <Text style={styles.guidanceButtonText}>Find Nearest Hospital</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guidanceButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back-circle-outline" size={24} color={COLORS.almostWhite} />
                <Text style={styles.guidanceButtonTextPrimary}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  )
}

export default ScoreScreen

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    flexGrow: 1,
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
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  scoreLabel: {
    fontSize: 18,
    color: COLORS.text,
  },
  graphContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
    position: 'relative', // Needed for absolute positioning of labels
  },
  labelsContainer: {
    position: 'absolute',
    top: 70, // Adjusted to place labels closer to the graph
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    color: COLORS.text,
  },
  section: {
    width: '100%',
    backgroundColor: COLORS.lightTeal,
    padding: 15,
    borderRadius: 10,
    shadowColor: COLORS.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android
    marginBottom: 20, // Added space below the section
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
  tipsContainer: {
    marginTop: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 10,
    flexShrink: 1,
  },
  reportContainer: {
    marginTop: 10,
    backgroundColor: COLORS.almostWhite,
    padding: 10,
    borderRadius: 8,
  },
  reportText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 5,
  },
  reportContent: {
    fontSize: 14,
    color: COLORS.text,
  },
  guidanceContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkTeal,
    marginBottom: 10,
  },
  guidanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    width: '80%',
    justifyContent: 'center',
  },
  guidanceButtonText: {
    color: COLORS.almostWhite,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  guidanceButtonTextPrimary: {
    color: COLORS.almostWhite,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.almostWhite,
    fontSize: 16,
    fontWeight: '600',
  },
})
