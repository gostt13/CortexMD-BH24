// src/screens/TipsScreen.tsx
import React from 'react'
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'

type Tip = {
  id: string
  title: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
}

const tipsData: Tip[] = [
  {
    id: '1',
    title: 'Strength Training',
    description: 'Incorporate strength training exercises like squats, lunges, and push-ups into your routine to build muscle strength.',
    icon: 'barbell-outline',
  },
  {
    id: '2',
    title: 'Memory Enhancement',
    description: 'Engage in activities such as puzzles, reading, and memory games to enhance your cognitive functions.',
    icon: 'ban-outline',
  },
  {
    id: '3',
    title: 'Balanced Diet',
    description: 'Maintain a balanced diet rich in proteins, vitamins, and minerals to support overall health and muscle recovery.',
    icon: 'nutrition-outline',
  },
  {
    id: '4',
    title: 'Adequate Sleep',
    description: 'Ensure you get 7-9 hours of quality sleep each night to aid muscle recovery and cognitive function.',
    icon: 'moon-outline',
  },
  {
    id: '5',
    title: 'Regular Stretching',
    description: 'Perform regular stretching exercises to improve flexibility and reduce the risk of injuries.',
    icon: 'fitness-outline',
  },
]

const TipsScreen: React.FC = () => {
  const renderItem = ({ item }: { item: Tip }) => (
    <View style={styles.tipItem}>
      <Ionicons name={item.icon} size={24} color={COLORS.secondary} />
      <View style={styles.tipTextContainer}>
        <Text style={styles.tipTitle}>{item.title}</Text>
        <Text style={styles.tipDescription}>{item.description}</Text>
      </View>
    </View>
  )

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="bulb-outline" size={40} color={COLORS.primary} />
        <Text style={styles.headerText}>Health Tips</Text>
      </View>

      {/* Tips List */}
      <FlatList
        data={tipsData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </ScrollView>
  )
}

export default TipsScreen

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
  listContainer: {
    paddingBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.lightTeal,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: COLORS.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android
  },
  tipTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkTeal,
    marginBottom: 5,
  },
  tipDescription: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
})
