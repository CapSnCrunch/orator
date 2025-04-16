import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';import { usePathname } from 'expo-router';

export function useNotFoundPath() {
  const pathname = usePathname();
  return pathname;
}

export default function NotFoundScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen doesn't exist. 1234</ThemedText>
        <ThemedText type="default" style={styles.link}>Current route: {useNotFoundPath()}</ThemedText>
        <Link href="/home" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
