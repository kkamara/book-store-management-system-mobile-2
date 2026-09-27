import { EmptyState, ErrorState, LoadingState, palette } from '@/components/store/StoreUI';
import { useAccounts } from '@/providers/AccountsProvider';
import { CartItem, addToCart, getCart, removeFromCart } from '@/services/StoreService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, IconButton, Snackbar, Text } from 'react-native-paper';

const deliveryCost = 3.99;

export default function CartScreen() {
  const router = useRouter();
  const { isAuth } = useAccounts();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadCart() {
    setLoading(true);
    setError('');
    try { setItems(await getCart()); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not load your bag.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (isAuth) void loadCart();
    else setLoading(false);
  }, [isAuth]);

  async function changeQuantity(bookId: number, direction: 'add' | 'remove') {
    setWorking(bookId);
    try { setItems(direction === 'add' ? await addToCart(bookId) : await removeFromCart(bookId)); }
    catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : 'Could not update your bag.'); }
    finally { setWorking(null); }
  }

  if (!isAuth) return <View style={styles.center}>
    <EmptyState title="Your bag is waiting" message="Sign in to see your saved books and manage your order." icon="bag-outline" />
    <Button mode="contained" buttonColor={palette.ink} onPress={() => router.push('/login')}>Sign in</Button>
  </View>;

  const subtotal = items.reduce((sum, item) => sum + Number(item.cost), 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>READY WHEN YOU ARE</Text>
      <Text style={styles.title}>Your bag</Text>
      {loading ? <LoadingState label="Gathering your books" /> : error ? <ErrorState message={error} onRetry={() => void loadCart()} /> : items.length === 0 ? (
        <EmptyState title="Nothing in your bag" message="Explore the shelves and add a book that catches your eye." icon="bag-outline" />
      ) : (
        <>
          {items.map(item => <View key={item.book.id} style={styles.item}>
            <View style={styles.itemCopy}>
              <Text style={styles.bookName}>{item.book.name}</Text>
              <Text style={styles.bookAuthor}>{item.book.author || item.book.publisher}</Text>
              <Text style={styles.itemPrice}>£{item.cost}</Text>
              <View style={styles.quantity}>
                <IconButton icon="minus" size={17} disabled={working === item.book.id} onPress={() => void changeQuantity(item.book.id, 'remove')} />
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <IconButton icon="plus" size={17} disabled={working === item.book.id} onPress={() => void changeQuantity(item.book.id, 'add')} />
              </View>
            </View>
            <Button compact onPress={() => router.push({ pathname: '/book/[slug]', params: { slug: item.book.slug } } as never)}>View</Button>
          </View>)}
          <Divider style={styles.divider} />
          <View style={styles.summaryLine}><Text style={styles.summaryLabel}>Books</Text><Text style={styles.summaryValue}>£{subtotal.toFixed(2)}</Text></View>
          <View style={styles.summaryLine}><Text style={styles.summaryLabel}>Delivery</Text><Text style={styles.summaryValue}>£{deliveryCost.toFixed(2)}</Text></View>
          <View style={styles.summaryTotal}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>£{(subtotal + deliveryCost).toFixed(2)}</Text></View>
          <Button mode="contained" buttonColor={palette.ink} style={styles.checkout} icon="lock-outline" onPress={() => setNotice('Checkout is not available on the website yet.')}>Continue to checkout</Button>
        </>
      )}
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} action={{ label: 'Dismiss', onPress: () => setNotice('') }}>{notice}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paper, padding: 24 },
  eyebrow: { color: palette.orange, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: palette.ink, fontFamily: 'serif', fontSize: 30, fontWeight: '700', marginTop: 3, marginBottom: 20 },
  item: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: palette.line, paddingVertical: 15 },
  itemCopy: { flex: 1 },
  bookName: { color: palette.ink, fontSize: 16, fontWeight: '700' },
  bookAuthor: { color: palette.muted, fontSize: 12, marginTop: 3 },
  itemPrice: { color: palette.orange, fontWeight: '700', marginTop: 8 },
  quantity: { flexDirection: 'row', alignItems: 'center', marginLeft: -8, marginTop: 2 },
  quantityText: { color: palette.ink, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  divider: { backgroundColor: palette.line, marginTop: 15, marginBottom: 12 },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { color: palette.muted },
  summaryValue: { color: palette.ink, fontWeight: '600' },
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: palette.line, paddingTop: 14, marginTop: 8 },
  totalLabel: { color: palette.ink, fontSize: 17, fontWeight: '700' },
  totalValue: { color: palette.orange, fontSize: 18, fontWeight: '800' },
  checkout: { marginTop: 20, borderRadius: 8 },
});