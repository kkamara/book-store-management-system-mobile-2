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

export const LogoutUserService= (
): Promise<LogoutResponse|Boolean> => {
  const http = new HttpService();

  return new Promise<LogoutResponse|Boolean>(async (resolve, reject) => {
    let res = null;
    try {
      res = await storage.load({ key: "user-token" });
    } catch (err) {
      return resolve({ message: "User data was already removed." });
    }
    if (!res.token) {
      return resolve({ message: "Token was already removed." });
    }
    await http.deleteData<LogoutResponse>('/user/logout', "user-token")
      .then(async response => {
        try {
          await storage.remove({
            key: "user-token",
          });
        } catch (err) {
          return reject(err);
        }
        return resolve(response.data);
      })
      .catch(async (err: Error) => {
        try {
          await storage.remove({
            key: "user-token",
          });
        } catch (err) {
          return reject(err);
        }
    });
  });
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

export const UploadAvatarService = (
  avatar: AvatarFile,
): Promise<UploadAvatarResponse> => {
  const http = new HttpService();
  const formData = new FormData();
  // Laravel's PUT route cannot parse multipart bodies, so spoof the method via POST
  formData.append("_method", "PUT");
  formData.append("avatar", {
    uri: avatar.uri,
    type: avatar.type,
    name: avatar.fileName,
  } as any);

  return new Promise<UploadAvatarResponse>(async (resolve, reject) => {
    await http.postFormData<UploadAvatarResponse>('/user/avatar', formData, "user-token")
      .then(async response => {
        return resolve(response.data);
      })
      .catch((err: Error) => reject(err));
  });
};

export const RemoveAvatarService = (): Promise<RemoveAvatarResponse> => {
  const http = new HttpService();

  return new Promise<RemoveAvatarResponse>(async (resolve, reject) => {
    await http.deleteData<RemoveAvatarResponse>(
      '/user/avatar',
      "user-token",
    )
      .then(async response => {
        return resolve(response.data);
      })
      .catch((err: Error) => reject(err));
  });
};
