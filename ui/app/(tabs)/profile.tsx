import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.push('/signin')}
        style={[styles.button, { backgroundColor: useThemeColor({}, 'background') }]}
      >
        <Text style={[styles.text, { color: textColor }]}>Sign In</Text>
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
  button: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
  },
}); 