import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Image, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as ImagePicker from 'expo-image-picker';

export default function HowToScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background')
  
  const [image, setImage] = useState<string | null>(null);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    } else {
      alert('You need to provide an image');
    }
  };

  return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, borderRadius: 8, marginBottom: 20 }} />}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: backgroundColor }]}
        onPress={pickImageAsync}
      >
        <Text style={[{ color: textColor }]}>
          {image ? 'Change Image' : 'Pick an image from camera roll'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: useThemeColor({}, 'background') },
          !image && { display: 'none' }
        ]}
      >
        <Text style={[{ color: textColor }]}>
          Generate audio
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 