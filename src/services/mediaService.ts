import AsyncStorage from '@react-native-async-storage/async-storage';
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

const mockMediaItems: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    title: 'Sample Image 1',
    url: 'https://picsum.photos/200/300',
    thumbnail: 'https://picsum.photos/100/150',
    size: 1024000,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'video',
    title: 'Sample Video 1',
    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnail: 'https://picsum.photos/100/150',
    size: 5120000,
    duration: 120,
    createdAt: new Date().toISOString(),
  },
];

export const mediaService = {
  getMediaList: async (
    _params?: FetchMediaParams,
  ): Promise<ApiResponse<MediaItem[]>> => {
    const deletedIds = await loadDeletedIds();
    return new Promise<ApiResponse<MediaItem[]>>(resolve => {
      setTimeout(() => {
        const filteredItems = mockMediaItems.filter(
          item => !deletedIds.has(item.id),
        );
        resolve({
          data: filteredItems,
        });
      }, 1000);
    });
  },

  getMediaById: async (id: string): Promise<MediaItem> => {
    throw new Error(`getMediaById not implemented for id: ${id}`);
  },

  deleteMedia: async (id: string): Promise<{success: boolean}> => {
    const deletedIds = await loadDeletedIds();
    deletedIds.add(id);
    deletedIdsCache = deletedIds;
    await saveDeletedIds(deletedIds);

    return new Promise<{success: boolean}>(resolve => {
      setTimeout(() => {
        resolve({success: true});
      }, 500);
    });
  },
};
