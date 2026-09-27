import { Book } from '@/services/StoreService';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';

export const palette = {
  ink: '#19372F',
  leaf: '#31594B',
  paper: '#F8F5EF',
  white: '#FFFFFF',
  muted: '#78827C',
  line: '#E6E3DC',
  orange: '#D9754B',
  pale: '#E9EEE8',
};

export function BookTile({ book, onPress, width = '48%' }: {
  book: Book;
  onPress: () => void;
  width?: number | `${number}%`;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tile, { width }]}>
      <View style={styles.coverWrap}>
        {book.jpgImageURL ? (
          <Image source={{ uri: book.jpgImageURL }} style={styles.cover} resizeMode="contain" />
        ) : (
          <View style={styles.coverFallback}>
            <Ionicons name="book-outline" size={28} color={palette.leaf} />
          </View>
        )}
      </View>
      <Text numberOfLines={2} variant="titleSmall" style={styles.bookTitle}>{book.name}</Text>
      <Text numberOfLines={1} variant="bodySmall" style={styles.bookAuthor}>{book.author || book.publisher}</Text>
      <Text variant="titleSmall" style={styles.price}>£{book.cost}</Text>
    </Pressable>
  );
}

export function LoadingState({ label = 'Loading your shelves' }: { label?: string }) {
  return <View style={styles.state}>
    <ActivityIndicator color={palette.orange} />
    <Text style={styles.stateText}>{label}</Text>
  </View>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <Card mode="contained" style={styles.messageCard}>
    <Card.Content style={styles.messageContent}>
      <Ionicons name="cloud-offline-outline" size={25} color={palette.orange} />
      <Text variant="titleMedium" style={styles.messageTitle}>We couldn't reach the shop</Text>
      <Text variant="bodyMedium" style={styles.messageText}>{message}</Text>
      {onRetry ? <Button mode="contained" buttonColor={palette.ink} onPress={onRetry}>Try again</Button> : null}
    </Card.Content>
  </Card>;
}

export function EmptyState({ title, message, icon = 'book-outline' }: {
  title: string;
  message: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return <View style={styles.empty}>
    <View style={styles.emptyIcon}><Ionicons name={icon} size={26} color={palette.leaf} /></View>
    <Text variant="titleMedium" style={styles.messageTitle}>{title}</Text>
    <Text variant="bodyMedium" style={styles.messageText}>{message}</Text>
  </View>;
}

export const styles = StyleSheet.create({
  tile: { marginBottom: 20 },
  coverWrap: {
    height: 178,
    backgroundColor: '#EFECE4',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: { width: '100%', height: '100%' },
  coverFallback: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  bookTitle: { color: palette.ink, fontWeight: '700', marginTop: 9, minHeight: 38 },
  bookAuthor: { color: palette.muted, marginTop: 3 },
  price: { color: palette.orange, marginTop: 5, fontWeight: '700' },
  state: { minHeight: 260, justifyContent: 'center', alignItems: 'center', gap: 12 },
  stateText: { color: palette.muted },
  messageCard: { backgroundColor: palette.white, borderRadius: 8, marginVertical: 12 },
  messageContent: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  messageTitle: { color: palette.ink, fontWeight: '700', textAlign: 'center' },
  messageText: { color: palette.muted, textAlign: 'center', lineHeight: 21 },
  empty: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 36, gap: 8 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: palette.pale, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});