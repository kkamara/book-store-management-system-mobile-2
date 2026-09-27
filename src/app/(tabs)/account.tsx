import { palette } from '@/components/store/StoreUI';
import { useAccounts } from '@/providers/StorefrontProvider';
import { updateAccount } from '@/services/StoreService';
import getApiErrorMessage from '@/services/getErrorMessage';
import storage from '@/storage';
import { isCustomErrorResponse } from '@/typeHandlers';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, Text, TextInput } from 'react-native-paper';

type StoredUser = { name?: string; email?: string };

export default function AccountScreen() {
  const router = useRouter();
  const { isAuth, logout, loading: authLoading } = useAccounts();
  const [user, setUser] = useState<StoredUser>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuth) return;
    void storage.load< { user?: StoredUser } >({ key: 'user-token' }).then(result => {
      const storedUser = result.user || {};
      setUser(storedUser);
      setName(storedUser.name || '');
      setEmail(storedUser.email || '');
    }).catch(() => setMessage('Your profile could not be loaded.'));
  }, [isAuth]);

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const saved = await updateAccount({
        name,
        email,
        password: currentPassword,
        passwordConfirmation,
        ...(newPassword ? { changePassword: newPassword, changePasswordConfirmation: newPasswordConfirmation } : {}),
      });
      setUser(saved);
      const stored = await storage.load<{ token?: string }>({ key: 'user-token' });
      await storage.save({ key: 'user-token', data: { ...stored, user: saved } });
      setCurrentPassword('');
      setPasswordConfirmation('');
      setNewPassword('');
      setNewPasswordConfirmation('');
      setMessage('Your account has been updated.');
    } catch (requestError) {
      setMessage(getApiErrorMessage(requestError, 'Could not save your changes.'));
    } finally { setBusy(false); }
  }

  async function signOut() {
    const result = await logout();
    if (isCustomErrorResponse(result)) setMessage(result.error || 'Sign out failed.');
    router.replace('/(tabs)');
  }

  if (!isAuth) return <View style={styles.center}>
    <Avatar.Icon size={64} icon="account-outline" style={styles.avatar} color={palette.ink} />
    <Text style={styles.title}>Your bookshelf.</Text>
    <Text style={styles.subtitle}>Sign in to manage your details, bag and orders.</Text>
    <Button mode="contained" buttonColor={palette.ink} onPress={() => router.push('/login')}>Sign in</Button>
    <Button textColor={palette.orange} onPress={() => router.push('/register')}>Create an account</Button>
  </View>;

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.profileHead}>
      <Avatar.Text size={58} label={(name || user.name || 'B').slice(0, 1).toUpperCase()} style={styles.avatar} color={palette.ink} />
      <View style={styles.profileCopy}>
        <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
        <Text style={styles.title}>{user.name || 'Book lover'}</Text>
      </View>
    </View>
    <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
    <TextInput label="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" mode="outlined" style={styles.input} />
    <Divider style={styles.divider} />
    <Text style={styles.section}>Change password</Text>
    <TextInput label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry mode="outlined" style={styles.input} />
    <TextInput label="Confirm new password" value={newPasswordConfirmation} onChangeText={setNewPasswordConfirmation} secureTextEntry mode="outlined" style={styles.input} />
    <Text style={styles.section}>Confirm your changes</Text>
    <TextInput label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry mode="outlined" style={styles.input} />
    <TextInput label="Confirm current password" value={passwordConfirmation} onChangeText={setPasswordConfirmation} secureTextEntry mode="outlined" style={styles.input} />
    {message ? <Text style={styles.message}>{message}</Text> : null}
    <Button mode="contained" buttonColor={palette.ink} loading={busy} disabled={busy || authLoading || !currentPassword || !passwordConfirmation || (!!newPassword && newPassword !== newPasswordConfirmation)} onPress={() => void save()} style={styles.save}>Save changes</Button>
    <Divider style={styles.divider} />
    <Button icon="logout" textColor={palette.orange} loading={authLoading} onPress={() => void signOut()}>Sign out</Button>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36 },
  center: { flex: 1, backgroundColor: palette.paper, alignItems: 'center', justifyContent: 'center', padding: 26 },
  avatar: { backgroundColor: '#E3E9E2' },
  profileHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  profileCopy: { flex: 1 },
  eyebrow: { color: palette.orange, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: palette.ink, fontFamily: 'serif', fontSize: 26, fontWeight: '700', marginTop: 3 },
  subtitle: { color: palette.muted, textAlign: 'center', lineHeight: 21, marginTop: 9, marginBottom: 18 },
  input: { backgroundColor: palette.white, marginBottom: 11 },
  divider: { backgroundColor: palette.line, marginVertical: 15 },
  section: { color: palette.ink, fontSize: 15, fontWeight: '700', marginBottom: 11 },
  message: { color: palette.leaf, marginBottom: 10 },
  save: { borderRadius: 8, marginTop: 6 },
});