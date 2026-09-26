type RegisterUserServiceParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type LoginUserServiceParams = {
  email: string;
  password: string;
};

type Path = string;

type Item = { [key: string]: any, } | undefined;

type TokenID = string;

type RequestOptions = {
  method: string;
  headers: { [key: string]: any };
  data?: Item;
  Authorization?: string;
};

type LoginCredentials = LoginUserServiceParams;

type Login = (loginCreds: LoginCredentials) => Promise<LoginResponse|CustomError>;

type UserResponse = {
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarPath?: string;
  createdAt?: string;
  updatedAt?: string;
};

type LoginResponse = {
  data?: {
    user?: {
      token?: string;
    } & UserResponse;
  };
};

type ServerError = {
  message?: string;
};

type CustomError = {
  error?: string;
};

type Logout = () => Promise<LogoutResponse|CustomError>;

type LogoutResponse = {
  message?: string; 
};

type RegisterCredentials = RegisterUserServiceParams;

type Register = (registerCreds: RegisterCredentials) => Promise<RegisterResponse|CustomError>;

type RegisterResponse = {
  user?: UserResponse;
};

type UpdateAccountResponse = {
  data?: UserResponse;
};

type UpdateAccount = (updateCreds: UpdateAccountCredentials) => Promise<UpdateAccountResponse|CustomError>;

type UpdateAccountCredentials = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type StorageResponse = {
  token?: string;
  user?: UserResponse;
};

type Loading = boolean;

type ErrorType = string|null;

type Authorise = () => Promise<AuthoriseResponse|CustomError>;

type AuthoriseResponse = {
  data?: UserResponse;
};

type Authenticated = boolean;

type AvatarFile = {
  uri: string;
  type: string;
  fileName: string;
};

type UploadAvatar = (avatar: AvatarFile) => Promise<UploadAvatarResponse|CustomError>;

type UploadAvatarResponse = {
  data?: UserResponse;
};

type RemoveAvatar = () => Promise<RemoveAvatarResponse|CustomError>;

type RemoveAvatarResponse = {
  data?: UserResponse;
};
