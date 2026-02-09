import {LoginCredentials, AuthResponse} from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return new Promise<AuthResponse>((resolve, reject) => {
      setTimeout(() => {
        if (
          credentials.email === 'demo@example.com' &&
          credentials.password === 'password123'
        ) {
          resolve({
            user: {
              id: '1',
              name: 'Demo User',
              email: credentials.email,
            },
            token: 'mock-jwt-token-' + Date.now(),
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    throw new Error('Registration not implemented');
  },

  forgotPassword: async (email: string): Promise<{message: string}> => {
    throw new Error('Forgot password not implemented');
  },
};
