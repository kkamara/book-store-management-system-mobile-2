import { EmptyState, ErrorState, LoadingState, palette } from '@/components/store/StoreUI';
import { useAccounts } from '@/providers/StorefrontProvider';
import { getOrders, Order, Page } from '@/services/StoreService';
import getApiErrorMessage from '@/services/getErrorMessage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Searchbar, Text } from 'react-native-paper';

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuth } = useAccounts();
  const [orders, setOrders] = useState<Page<Order> | null>(null);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadOrders(page = 1, search = appliedQuery) {
    setLoading(true);
    setError('');
    try { setOrders(await getOrders(page, search)); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not load your orders.')); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (isAuth) void loadOrders(1, ''); }, [isAuth]);

  if (!isAuth) return <View style={styles.center}>
    <EmptyState title="Your orders live here" message="Sign in to follow the books you've ordered." icon="receipt-outline" />
    <Button mode="contained" buttonColor={palette.ink} onPress={() => router.push('/login')}>Sign in</Button>
  </View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>YOUR READING JOURNEY</Text>
      <Text style={styles.title}>Orders</Text>
      <View style={styles.searchRow}>
        <Searchbar placeholder="Reference or status" value={query} onChangeText={setQuery} onSubmitEditing={() => { setAppliedQuery(query); void loadOrders(1, query); }} style={styles.searchbar} />
        <Button compact onPress={() => { setQuery(''); setAppliedQuery(''); void loadOrders(1, ''); }}>Clear</Button>
      </View>
      {loading ? <LoadingState label="Finding your orders" /> : error ? <ErrorState message={error} onRetry={() => void loadOrders()} /> : !orders?.data.length ? (
        <EmptyState title="No orders found" message={appliedQuery ? 'Try another reference or clear your search.' : 'When you place an order, it will appear here.'} icon="receipt-outline" />
      ) : (
        <>
          {orders.data.map(order => <Card key={order.referenceNumber} mode="contained" style={styles.card}>
            <Card.Content>
              <View style={styles.orderHeading}>
                <Text style={styles.orderRef}>#{order.referenceNumber}</Text>
                <Chip compact style={statusStyle(order.status)} textStyle={styles.statusText}>{order.status}</Chip>
              </View>
              <Text style={styles.orderDate}>Ordered {new Date(order.createdAt).toLocaleDateString()}</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>£{order.totalCost}</Text>
                <Button compact mode="contained-tonal" onPress={() => router.push({ pathname: '/order/[referenceNumber]', params: { referenceNumber: order.referenceNumber } } as never)}>View order</Button>
              </View>
            </Card.Content>
          </Card>)}
          {orders.meta.lastPage > 1 ? <View style={styles.pagination}>
            <Button compact disabled={orders.meta.currentPage <= 1} onPress={() => void loadOrders(orders.meta.currentPage - 1)}>Previous</Button>
            <Text style={styles.pageText}>{orders.meta.currentPage} / {orders.meta.lastPage}</Text>
            <Button compact disabled={orders.meta.currentPage >= orders.meta.lastPage} onPress={() => void loadOrders(orders.meta.currentPage + 1)}>Next</Button>
          </View> : null}
        </>
      )}
    </ScrollView>
  );
}

function statusStyle(status: string) {
  if (status === 'DELIVERED') return { backgroundColor: '#DDEBE0' };
  if (['PROCESSING', 'PROCESSED', 'DELIVERING'].includes(status)) return { backgroundColor: '#E2EBE6' };
  return { backgroundColor: '#F4E6D7' };
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paper, padding: 24 },
  eyebrow: { color: palette.orange, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: palette.ink, fontFamily: 'serif', fontSize: 30, fontWeight: '700', marginTop: 3, marginBottom: 18 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  searchbar: { flex: 1, backgroundColor: palette.white, borderRadius: 8 },
  card: { backgroundColor: palette.white, borderRadius: 8, marginBottom: 12 },
  orderHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  orderRef: { color: palette.ink, fontWeight: '800', flex: 1 },
  statusText: { color: palette.ink, fontSize: 10, fontWeight: '700' },
  orderDate: { color: palette.muted, fontSize: 12, marginTop: 7 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  orderTotal: { color: palette.orange, fontSize: 17, fontWeight: '800' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  pageText: { color: palette.muted, fontSize: 12 },
});