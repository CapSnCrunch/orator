import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, Image, TouchableOpacity, Animated } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Link, router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StatusBar } from 'expo-status-bar';

// Orator logo images
const ORATOR_LIGHT = require('../../assets/images/orator-light.png');
const ORATOR_DARK = require('../../assets/images/orator-dark.png');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const logoSource = isDarkMode ? ORATOR_DARK : ORATOR_LIGHT;
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const bounceAnim = new Animated.Value(0);

  

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Text style={[styles.header, { color: textColor }]}>Welcome to Orator</Text>
      <Image 
        source={logoSource} 
        style={styles.logo}
        resizeMode="contain"
      />
      
        <TouchableOpacity
          onPress={() => router.push('/howto')}
          style={[styles.button, { backgroundColor: useThemeColor({}, 'background') }]}
        >
          <Text style={[{ color: useThemeColor({}, 'text') }]}>
            Click Here to Get Started
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    marginBottom: 30,
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
