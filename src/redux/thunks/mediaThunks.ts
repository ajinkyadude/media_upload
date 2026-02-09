import {createAsyncThunk} from '@reduxjs/toolkit';
import {mediaService} from '../../services/mediaService';
import {MediaItem} from '../../types';

interface FetchMediaParams {
  refresh?: boolean;
}

export const fetchMediaList = createAsyncThunk<
  MediaItem[],
  FetchMediaParams | undefined,
  {rejectValue: string}
>('media/fetchList', async (params, {rejectWithValue}) => {
  try {
    const response = await mediaService.getMediaList(params);
    return response.data;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch media';
    return rejectWithValue(message);
  }
});

export const deleteMedia = createAsyncThunk<
  string,
  string,
  {rejectValue: string}
>('media/delete', async (mediaId, {rejectWithValue}) => {
  try {
    await mediaService.deleteMedia(mediaId);
    return mediaId;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete media';
    return rejectWithValue(message);
  }
});
