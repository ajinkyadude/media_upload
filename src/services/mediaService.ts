import AsyncStorage from '@react-native-async-storage/async-storage';
import {uploadService, SavedMediaRecord} from './uploadService';
import {MediaItem, ApiResponse} from '../types';

interface FetchMediaParams {
  refresh?: boolean;
}

const DELETED_IDS_KEY = '@media_deleted_ids';

let deletedIdsCache: Set<string> | null = null;

const loadDeletedIds = async (): Promise<Set<string>> => {
  if (deletedIdsCache !== null) {
    return deletedIdsCache;
  }
  try {
    const stored = await AsyncStorage.getItem(DELETED_IDS_KEY);
    deletedIdsCache = stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
  } catch {
    deletedIdsCache = new Set<string>();
  }
  return deletedIdsCache;
};

const saveDeletedIds = async (ids: Set<string>): Promise<void> => {
  try {
    await AsyncStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...ids]));
  } catch (err) {
    console.warn('Failed to persist deleted IDs:', err);
  }
};

const recordToMediaItem = (record: SavedMediaRecord): MediaItem => ({
  id: record.id,
  type: record.type.includes('video') ? 'video' : 'image',
  title: record.title,
  url: record.uri,
  thumbnail: record.thumbnail || record.uri,
  size: record.size,
  createdAt: record.createdAt,
});

export const mediaService = {
  getMediaList: async (
    _params?: FetchMediaParams,
  ): Promise<ApiResponse<MediaItem[]>> => {
    const deletedIds = await loadDeletedIds();

    const savedRecords = await uploadService.loadSavedMedia();
    const savedItems = savedRecords
      .map(recordToMediaItem)
      .filter(item => !deletedIds.has(item.id));

    return {
      data: savedItems,
    };
  },

  getMediaById: async (id: string): Promise<MediaItem> => {
    const savedRecords = await uploadService.loadSavedMedia();
    const record = savedRecords.find(r => r.id === id);
    if (record) {
      return recordToMediaItem(record);
    }
    throw new Error(`Media not found for id: ${id}`);
  },

  deleteMedia: async (id: string): Promise<{success: boolean}> => {
    const deletedIds = await loadDeletedIds();
    deletedIds.add(id);
    deletedIdsCache = deletedIds;
    await saveDeletedIds(deletedIds);

    await uploadService.deleteSavedMedia(id);

    return {success: true};
  },
};
