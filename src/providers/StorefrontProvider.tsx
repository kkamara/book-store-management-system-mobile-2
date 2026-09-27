import {
    AuthoriseUserService,
    LoginUserService,
    LogoutUserService,
    RegisterUserService,
} from '@/services/AuthService';
import getApiErrorMessage from '@/services/getErrorMessage';
import {
    PropsWithChildren,
    createContext,
    useContext,
    useState,
} from 'react';

type StorefrontContextValue = {
  loading: boolean;
  isAuth: boolean;
  setIsAuth: (authenticated: boolean) => void;
  login: Login;
  register: Register;
  logout: Logout;
  authorise: Authorise;
};

const StorefrontContext = createContext<StorefrontContextValue>({
  loading: false,
  isAuth: false,
  setIsAuth: () => {},
  login: async () => ({ error: 'Authentication is unavailable.' }),
  register: async () => ({ error: 'Registration is unavailable.' }),
  logout: async () => ({ error: 'Sign out is unavailable.' }),
  authorise: async () => ({ error: 'Authentication is unavailable.' }),
});

export default function StorefrontProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  const login: Login = async credentials => {
    setLoading(true);
    try {
      const response = await LoginUserService(credentials);
      setIsAuth(true);
      return response;
    } catch (error) {
      return { error: getApiErrorMessage(error, 'Unable to sign in.') };
    } finally {
      setLoading(false);
    }
  };

  const register: Register = async credentials => {
    setLoading(true);
    try {
      return await RegisterUserService(credentials);
    } catch (error) {
      return { error: getApiErrorMessage(error, 'Unable to create your account.') };
    } finally {
      setLoading(false);
    }
  };

  const logout: Logout = async () => {
    setLoading(true);
    try {
      return await LogoutUserService();
    } catch (error) {
      return { error: getApiErrorMessage(error, 'Unable to sign out.') };
    } finally {
      setIsAuth(false);
      setLoading(false);
    }
  };

  const authorise: Authorise = async () => {
    setLoading(true);
    try {
      return await AuthoriseUserService();
    } catch (error) {
      return { error: getApiErrorMessage(error, 'Unable to verify your session.') };
    } finally {
      setLoading(false);
    }
  };

  return (
    <StorefrontContext.Provider value={{ loading, isAuth, setIsAuth, login, register, logout, authorise }}>
      {children}
    </StorefrontContext.Provider>
  );
}

export const useAccounts = () => useContext(StorefrontContext);
