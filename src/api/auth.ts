import { apiClient } from './client';

export type LoginData = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userId: string;
  name: string;
};

export const loginUser = async (loginData: LoginData): Promise<LoginResponse> => {
  const { data } = await apiClient.post('/api/auth/login', loginData);
  return data;
};

export type RegisterData = {
    name: string;
    email: string;
    password: string;
  };
  
  export type RegisterResponse = {
    message: string;
    userId: string;
  };
  
export const registerUser = async (registerData: RegisterData): Promise<RegisterResponse> => {
    const { data } = await apiClient.post('/api/auth/register', registerData);
    return data;
};