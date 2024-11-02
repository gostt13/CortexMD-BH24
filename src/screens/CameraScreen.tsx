// src/screens/CameraScreen.tsx

import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import { ResizeMode, Video } from 'expo-av'
import { Camera, CameraType, PermissionStatus } from 'expo-camera/legacy'
import React, { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS } from '../theme/colors'
import { ngrok_upload } from '../ngrok'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/AppNavigator'

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CameraScreen'
>

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>()

  // State variables
  const [facing, setFacing] = useState<CameraType>(CameraType.back)
  const [permissionInformation, requestPermission] =
    Camera.useCameraPermissions()
  const [recording, setRecording] = useState(false)
  const [videoUri, setVideoUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)

  const cameraRef = useRef<Camera>(null)
  const videoPlayerRef = useRef<Video>(null)

  const toggleCameraFacing = () => {
    setFacing(current =>
      current === CameraType.back ? CameraType.front : CameraType.back
    )
  }

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setRecording(true)
        const video = await cameraRef.current.recordAsync()
        setVideoUri(video.uri)
        setIsReviewing(true) // Switch to review view
      } catch (error) {
        console.error('Error during recording:', error)
        Alert.alert('Error', 'Failed to record video.')
        setRecording(false)
      }
    }
  }

  const stopRecording = () => {
    if (cameraRef.current && recording) {
      cameraRef.current.stopRecording()
      setRecording(false)
    }
  }

  const submitVideo = async () => {
    if (!videoUri) return
    setLoading(true)

    const formData = new FormData()
    const videoBlob = {
      uri: videoUri,
      type: 'video/mp4',
      name: 'recorded_video.mp4',
    } as any
    formData.append('video', videoBlob)

    try {
      const response = await axios.post(
        ngrok_upload,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 100000,
        }
      )

      const { processed_video_url, similarity_score } = response.data
      const scaledScore = Math.floor(similarity_score * 10000) // Scale score and remove decimals
      // Navigate to ScoreScreen with healthScore
      navigation.navigate('ScoreScreen', { healthScore: scaledScore })
    } catch (error) {
      console.error('Error uploading video:', error)
      Alert.alert('Error', 'Failed to upload video.')
    } finally {
      setLoading(false)
    }
  }

  if (!permissionInformation) {
    return <View style={styles.container} />
  }

  if (permissionInformation.status !== PermissionStatus.GRANTED) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons
          name='lock-closed-outline'
          size={60}
          color={COLORS.secondary}
        />
        <Text style={styles.permissionMessage}>
          We need your permission to access the camera.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // If the user is reviewing their video, show review controls
  if (isReviewing && videoUri) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Ionicons name='videocam-outline' size={40} color={COLORS.primary} />
          <Text style={styles.headerText}>Review Your Video</Text>
        </View>

        <Video
          ref={videoPlayerRef}
          style={styles.video}
          source={{ uri: videoUri }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onPlaybackStatusUpdate={() => {}}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setIsReviewing(false)
              setVideoUri(null)
            }}
          >
            <Ionicons
              name='refresh-circle-outline'
              size={24}
              color={COLORS.almostWhite}
            />
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={submitVideo}>
            <Ionicons
              name='checkmark-circle-outline'
              size={24}
              color={COLORS.almostWhite}
            />
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={COLORS.secondary} />
            <Text style={styles.loadingText}>Uploading your video...</Text>
          </View>
        )}
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name='camera-outline' size={40} color={COLORS.primary} />
        <Text style={styles.headerText}>Record Your Video</Text>
      </View>

      <Camera style={styles.camera} type={facing} ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <TouchableOpacity
            onPress={toggleCameraFacing}
            accessibilityLabel='Toggle Camera'
            accessibilityHint='Switches between front and back camera'
          >
            <Ionicons
              name='camera-reverse-outline'
              size={30}
              color={COLORS.almostWhite}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.controlsContainer}>
          {!recording ? (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startRecording}
              accessibilityLabel='Record Video'
              accessibilityHint='Starts video recording'
            >
              <Ionicons
                name='radio-button-on'
                size={70}
                color={COLORS.secondary}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopRecording}
              accessibilityLabel='Stop Recording'
              accessibilityHint='Stops video recording'
            >
              <Ionicons name='square' size={70} color={COLORS.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </Camera>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>
          1. We need to see your full height.
        </Text>
        <Text style={styles.instructionText}>
          2. Raise left leg and right leg, one by one.
        </Text>
        <Text style={styles.instructionText}>
          3. Raise left arm and right arm, one by one.
        </Text>
      </View>
    </View>
  )
}

export default CameraScreen

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.lightTeal,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    marginTop: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 10,
  },
  camera: {
    width: '100%',
    height: 600,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  recordButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  stopButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  videoFrame: {
    width: '100%',
    backgroundColor: COLORS.lightTeal,
    padding: 15,
    borderRadius: 10,
    shadowColor: COLORS.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  video: {
    width: '100%',
    height: 600,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    justifyContent: 'center',
    shadowColor: COLORS.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: '45%',
  },
  buttonText: {
    fontSize: 16,
    color: COLORS.almostWhite,
    marginLeft: 10,
    fontWeight: '600',
  },
  instructionsContainer: {
    marginTop: -10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkTeal,
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 16,
    color: COLORS.almostWhite,
    marginVertical: 2,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  similarityText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionMessage: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 20,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    justifyContent: 'center',
    shadowColor: COLORS.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  permissionButtonText: {
    fontSize: 16,
    color: COLORS.almostWhite,
    fontWeight: '600',
  },
})
