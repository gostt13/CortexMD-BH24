// src/navigation/AppNavigator.tsx
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MainMenu from '../screens/MainMenu'
import CameraScreen from '../screens/CameraScreen'
import Profile from '../screens/Profile'
import ModelExample from '../screens/ModelExample'
import ScoreScreen from '../screens/ScoreScreen'
import HistoryScreen from '../screens/HistoryScreen' // Import the new HistoryScreen
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import TipsScreen from '../screens/TipsScreen'

// Define the types for the Tab Navigator
type TabParamList = {
  Home: undefined
  Camera: undefined
  Profile: undefined
}

// Define the types for the Root Stack Navigator
export type RootStackParamList = {
  Tabs: undefined
  ModelExample: undefined
  ScoreScreen: { score: number }
  HistoryScreen: undefined
  TipsScreen: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

// Create the Bottom Tab Navigator
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName='Home'
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = ''

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          }

          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          backgroundColor: COLORS.almostWhite,
          borderTopWidth: 0,
          elevation: 5, // For Android shadow
          shadowOpacity: 0.1, // For iOS shadow
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen name='Home' component={MainMenu} />
      <Tab.Screen name='Camera' component={CameraScreen} />
      <Tab.Screen name='Profile' component={Profile} />
    </Tab.Navigator>
  )
}

// Create the Root Stack Navigator
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='Tabs'
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='ModelExample'
          component={ModelExample}
          options={{
            title: 'Model Example',
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.almostWhite,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name='ScoreScreen'
          component={ScoreScreen}
          options={{
            title: 'Your Score',
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.almostWhite,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name='HistoryScreen'
          component={HistoryScreen}
          options={{
            title: 'History',
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.almostWhite,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name='TipsScreen'
          component={TipsScreen}
          options={{
            title: 'Health Tips',
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.almostWhite,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
