import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Platform, Linking } from 'react-native';
import { Camera, CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function HomeScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [type, setType] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      console.log('requesting camera permissions');
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const status = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus.granted && status.granted);
    })();
  }, []);

  const toggleCameraFacing = () => {
    setType(type === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  const captureImage = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          exif: true,
        });
        if (photo) {
          setImage(photo.uri);
          
          // Save the image to the device's media library
          let test = await MediaLibrary.saveToLibraryAsync(photo.uri);
          console.log(test);
        }
      } catch (error) {
        console.error('Error capturing image:', error);
        alert('Failed to capture image. Please try again.');
      }
    }
  };

  if (!hasCameraPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required to use this feature.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={type}
        flash={flash}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <IconSymbol size={28} name="camera.rotate.fill" color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleFlash}>
            <IconSymbol size={28} name={flash === 'off' ? 'bolt.slash.fill' : 'bolt.fill'} color={flash === 'off' ? '#fff' : '#ffeb3b'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={captureImage}>
            <IconSymbol size={28} name="camera.circle.fill" color="#fff" />
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
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
