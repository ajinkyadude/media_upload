import {storageService} from './storageService';
import {MediaData, UploadedMedia, ApiResponse} from '../types';

type ProgressCallback = (progress: number) => void;

export const uploadService = {
  uploadFile: async (
    mediaData: MediaData,
    onProgress: ProgressCallback,
  ): Promise<ApiResponse<UploadedMedia>> => {
    return new Promise<ApiResponse<UploadedMedia>>((resolve, _reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            resolve({
              data: {
                id: Date.now().toString(),
                url: mediaData.uri,
                type: mediaData.type,
                size: mediaData.size,
                createdAt: new Date().toISOString(),
              },
            });
          }, 500);
        }
      }, 300);
    });
  },

  cancelUpload: (cancelToken: {cancel: (msg: string) => void} | null): void => {
    if (cancelToken) {
      cancelToken.cancel('Upload cancelled by user');
    }
  },
};
