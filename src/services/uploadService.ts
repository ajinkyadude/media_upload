import AsyncStorage from '@react-native-async-storage/async-storage';
import {MediaData, UploadedMedia, ApiResponse} from '../types';

const SAVED_MEDIA_KEY = '@saved_media_records';

export interface SavedMediaRecord {
  id: string;
  uri: string;
  type: string;
  size: number;
  title: string;
  thumbnail?: string;
  createdAt: string;
}

export const uploadService = {
  saveMediaLocally: async (
    mediaData: MediaData,
  ): Promise<ApiResponse<UploadedMedia>> => {
    const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const createdAt = new Date().toISOString();

    const record: SavedMediaRecord = {
      id,
      uri: mediaData.uri,
      type: mediaData.type,
      size: mediaData.size,
      title: mediaData.title,
      thumbnail: mediaData.thumbnail,
      createdAt,
    };

    const existing = await AsyncStorage.getItem(SAVED_MEDIA_KEY);
    const records: SavedMediaRecord[] = existing ? JSON.parse(existing) : [];

    records.unshift(record);

    await AsyncStorage.setItem(SAVED_MEDIA_KEY, JSON.stringify(records));

    return {
      data: {
        id,
        url: mediaData.uri,
        type: mediaData.type,
        size: mediaData.size,
        createdAt,
      },
    };
  },

  loadSavedMedia: async (): Promise<SavedMediaRecord[]> => {
    try {
      const existing = await AsyncStorage.getItem(SAVED_MEDIA_KEY);
      return existing ? JSON.parse(existing) : [];
    } catch (err) {
      console.warn('Failed to load saved media:', err);
      return [];
    }
  },

  deleteSavedMedia: async (id: string): Promise<void> => {
    try {
      const existing = await AsyncStorage.getItem(SAVED_MEDIA_KEY);
      const records: SavedMediaRecord[] = existing ? JSON.parse(existing) : [];
      const updated = records.filter(r => r.id !== id);
      await AsyncStorage.setItem(SAVED_MEDIA_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to delete saved media:', err);
    }
  },

  cancelUpload: (): void => {},
};
