import {
  AuthoriseUserService,
  LoginUserService,
  LogoutUserService,
  RegisterUserService,
  RemoveAvatarService,
  UploadAvatarService,
} from "@/services/AuthService";
import HttpService from "@/services/HttpService";
import storage from "@/storage";
import axios from "axios";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";

type AccountType = {
  loading: Loading;
  login: Login;
  logout: Logout;
  register: Register;
  updateAccount: UpdateAccount;
  authorise: Authorise;
  isAuth: Authenticated;
  setIsAuth: (auth: Authenticated) => void;
  uploadAvatar: UploadAvatar;
  removeAvatar: RemoveAvatar;
};

const AccountContext = createContext<AccountType>({
  loading: false,
  login: async ({}) => ({ error: "Not implemented.", }),
  logout: async () => ({ error: "Not implemented.", }),
  register: async ({}) => ({ error: "Not implemented.", }),
  updateAccount: async () => (({ error: "Not implemented", })),
  authorise: async () => (({ error: "Not implemented", })),
  isAuth: false,
  setIsAuth: (auth: Authenticated) => {},
  uploadAvatar: async () => (({ error: "Not implemented", })),
  removeAvatar: async () => (({ error: "Not implemented", })),
});

const AccountsProvider = ({ children, }: PropsWithChildren) => {
  const [loading, setLoading] = useState<Loading>(false);
  const [isAuth, setIsAuth] = useState<Authenticated>(false);

  const login = async (loginCreds: LoginCredentials): Promise<LoginResponse|CustomError> => {
    setLoading(true);
    const response = await LoginUserService(loginCreds)
      .then(res => res)
      .catch((err: Error) => err);
    if (response instanceof Error) {
      if (axios.isAxiosError<ServerError>(response)) {
        if ("ERR_NETWORK" === response.code) {
          setLoading(false);
          return { error: "Server unavailable.", };
        } else {
          setLoading(false);
          return { error: response.response?.data?.message, };
        }
      } else {
        setLoading(false);
        return { error: response.message, };
      }
    } else {
      setLoading(false);
      setIsAuth(true);
      return response;
    }
  };

  const register = async (registerCreds: RegisterCredentials): Promise<RegisterResponse|CustomError> => {
    setLoading(true);
    const response = await RegisterUserService(registerCreds)
      .then(res => res)
      .catch((err: Error) => err);
    
    if (response instanceof Error) {
      if (axios.isAxiosError<ServerError>(response)) {
        if ("ERR_NETWORK" === response.code) {
          setLoading(false);
          return { error: "Server unavailable.", };
        } else {
          setLoading(false);
          return { error: response.response?.data?.message, };
        }
      } else {
        setLoading(false);
        return { error: response.message, };
      }
    } else {
      setLoading(false);
      return response;
    }
  };

  const logout = async (): Promise<LogoutResponse|CustomError> => {
    setLoading(true);
    try {
      const logoutResponse = await LogoutUserService();
      if (false === logoutResponse) {
        return { message: "Success" };
      }
      return logoutResponse as LogoutResponse;
    } catch (err) {
      if (err instanceof Error) {
        if (axios.isAxiosError<ServerError>(err)) {
          if ("ERR_NETWORK" === err.code) {
            return { error: "Server unavailable.", };
          } else {
            return { message: "Success" };
          }
        } else {
          return { message: "Success" };
        }
      }
      return { message: "Success" };
    } finally {
      setIsAuth(false);
      setLoading(false);
    }
  };

  const updateAccount = async (updateCreds: UpdateAccountCredentials): Promise<UpdateAccountResponse|CustomError> => {
    setLoading(true);
    const http = new HttpService();
    try {
      const storageRes = await storage.load<StorageResponse>({
        key: "user-token",
      });
      const params: {[key: string]: any} = {};
      if (updateCreds.firstName) {
        params.firstName = updateCreds.firstName;
      }
      if (updateCreds.lastName) {
        params.lastName = updateCreds.lastName;
      }
      if (updateCreds.email) {
        params.email = updateCreds.email;
      }
      if (updateCreds.password) {
        params.password = updateCreds.password;
      }
      if (updateCreds.passwordConfirmation) {
        params.passwordConfirmation = updateCreds.passwordConfirmation;
      }
      const updateAccountResult = await http.patchData<UpdateAccountResponse>(
          '/user',
          params,
          "user-token",
        )
        .then(async response => {
          try {
            await storage.save({
              key: "user-token",
              data: {
                token: storageRes.token,
                user: {
                  id: response.data.data?.id,
                  email: response.data.data?.email,
                  firstName: response.data.data?.firstName,
                  lastName: response.data.data?.lastName,
                  avatarPath: response.data.data?.avatarPath,
                  createdAt: response.data.data?.createdAt,
                  updatedAt: response.data.data?.updatedAt,
                },
              },
            })
          } catch (err) {
            return err;
          }
          return response.data;
        })
        .catch((err: Error) => err);
      
      if (updateAccountResult instanceof Error) {
        if (axios.isAxiosError<ServerError>(updateAccountResult)) {
          if ("ERR_NETWORK" === updateAccountResult.code) {
            return { error: "Server unavailable.", };
          } else {
            return { error: updateAccountResult.response?.data?.message, };
          }
        } else {
          return { error: updateAccountResult.message };
        }
      } else {
        return updateAccountResult as UpdateAccountResponse;
      }
    } catch (err) {
      if (err instanceof Error) {
        return { error: err.message };
      }
    } finally {
      setLoading(false);
    }
    return { error: "Something unexpected happened. Please try again.", };
  };

  const authorise = async (): Promise<AuthoriseResponse|CustomError> => {
    setLoading(true);
    const response = await AuthoriseUserService()
      .then(res => res)
      .catch((err: Error) => err);
    if (response instanceof Error) {
      if (axios.isAxiosError<ServerError>(response)) {
        if ("ERR_NETWORK" === response.code) {
          setLoading(false);
          return { error: "Server unavailable.", };
        } else {
          setLoading(false);
          return { error: response.response?.data?.message, };
        }
      } else {
        setLoading(false);
        return { error: response.message, };
      }
    } else {
      setLoading(false);
      return response;
    }
  };

  const uploadAvatar = async (avatar: AvatarFile): Promise<UploadAvatarResponse|CustomError> => {
    setLoading(true);
    try {
      const storageRes = await storage.load<StorageResponse>({
        key: "user-token",
      });
      const uploadAvatarResult = await UploadAvatarService(avatar)
        .then(async response => {
          try {
            await storage.save({
              key: "user-token",
              data: {
                token: storageRes.token,
                user: {
                  id: response.data?.id,
                  email: response.data?.email,
                  firstName: response.data?.firstName,
                  lastName: response.data?.lastName,
                  avatarPath: response.data?.avatarPath,
                  createdAt: response.data?.createdAt,
                  updatedAt: response.data?.updatedAt,
                },
              },
            });
          } catch (err) {
            return err;
          }
          return response;
        })
        .catch((err: Error) => err);

      if (uploadAvatarResult instanceof Error) {
        if (axios.isAxiosError<ServerError>(uploadAvatarResult)) {
          if ("ERR_NETWORK" === uploadAvatarResult.code) {
            return { error: "Server unavailable.", };
          } else {
            return { error: uploadAvatarResult.response?.data?.message, };
          }
        } else {
          return { error: uploadAvatarResult.message };
        }
      } else {
        return uploadAvatarResult as UploadAvatarResponse;
      }
    } catch (err) {
      if (err instanceof Error) {
        return { error: err.message };
      }
    } finally {
      setLoading(false);
    }
    return { error: "Something unexpected happened. Please try again.", };
  };

  const removeAvatar = async (): Promise<RemoveAvatarResponse|CustomError> => {
    setLoading(true);
    try {
      const storageRes = await storage.load<StorageResponse>({
        key: "user-token",
      });
      const uploadAvatarResult = await RemoveAvatarService()
        .then(async response => {
          try {
            await storage.save({
              key: "user-token",
              data: {
                token: storageRes.token,
                user: {
                  id: response.data?.id,
                  email: response.data?.email,
                  firstName: response.data?.firstName,
                  lastName: response.data?.lastName,
                  avatarPath: response.data?.avatarPath,
                  createdAt: response.data?.createdAt,
                  updatedAt: response.data?.updatedAt,
                },
              },
            });
          } catch (err) {
            return err;
          }
          return response;
        })
        .catch((err: Error) => err);

      if (uploadAvatarResult instanceof Error) {
        if (axios.isAxiosError<ServerError>(uploadAvatarResult)) {
          if ("ERR_NETWORK" === uploadAvatarResult.code) {
            return { error: "Server unavailable.", };
          } else {
            return { error: uploadAvatarResult.response?.data?.message, };
          }
        } else {
          return { error: uploadAvatarResult.message };
        }
      } else {
        return uploadAvatarResult as RemoveAvatarResponse;
      }
    } catch (err) {
      if (err instanceof Error) {
        return { error: err.message };
      }
    } finally {
      setLoading(false);
    }
    return { error: "Something unexpected happened. Please try again.", };
  };

  return (
    <AccountContext.Provider 
      value={{
        loading,
        login,
        logout,
        register,
        updateAccount,
        authorise,
        isAuth,
        setIsAuth,
        uploadAvatar,
        removeAvatar,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export default AccountsProvider;

export const useAccounts = () => useContext(AccountContext);