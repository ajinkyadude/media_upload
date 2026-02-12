import {createAsyncThunk} from '@reduxjs/toolkit';
import {uploadService} from '../../services/uploadService';
import {updateProgress} from '../slices/uploadSlice';
import {addMediaToList} from '../slices/mediaSlice';
import {MediaData, UploadedMedia, MediaItem} from '../../types';
import type {AppDispatch} from '../store';

export const uploadMedia = createAsyncThunk<
  UploadedMedia,
  MediaData,
  {dispatch: AppDispatch; rejectValue: string}
>('upload/media', async (mediaData, {dispatch, rejectWithValue}) => {
  try {
    const response = await uploadService.uploadFile(
      mediaData,
      (progress: number) => {
        dispatch(updateProgress(progress));
      },
    );

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

    return uploadedData;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Upload failed';
    return rejectWithValue(message);
  }
});
