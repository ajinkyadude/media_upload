import {createAsyncThunk} from '@reduxjs/toolkit';
import {uploadService} from '../../services/uploadService';
import {updateProgress, updateChunkProgress} from '../slices/uploadSlice';
import {addMediaToList} from '../slices/mediaSlice';
import {MediaData, UploadedMedia, MediaItem, ChunkUploadProgress} from '../../types';
import type {AppDispatch, RootState} from '../store';

const CHUNK_SIZE = 5 * 1024 * 1024;
const CHUNK_DELAY_MS = 150;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(() => resolve(), ms));

export const uploadMedia = createAsyncThunk<
  UploadedMedia,
  MediaData,
  {dispatch: AppDispatch; state: RootState; rejectValue: string}
>('upload/media', async (mediaData, {dispatch, getState, rejectWithValue}) => {
  try {
    const totalBytes = mediaData.size;
    const totalChunks = Math.max(1, Math.ceil(totalBytes / CHUNK_SIZE));
    let bytesUploaded = 0;

    for (let i = 0; i < totalChunks; i++) {
      const state = getState();
      if (state.upload.isCancelled) {
        return rejectWithValue('Upload cancelled by user');
      }

      const chunkBytes = Math.min(CHUNK_SIZE, totalBytes - bytesUploaded);
      bytesUploaded += chunkBytes;

      const overallProgress = Math.round((bytesUploaded / totalBytes) * 95);

      const chunkProgress: ChunkUploadProgress = {
        totalChunks,
        uploadedChunks: i + 1,
        currentChunk: i + 1,
        bytesUploaded,
        totalBytes,
      };

      dispatch(updateProgress(overallProgress));
      dispatch(updateChunkProgress(chunkProgress));

      if (i < totalChunks - 1) {
        await delay(CHUNK_DELAY_MS);
      }
    }

    const stateBeforeSave = getState();
    if (stateBeforeSave.upload.isCancelled) {
      return rejectWithValue('Upload cancelled by user');
    }

    const response = await uploadService.saveMediaLocally(mediaData);

    const uploadedData = response.data;
    const newMediaItem: MediaItem = {
      id: uploadedData.id,
      url: uploadedData.url,
      type: uploadedData.type.includes('video') ? 'video' : 'image',
      size: uploadedData.size,
      createdAt: uploadedData.createdAt,
      title: mediaData.title || 'Untitled',
      thumbnail: mediaData.thumbnail || mediaData.uri,
    };
    dispatch(addMediaToList(newMediaItem));

    dispatch(updateProgress(100));
    dispatch(updateChunkProgress({
      totalChunks,
      uploadedChunks: totalChunks,
      currentChunk: totalChunks,
      bytesUploaded: totalBytes,
      totalBytes,
    }));

    return uploadedData;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Upload failed';
    if (message === 'Upload cancelled by user') {
      return rejectWithValue(message);
    }
    return rejectWithValue(message);
  }
});
