import { ErrorState, LoadingState, palette } from '@/components/store/StoreUI';
import { Book, Order, getOrder, getOrderBooks } from '@/services/StoreService';
import getApiErrorMessage from '@/services/getErrorMessage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Text } from 'react-native-paper';

export default function OrderDetailsScreen() {
  const { referenceNumber } = useLocalSearchParams<{ referenceNumber: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!referenceNumber) return;
    setLoading(true);
    Promise.all([getOrder(referenceNumber), getOrderBooks(referenceNumber)])
      .then(([orderDetails, orderItems]) => { setOrder(orderDetails); setBooks(orderItems); })
      .catch(requestError => setError(getApiErrorMessage(requestError, 'This order could not be loaded.')))
      .finally(() => setLoading(false));
  }, [referenceNumber]);

  if (loading) return <LoadingState label="Loading order details" />;
  if (error || !order) return <ScrollView contentContainerStyle={styles.content}><ErrorState message={error || 'Order not found.'} onRetry={() => router.back()} /></ScrollView>;

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>ORDER CONFIRMATION</Text>
    <Text style={styles.title}>#{order.referenceNumber}</Text>
    <View style={styles.orderLine}>
      <Text style={styles.date}>Placed {new Date(order.createdAt).toLocaleString()}</Text>
      <Chip compact style={styles.status}>{order.status}</Chip>
    </View>
    <Card mode="contained" style={styles.summary}>
      <Card.Content>
        <View style={styles.summaryLine}><Text style={styles.label}>Books</Text><Text style={styles.value}>£{order.cost}</Text></View>
        <View style={styles.summaryLine}><Text style={styles.label}>Delivery</Text><Text style={styles.value}>£{order.deliveryCost}</Text></View>
        <Divider style={styles.divider} />
        <View style={styles.summaryLine}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>£{order.totalCost}</Text></View>
      </Card.Content>
    </Card>
    <Text style={styles.sectionTitle}>In this order</Text>
    {books.map(book => <View key={book.id} style={styles.book}>
      <View style={styles.coverFrame}>{book.jpgImageURL ? <Image source={{ uri: book.jpgImageURL }} style={styles.cover} resizeMode="contain" /> : null}</View>
      <View style={styles.bookCopy}>
        <Text style={styles.bookName}>{book.name}</Text>
        <Text style={styles.publisher}>{book.publisher}</Text>
        <Text style={styles.price}>£{book.cost}</Text>
      </View>
      <Button compact onPress={() => router.push({ pathname: '/book/[slug]', params: { slug: book.slug } } as never)}>View</Button>
    </View>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36 },
  eyebrow: { color: palette.orange, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: palette.ink, fontFamily: 'serif', fontSize: 27, fontWeight: '700', marginTop: 4 },
  orderLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 18 },
  date: { color: palette.muted, fontSize: 12, flex: 1 },
  status: { backgroundColor: '#E2EBE6' },
  summary: { backgroundColor: palette.white, borderRadius: 8 },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { color: palette.muted },
  value: { color: palette.ink, fontWeight: '600' },
  divider: { marginVertical: 6, backgroundColor: palette.line },
  totalLabel: { color: palette.ink, fontWeight: '700', fontSize: 16 },
  totalValue: { color: palette.orange, fontWeight: '800', fontSize: 17 },
  sectionTitle: { color: palette.ink, fontFamily: 'serif', fontSize: 21, fontWeight: '700', marginTop: 25, marginBottom: 10 },
  book: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: palette.line, paddingVertical: 12, gap: 12 },
  coverFrame: { width: 58, height: 76, backgroundColor: '#EFECE4', borderRadius: 5, overflow: 'hidden' },
  cover: { width: '100%', height: '100%' },
  bookCopy: { flex: 1, gap: 3 },
  bookName: { color: palette.ink, fontWeight: '700' },
  publisher: { color: palette.muted, fontSize: 11 },
  price: { color: palette.orange, fontWeight: '700', marginTop: 3 },
});