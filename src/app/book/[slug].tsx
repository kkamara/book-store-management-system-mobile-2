import { ErrorState, LoadingState, palette } from '@/components/store/StoreUI';
import { useAccounts } from '@/providers/StorefrontProvider';
import { Book, Page, Review, addToCart, getBook, getReviews } from '@/services/StoreService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, Snackbar, Text } from 'react-native-paper';

export default function BookDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { isAuth } = useAccounts();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Page<Review> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadReviews(page = 1) {
    if (!slug) return;
    try { setReviews(await getReviews(slug, page)); } catch { setReviews(null); }
  }

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([getBook(slug), getReviews(slug)])
      .then(([bookDetails, reviewPage]) => { setBook(bookDetails); setReviews(reviewPage); })
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'This book could not be loaded.'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleAddToCart() {
    if (!isAuth) {
      router.push('/login');
      return;
    }
    if (!book) return;
    setBusy(true);
    try {
      await addToCart(book.id);
      setNotice('Added to your bag');
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : 'Could not add this book.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState label="Opening the book" />;
  if (error || !book) return <ScrollView contentContainerStyle={styles.content}><ErrorState message={error || 'This title could not be found.'} onRetry={() => router.back()} /></ScrollView>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.bookTop}>
        <View style={styles.coverFrame}>
          {book.jpgImageURL ? <Image source={{ uri: book.jpgImageURL }} style={styles.cover} resizeMode="contain" /> : <Ionicons name="book-outline" size={45} color={palette.leaf} />}
        </View>
        <View style={styles.details}>
          <Text style={styles.eyebrow}>{book.publisher || 'BOOK STORE 2'}</Text>
          <Text style={styles.title}>{book.name}</Text>
          <Text style={styles.author}>by {book.author || 'Unknown author'}</Text>
          {book.ratingAverage ? <View style={styles.rating}><Ionicons name="star" size={15} color={palette.orange} /><Text style={styles.ratingText}>{book.ratingAverage}</Text></View> : null}
          <Text style={styles.price}>£{book.cost}</Text>
          <Button mode="contained" buttonColor={palette.ink} loading={busy} disabled={busy} icon="bag-plus-outline" onPress={() => void handleAddToCart()}>
            {isAuth ? 'Add to bag' : 'Sign in to add'}
          </Button>
        </View>
      </View>
      <View style={styles.chips}>{book.categories.map(item => <Chip key={item.id} compact style={styles.chip}>{item.name}</Chip>)}</View>
      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>About this edition</Text>
      <View style={styles.facts}>
        <Fact label="Publisher" value={book.publisher} />
        <Fact label="Published" value={book.published} />
        <Fact label="Binding" value={book.binding} />
        <Fact label="Edition" value={book.edition} />
      </View>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{book.description || 'No description available.'}</Text>
      <Divider style={styles.divider} />
      <View style={styles.reviewHeading}>
        <Text style={styles.sectionTitle}>Reader reviews</Text>
        {book.ratingAverage ? <Text style={styles.reviewAverage}>★ {book.ratingAverage}</Text> : null}
      </View>
      {reviews?.data.length ? reviews.data.map(review => <View key={review.id} style={styles.review}>
        <View style={styles.reviewRating}><Ionicons name="star" size={14} color={palette.orange} /><Text style={styles.reviewRatingText}>{review.rating} / 5</Text></View>
        <Text style={styles.reviewText}>{review.text}</Text>
        <Text style={styles.reviewMeta}>{review.user?.name || 'Reader'} · {new Date(review.createdAt).toLocaleDateString()}</Text>
      </View>) : <Text style={styles.reviewEmpty}>No reviews yet.</Text>}
      {reviews && reviews.meta.lastPage > 1 ? <View style={styles.pagination}>
        <Button compact disabled={reviews.meta.currentPage <= 1} onPress={() => void loadReviews(reviews.meta.currentPage - 1)}>Previous</Button>
        <Text style={styles.reviewMeta}>{reviews.meta.currentPage} / {reviews.meta.lastPage}</Text>
        <Button compact disabled={reviews.meta.currentPage >= reviews.meta.lastPage} onPress={() => void loadReviews(reviews.meta.currentPage + 1)}>Next</Button>
      </View> : null}
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} action={{ label: 'Dismiss', onPress: () => setNotice('') }}>{notice}</Snackbar>
    </ScrollView>
  );
}

function Fact({ label, value }: { label: string; value?: string }) {
  return <View style={styles.fact}><Text style={styles.factLabel}>{label}</Text><Text style={styles.factValue}>{value || '—'}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36 },
  bookTop: { flexDirection: 'row', gap: 17, alignItems: 'flex-start' },
  coverFrame: { width: '40%', height: 238, backgroundColor: '#EFECE4', borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cover: { width: '100%', height: '100%' },
  details: { flex: 1, gap: 8 },
  eyebrow: { color: palette.orange, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: palette.ink, fontFamily: 'serif', fontSize: 23, fontWeight: '700', lineHeight: 28 },
  author: { color: palette.muted, fontSize: 13 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: palette.ink, fontWeight: '700' },
  price: { color: palette.orange, fontSize: 22, fontWeight: '800', marginVertical: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 18 },
  chip: { backgroundColor: palette.pale },
  divider: { marginVertical: 20, backgroundColor: palette.line },
  sectionTitle: { color: palette.ink, fontFamily: 'serif', fontSize: 21, fontWeight: '700', marginBottom: 12 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 22 },
  fact: { width: '50%', paddingVertical: 8 },
  factLabel: { color: palette.muted, fontSize: 11 },
  factValue: { color: palette.ink, fontSize: 14, fontWeight: '600', marginTop: 3 },
  description: { color: '#46554D', fontSize: 15, lineHeight: 24 },
  reviewHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewAverage: { color: palette.orange, fontWeight: '800', marginBottom: 12 },
  review: { borderBottomWidth: 1, borderColor: palette.line, paddingVertical: 13, gap: 7 },
  reviewRating: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  reviewRatingText: { color: palette.ink, fontWeight: '700', fontSize: 12 },
  reviewText: { color: '#46554D', lineHeight: 21 },
  reviewMeta: { color: palette.muted, fontSize: 11 },
  reviewEmpty: { color: palette.muted, paddingBottom: 14 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
});