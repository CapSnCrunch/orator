import { Button, StyleSheet, Text, TouchableOpacity, View , Image, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Camera, CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import * as MediaLibrary from 'expo-media-library';

export default function HomeScreen() {

  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [image, setImage] = useState(null);
  const [type, setType] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const cameraRef = useRef<typeof Camera>(null);

  useEffect(() => {
    (async () => {
      const cameraStatus  = await Camera.requestCameraPermissionsAsync();
      const status = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus.granted && status.granted);
    })();
  }, []);

  const toggleCameraFacing = () => {
    setType(type === 'back' ? 'front' : 'back');
  };

  return (
    <View style={styles.container}>
    <CameraView style={styles.camera} facing={type}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </CameraView>
  </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: 400,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
