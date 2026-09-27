import HttpService from '@/services/HttpService';

export type Page<T> = {
  data: T[];
  meta: { currentPage: number; lastPage: number; total: number };
};

export type Category = { id: number; name: string };

export type Book = {
  id: number;
  slug: string;
  name: string;
  description: string;
  jpgImageURL: string;
  cost: string;
  ratingAverage: number | null;
  binding: string;
  edition: string;
  author: string;
  published: string;
  publisher: string;
  categories: Category[];
};

export type CartItem = { id: number; quantity: number; cost: string; book: Book };

export type Order = {
  id: number;
  referenceNumber: string;
  status: string;
  createdAt: string;
  cost: string;
  deliveryCost: string;
  totalCost: string;
};

export type Review = {
  id: number;
  rating: number;
  text: string;
  createdAt: string;
  user: { name: string };
};

export type Edition = { name: string; filterKey: string };

const http = new HttpService();
const tokenKey = 'user-token';

export const getHome = (page = 1) =>
  http.getData<Page<Book>>(`/?page=${page}`).then(response => response.data);

export const searchBooks = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return http.getData<Page<Book>>(`/books/search?${query.toString()}`).then(response => response.data);
};

export const getEditions = () =>
  http.getData<{ data: Edition[] }>('/books/search/editions').then(response => response.data.data);

export const getCategories = () =>
  http.getData<{ data: Category[] }>('/books/search/categories').then(response => response.data.data);

export const getBook = (slug: string) =>
  http.getData<{ data: Book }>(`/books/${encodeURIComponent(slug)}`).then(response => response.data.data);

export const getReviews = (slug: string, page = 1) =>
  http.getData<Page<Review>>(`/books/${encodeURIComponent(slug)}/reviews?page=${page}`).then(response => response.data);

export const getCart = () =>
  http.getData<{ data: CartItem[] }>('/cart', tokenKey).then(response => response.data.data);

export const addToCart = (bookId: number) =>
  http.postData<{ data: CartItem[] }>('/cart', { cart: { bookId } }, tokenKey).then(response => response.data.data);

export const removeFromCart = (bookId: number) =>
  http.postData<{ data: CartItem[] }>('/cart/remove', { cart: { bookId } }, tokenKey).then(response => response.data.data);

export const getOrders = (page = 1, query = '') => {
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set('query', query);
  return http.getData<Page<Order>>(`/orders?${params.toString()}`, tokenKey).then(response => response.data);
};

export const getOrder = (referenceNumber: string) =>
  http.getData<{ data: Order }>(`/orders/${encodeURIComponent(referenceNumber)}`, tokenKey).then(response => response.data.data);

export const getOrderBooks = (referenceNumber: string) =>
  http.getData<{ data: Book[] }>(`/orders/${encodeURIComponent(referenceNumber)}/products`, tokenKey).then(response => response.data.data);

export const updateAccount = (values: {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  changePassword?: string;
  changePasswordConfirmation?: string;
}) => http.patchData<{ data: { id: number; name: string; email: string } }>(
  '/user/account', values, tokenKey,
).then(response => response.data.data);