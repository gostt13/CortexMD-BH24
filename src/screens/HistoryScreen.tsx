// src/screens/HistoryScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/AppNavigator'
import { COLORS } from '../theme/colors'
import AsyncStorage from '@react-native-async-storage/async-storage'

type HistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HistoryScreen'
>

type ScoreRecord = {
  score: number
  date: string
}

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>()
  const [scores, setScores] = useState<ScoreRecord[]>([])

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const storedScores = await AsyncStorage.getItem('scores')
        if (storedScores) {
          setScores(JSON.parse(storedScores))
        }
      } catch (error) {
        console.error('Error fetching scores:', error)
        Alert.alert('Error', 'Unable to retrieve your score history.')
      }
    }

    fetchScores()
  }, [])

  const renderItem = ({ item }: { item: ScoreRecord }) => (
    <View style={styles.scoreItem}>
      <Text style={styles.scoreNumber}>{item.score}</Text>
      <Text style={styles.scoreDate}>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="time-outline" size={40} color={COLORS.primary} />
        <Text style={styles.headerText}>Score History</Text>
      </View>

      {/* Score List */}
      {scores.length === 0 ? (
        <Text style={styles.noScoresText}>No scores available. Start by calculating your score!</Text>
      ) : (
        <FlatList
          data={scores.reverse()} // Show latest scores first
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  )
}

export default HistoryScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
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
  listContainer: {
    width: '100%',
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightTeal,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: COLORS.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  scoreDate: {
    fontSize: 16,
    color: COLORS.text,
  },
  noScoresText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 50,
  },
})
