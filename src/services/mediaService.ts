import {MediaItem, ApiResponse} from '../types';

interface FetchMediaParams {
  refresh?: boolean;
}

export const mediaService = {
  getMediaList: async (
    _params?: FetchMediaParams,
  ): Promise<ApiResponse<MediaItem[]>> => {
    return new Promise<ApiResponse<MediaItem[]>>(resolve => {
      setTimeout(() => {
        resolve({
          data: [
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
          ],
        });
      }, 1000);
    });
  },

  getMediaById: async (id: string): Promise<MediaItem> => {
    throw new Error(`getMediaById not implemented for id: ${id}`);
  },

  deleteMedia: async (_id: string): Promise<{success: boolean}> => {
    return new Promise<{success: boolean}>(resolve => {
      setTimeout(() => {
        resolve({success: true});
      }, 500);
    });
  },
};
