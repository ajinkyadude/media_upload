import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, StorageKeys} from '../types';

export const storageService = {
  setToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(StorageKeys.TOKEN, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(StorageKeys.TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  setUser: async (user: User): Promise<void> => {
    try {
      await AsyncStorage.setItem(StorageKeys.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  getUser: async (): Promise<User | null> => {
    try {
      const user = await AsyncStorage.getItem(StorageKeys.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  clearAuth: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([StorageKeys.TOKEN, StorageKeys.USER]);
    } catch (error) {
      console.error('Error clearing auth:', error);
      throw error;
    }
  },

  setTheme: async (theme: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(StorageKeys.THEME, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  getTheme: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(StorageKeys.THEME);
    } catch (error) {
      console.error('Error getting theme:', error);
      return null;
    }
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};
