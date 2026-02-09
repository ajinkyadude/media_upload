import {createAsyncThunk} from '@reduxjs/toolkit';
import {authService} from '../../services/authService';
import {storageService} from '../../services/storageService';
import {LoginCredentials, AuthResponse} from '../../types';

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  {rejectValue: string}
>('auth/login', async (credentials, {rejectWithValue}) => {
  try {
    const response = await authService.login(credentials);
    await storageService.setToken(response.token);
    await storageService.setUser(response.user);
    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Login failed';
    return rejectWithValue(message);
  }
});

export const logoutUser = createAsyncThunk<boolean>(
  'auth/logout',
  async () => {
    try {
      await storageService.clearAuth();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return true;
    }
  },
);

export const checkAuthStatus = createAsyncThunk<
  AuthResponse | null,
  void,
  {rejectValue: string}
>('auth/checkStatus', async (_, {rejectWithValue}) => {
  try {
    const token = await storageService.getToken();
    const user = await storageService.getUser();

    if (token && user) {
      return {token, user};
    }
    return null;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Auth check failed';
    return rejectWithValue(message);
  }
});
