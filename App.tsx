// App.tsx
import React from 'react'
import AppNavigator from './src/navigation/AppNavigator'
import { StatusBar } from 'expo-status-bar'

const App: React.FC = () => {
  return (
    <>
      <AppNavigator />
      <StatusBar style='auto' />
    </>
  )
}

export default App
