import Button from "@/components/Button";
import ErrorComponent from '@/components/Error';
import Loading from "@/components/Loading";
import { Text, View } from "@/components/Themed";
import { useAccounts } from "@/providers/AccountsProvider";
import { isCustomErrorResponse } from '@/typeHandlers';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from 'expo-router/react-navigation';
import { useCallback, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const defaultFirstNameState = "John";
const defaultLastNameState = "Doe";
const defaultEmailState = "john@example.com";
const defaultPasswordState = "secret";
const defaultPasswordConfirmationState = defaultPasswordState;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register, loading: accountsLoading } = useAccounts();
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState(defaultFirstNameState);
  const [lastName, setLastName] = useState(defaultLastNameState);
  const [email, setEmail] = useState(defaultEmailState);
  const [password, setPassword] = useState(defaultPasswordState);
  const [passwordConfirmation, setPasswordConfirmation] = useState(defaultPasswordConfirmationState);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigation = useNavigation();
  
  useFocusEffect(
    useCallback(() => {
      // Code here runs when the screen is FOCUSED
      return () => {
        setFirstName(defaultFirstNameState);
        setLastName(defaultLastNameState);
        setEmail(defaultEmailState);
        setPassword(defaultPasswordState);
        setPasswordConfirmation(defaultPasswordConfirmationState);
        setError("");
        setLoading(false);
        setShowPassword(false);
      };
    }, [])
  );

  function toggleShowPassword() {
    setShowPassword(prev => !prev);
  }

  async function onSubmit() {
    setLoading(true);
    setError("");
    const res = await register({
      email,
      password,
      firstName,
      lastName,
      passwordConfirmation,
    });
    if (true === isCustomErrorResponse(res)) {
      setError(res.error || "Something went wrong.");
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'index' }],
        })
      );
      alert("You have registered successfully.");
    }
    setLoading(false);
  }

  if (loading || accountsLoading) {
    return <View style={styles.container}>
      <Loading />
    </View>;
  }

  return (
    <KeyboardAvoidingView
      behavior={'ios' === Platform.OS ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <View style={styles.container}>
        <View style={styles.titleView}>
          <Text style={styles.title}>Register Screen</Text>
        </View>
        <ErrorComponent style={styles.errorView} error={error}/>
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
          <Text style={styles.textLabel}>Password:*</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={showPassword === false}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.textLabel}>Confirm Password:*</Text>
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
  },
  title: {
    fontSize: 26,
    borderBottomWidth: 1,
    textAlign: 'center',
  },
  titleView: {
    width: 300,
  },
  formGroup: {
    marginTop: 25,
  },
  errorView: {
    marginTop: 15,
  },
  input: {
    width: 300,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
  },
  textLabel: {
    fontWeight: 'bold',
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
});

export default Register;
