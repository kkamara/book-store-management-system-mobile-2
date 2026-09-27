import { BookTile, ErrorState, LoadingState, palette } from '@/components/store/StoreUI';
import { Book, Category, Edition, Page, getCategories, getEditions, searchBooks } from '@/services/StoreService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Menu, Searchbar, SegmentedButtons, Text } from 'react-native-paper';

export default function SearchScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<Page<Book> | null>(null);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [edition, setEdition] = useState('');
  const [category, setCategory] = useState('');
  const [orderById, setOrderById] = useState('desc');
  const [editionMenu, setEditionMenu] = useState(false);
  const [categoryMenu, setCategoryMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadResults(page = 1, filters = { query, edition, category, orderById }) {
    setLoading(true);
    setError('');
    const params: Record<string, string | number | undefined> = {
      query: filters.query,
      category: filters.category,
      orderById: filters.orderById,
    };
    if (filters.edition) params[filters.edition] = '1';
    try {
      setBooks(await searchBooks({ ...params, page }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.all([getEditions(), getCategories()]).then(([editionItems, categoryItems]) => {
      setEditions(editionItems);
      setCategories(categoryItems);
    }).catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Please try again.'));
    void loadResults();
  }, []);

  function clearFilters() {
    setQuery('');
    setEdition('');
    setCategory('');
    setOrderById('desc');
    void loadResults(1, { query: '', edition: '', category: '', orderById: 'desc' });
  }

  function changeSort(value: string) {
    setOrderById(value);
    void loadResults(1, { query, edition, category, orderById: value });
  }

  const selectedEdition = editions.find(item => item.filterKey === edition)?.name || 'Any edition';
  const selectedCategory = categories.find(item => item.name === category)?.name || 'Any category';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>YOUR NEXT READ</Text>
      <Text style={styles.title}>Find a book</Text>
      <Searchbar placeholder="Title, author, ISBN..." value={query} onChangeText={setQuery} onSubmitEditing={() => void loadResults()} style={styles.searchbar} />

      <View style={styles.filters}>
        <Menu visible={editionMenu} onDismiss={() => setEditionMenu(false)} anchor={<Button mode="outlined" textColor={palette.ink} onPress={() => setEditionMenu(true)}>{selectedEdition}</Button>}>
          <Menu.Item title="Any edition" onPress={() => { setEdition(''); setEditionMenu(false); }} />
          {editions.map(item => <Menu.Item key={item.filterKey} title={item.name} onPress={() => { setEdition(item.filterKey); setEditionMenu(false); }} />)}
        </Menu>
        <Menu visible={categoryMenu} onDismiss={() => setCategoryMenu(false)} anchor={<Button mode="outlined" textColor={palette.ink} onPress={() => setCategoryMenu(true)}>{selectedCategory}</Button>}>
          <Menu.Item title="Any category" onPress={() => { setCategory(''); setCategoryMenu(false); }} />
          {categories.map(item => <Menu.Item key={item.id} title={item.name} onPress={() => { setCategory(item.name); setCategoryMenu(false); }} />)}
        </Menu>
      </View>

      <SegmentedButtons value={orderById} onValueChange={changeSort} buttons={[
        { value: 'desc', label: 'Newest first' },
        { value: 'asc', label: 'Oldest first' },
      ]} style={styles.sort} />
      <View style={styles.actions}>
        <Button mode="contained" buttonColor={palette.ink} onPress={() => void loadResults()}>Apply filters</Button>
        <Button onPress={clearFilters}>Clear</Button>
      </View>

      <View style={styles.resultsHead}>
        <Text style={styles.resultTitle}>The collection</Text>
        {books ? <Text style={styles.resultCount}>{books.meta.total} results</Text> : null}
      </View>
      {loading ? <LoadingState label="Searching the shelves" /> : error ? <ErrorState message={error} onRetry={() => void loadResults(books?.meta.currentPage ?? 1)} /> : (
        <>
          {books?.data.length ? <View style={styles.grid}>
            {books.data.map(book => <BookTile key={book.id} book={book} onPress={() => router.push({ pathname: '/book/[slug]', params: { slug: book.slug } } as never)} />)}
          </View> : <Text style={styles.noResults}>No titles match these filters.</Text>}
          {books && books.meta.lastPage > 1 ? <View style={styles.pagination}>
            <Button compact disabled={books.meta.currentPage <= 1} onPress={() => void loadResults(books.meta.currentPage - 1)}>Previous</Button>
            <Text style={styles.resultCount}>{books.meta.currentPage} / {books.meta.lastPage}</Text>
            <Button compact disabled={books.meta.currentPage >= books.meta.lastPage} onPress={() => void loadResults(books.meta.currentPage + 1)}>Next</Button>
          </View> : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { paddingHorizontal: 20, paddingTop: 23, paddingBottom: 30 },
  eyebrow: { color: palette.orange, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: palette.ink, fontFamily: 'serif', fontSize: 30, fontWeight: '700', marginTop: 3, marginBottom: 16 },
  searchbar: { backgroundColor: palette.white, borderRadius: 8 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, marginBottom: 14 },
  sort: { marginBottom: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 22 },
  resultsHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: palette.line, paddingBottom: 10, marginBottom: 14 },
  resultTitle: { color: palette.ink, fontSize: 19, fontFamily: 'serif', fontWeight: '700' },
  resultCount: { color: palette.muted, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  noResults: { textAlign: 'center', color: palette.muted, paddingVertical: 40 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderColor: palette.line, paddingTop: 12 },
});