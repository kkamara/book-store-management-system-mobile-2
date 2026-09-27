import storage from '@/storage';
import HttpService from './HttpService';

export const RegisterUserService = (
  credentials: RegisterUserServiceParams,
): Promise<RegisterResponse> => {
  const http = new HttpService();
  
  return new Promise<RegisterResponse>(async (resolve, reject) => {
    await http.postData<RegisterResponse>(
      '/user/register',
      {
        name: `${credentials.firstName} ${credentials.lastName}`.trim(),
        email: credentials.email,
        password: credentials.password,
        password_confirmation: credentials.passwordConfirmation,
      },
    )
      .then(async response => {
        return resolve(response.data);
      })
      .catch((err: Error) => reject(err));
  });
};

export const LoginUserService = (
  credentials: LoginUserServiceParams,
): Promise<LoginResponse> => {
  const http = new HttpService();
  
  return new Promise<LoginResponse>(async (resolve, reject) => {
    await http.postData<LoginResponse>('/user', credentials)
      .then(async response => {
        await storage.save({
          key: "user-token",
          data: {
            token: response.data.data?.token,
            user: {
              id: response.data.data?.id,
              name: response.data.data?.name,
              email: response.data.data?.email,
              createdAt: response.data.data?.createdAt,
              updatedAt: response.data.data?.updatedAt,
            },
          }
        });
        return resolve(response.data);
      })
      .catch((err: Error) => reject(err));
  });
};

export const LogoutUserService = async (): Promise<LogoutResponse> => {
  const http = new HttpService();

  try {
    const stored = await storage.load<StorageResponse>({ key: 'user-token' });
    if (!stored.token) return { message: 'Success' };
    const response = await http.deleteData<LogoutResponse>('/user/logout', 'user-token');
    return response.data;
  } finally {
    await storage.remove({ key: 'user-token' });
  }
};

export const AuthoriseUserService = (): Promise<AuthoriseResponse> => {
  const http = new HttpService();
  
  return new Promise<AuthoriseResponse>(async (resolve, reject) => {
    await http.getData<AuthoriseResponse>('/user/authorize', "user-token")
      .then(async response => {
        return resolve(response.data);
      })
      .catch((err: Error) => reject(err));
  });
};
