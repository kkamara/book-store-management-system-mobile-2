import Button from '@/components/Button';
import ErrorComponent from '@/components/Error';
import Loading from '@/components/Loading';
import { Text, View } from '@/components/Themed';
import { useAccounts } from '@/providers/AccountsProvider';
import { isCustomErrorResponse } from '@/typeHandlers';
import { useFocusEffect, useNavigation } from 'expo-router/react-navigation';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import UpdateAvatar from './UpdateAvatar';
import storage from '@/storage';

const defaultFirstNameState = "";
const defaultLastNameState = "";
const defaultEmailState = "";

const Settings = () => {
  const [error, setError] = useState("");
  const {
    authorise,
    updateAccount,
    loading: accountsLoading,
  } = useAccounts();
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  
  const [firstName, setFirstName] = useState(defaultFirstNameState);
  const [lastName, setLastName] = useState(defaultLastNameState);
  const [email, setEmail] = useState(defaultEmailState);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    return navigation.addListener(
      'blur',
      async () => {
        setUser(null);
        setLoading(false);
        setError("");
        setFirstName(defaultFirstNameState);
        setLastName(defaultLastNameState);
        setEmail(defaultEmailState);
        setPassword("");
        setPasswordConfirmation("");
      }
    );
  }, [])

  useFocusEffect(
    useCallback(() => {
      getUserData();
    }, [])
  );

  async function getUserData() {
    setLoading(true);
    const res = await authorise();
    if (true === isCustomErrorResponse(res)) {
      setError(res.error || "Something went wrong.");
    } else {
      console.log("Settings user data from server", res.data);
      const userRes = res.data as UserResponse;
      setUser(userRes);
      setFirstName(userRes.firstName || defaultFirstNameState);
      setLastName(userRes.lastName || defaultLastNameState);
      setEmail(userRes.email || defaultEmailState);
      setPassword("");
      setPasswordConfirmation("");
    }
    setLoading(false);
  }

  async function onUploadAvatar() {
    await getUserData();
  }

  async function onRemoveAvatar() {
    await getUserData();
  }
  
  function toggleShowPassword() {
    setShowPassword(prev => !prev);
  }
  
  async function onSubmit() {
    setLoading(true);
    setError("");
    const res = await updateAccount({
      email,
      password,
      firstName,
      lastName,
      passwordConfirmation,
    });
    if (true === isCustomErrorResponse(res)) {
      setError(res.error || "Something went wrong.");
    } else {
      const updateAccountRes = res.data as UserResponse;
      setFirstName(updateAccountRes.firstName || defaultFirstNameState);
      setLastName(updateAccountRes.lastName || defaultLastNameState);
      setEmail(updateAccountRes.email || defaultEmailState);

      try {
        const storageRes = await storage.load({
          key: "user-token",
        });
        await storage.save({
          key: "user-token",
          data: {
            token: storageRes.token,
            user: {
              id: updateAccountRes.id,
              email: updateAccountRes.email,
              firstName: updateAccountRes.firstName,
              lastName: updateAccountRes.lastName,
              avatarPath: updateAccountRes.avatarPath,
              createdAt: updateAccountRes.createdAt,
              updatedAt: updateAccountRes.updatedAt,
            },
          },
        });
      } catch (err) {
        setError((err as Error).message);
      }

      alert("You have updated your account successfully.");
    }
    setPassword("");
    setPasswordConfirmation("");
    setLoading(false);
  }

  if (loading || accountsLoading) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={'ios' === Platform.OS ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.titleView}>
            <Text style={styles.title}>Settings</Text>
          </View>
          <ErrorComponent style={styles.errorView} error={error} />
          <UpdateAvatar
            user={user}
            setError={setError}
            setLoading={setLoading}
            onUploadAvatar={onUploadAvatar}
            onRemoveAvatar={onRemoveAvatar}
          />
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.textLabel}>First Name:*</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.textLabel}>Last Name:*</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.textLabel}>Email:*</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType='email-address'
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.textLabel}>Password:</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={showPassword === false}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.textLabel}>Confirm Password:</Text>
              <TextInput
                style={styles.input}
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                placeholder="Enter your password confirmation"
                secureTextEntry={showPassword === false}
              />
              <View style={styles.showPasswordView}>
                <Button
                  pressableStyle={styles.showPasswordBtn}
                  textStyle={styles.showPasswordBtnText}
                  text={showPassword ? "Hide Password" : "Show Password"}
                  onPress={toggleShowPassword}
                />
              </View>
            </View>
            <Button
              pressableStyle={styles.button}
              text="Submit"
              onPress={onSubmit}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    width: "100%",
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingBottom: 100,
  },
  titleView: {
    width: 300,
  },
  title: {
    fontSize: 26,
    borderBottomWidth: 1,
    textAlign: 'center',
  },
  errorView: {
    marginTop: 15,
    marginBottom: 20,
  },
  formGroup: {
    marginTop: 25,
  },
  textLabel: {
    fontWeight: 'bold',
  },
  input: {
    width: 300,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
  },
  showPasswordView: {
    flex: 1,
    maxHeight: 50,
    justifyContent: "flex-end",
    alignItems: 'flex-end',
  },
  showPasswordBtn: {
    width: 120,
    backgroundColor: "grey",
    borderColor: "#000",
    height: 40,
  },
  showPasswordBtnText: {
    fontSize: 10,
    color: "#fff",
    marginVertical: -2.2,
  },
  button: {
    marginTop: 40,
    width: 310,
  },
  form: {
    marginTop: 80,
  },
});

export default Settings;
