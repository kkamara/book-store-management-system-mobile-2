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
};

type LoginCredentials = LoginUserServiceParams;

type Login = (loginCreds: LoginCredentials) => Promise<LoginResponse|CustomError>;

type UserResponse = {
  id?: number;
  name?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
};

type LoginResponse = {
  data?: UserResponse & { token?: string };
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
  data?: UserResponse & { token?: string };
};

type StorageResponse = {
  token?: string;
  user?: UserResponse;
};

type Authorise = () => Promise<AuthoriseResponse|CustomError>;

type AuthoriseResponse = {
  data?: UserResponse;
};

