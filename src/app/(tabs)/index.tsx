import { BookTile, ErrorState, LoadingState, palette } from '@/components/store/StoreUI';
import { Book, getHome, Page } from '@/services/StoreService';
import getApiErrorMessage from '@/services/getErrorMessage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function DiscoverScreen() {
  const router = useRouter();
  const [page, setPage] = useState<Page<Book> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadPage(pageNumber = 1) {
    setLoading(true);
    setError('');
    try {
      setPage(await getHome(pageNumber));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Please check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadPage(); }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topline}>
        <View>
          <Text style={styles.eyebrow}>BOOK STORE 2</Text>
          <Text style={styles.brand}>Good pages, good company.</Text>
        </View>
        <Button mode="contained-tonal" compact onPress={() => router.push({ pathname: '/(tabs)/search' } as never)} icon="magnify">
          Browse
        </Button>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>A LITTLE SOMETHING FOR YOUR NEXT CHAPTER</Text>
          <Text style={styles.heroTitle}>Find a story you didn't know you needed.</Text>
          <Text style={styles.heroDescription}>Thoughtful reads, fresh arrivals, and old favourites waiting to be found.</Text>
          <Button mode="contained" buttonColor={palette.orange} textColor={palette.white} icon="arrow-right" onPress={() => router.push({ pathname: '/(tabs)/search' } as never)}>
            Explore books
          </Button>
        </View>
        <View style={styles.heroArt}>
          <Ionicons name="book-outline" size={44} color="#F5D6B7" />
          <Text style={styles.heroArtText}>TURN THE PAGE</Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionEyebrow}>FRESH ON THE SHELVES</Text>
          <Text style={styles.sectionTitle}>Just added</Text>
        </View>
        {page ? <Text style={styles.count}>{page.meta.total} titles</Text> : null}
      </View>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => void loadPage(page?.meta.currentPage ?? 1)} /> : (
        <>
          {page?.data.length ? (
            <View style={styles.grid}>
              {page.data.map(book => <BookTile key={book.id} book={book} onPress={() => router.push({ pathname: '/book/[slug]', params: { slug: book.slug } } as never)} />)}
            </View>
          ) : <Text style={styles.empty}>Nothing on this shelf yet.</Text>}
          {page && page.meta.lastPage > 1 ? (
            <View style={styles.pagination}>
              <Button compact disabled={page.meta.currentPage <= 1} onPress={() => void loadPage(page.meta.currentPage - 1)}>Previous</Button>
              <Text style={styles.pageText}>{page.meta.currentPage} / {page.meta.lastPage}</Text>
              <Button compact disabled={page.meta.currentPage >= page.meta.lastPage} onPress={() => void loadPage(page.meta.currentPage + 1)}>Next</Button>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 30 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  eyebrow: { color: palette.orange, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  brand: { color: palette.ink, fontFamily: 'serif', fontSize: 21, fontWeight: '700', marginTop: 3 },
  hero: { minHeight: 220, backgroundColor: palette.ink, borderRadius: 12, padding: 22, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  heroCopy: { flex: 1, paddingRight: 6, gap: 10 },
  heroEyebrow: { color: '#D9AA84', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  heroTitle: { color: palette.white, fontFamily: 'serif', fontSize: 27, fontWeight: '700', lineHeight: 32 },
  heroDescription: { color: '#D6DED8', fontSize: 13, lineHeight: 19, marginBottom: 4 },
  heroArt: { width: 76, height: 116, backgroundColor: '#426353', borderRadius: 8, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] },
  heroArtText: { color: '#F5D6B7', fontSize: 7, fontWeight: '800', marginTop: 10, letterSpacing: 0.7 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 27, marginBottom: 15 },
  sectionEyebrow: { color: palette.orange, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  sectionTitle: { color: palette.ink, fontFamily: 'serif', fontSize: 25, fontWeight: '700', marginTop: 2 },
  count: { color: palette.muted, fontSize: 12, marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  empty: { color: palette.muted, paddingVertical: 35, textAlign: 'center' },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderColor: palette.line, paddingTop: 12 },
  pageText: { color: palette.muted, fontSize: 12 },
});
