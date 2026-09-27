import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { palette } from '@/components/store/StoreUI';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/(tabs)" asChild>
          <Button mode="contained" buttonColor={palette.ink} style={styles.link}>Return to the bookshop</Button>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: palette.ink,
    fontWeight: '700',
  },
  link: { marginTop: 15 },
});
