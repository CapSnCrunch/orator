import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function LibraryScreen() {
  const textColor = useThemeColor({}, 'text');
  
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: textColor }]}>Library Screen</Text>
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
}); 