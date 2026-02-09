import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchMediaList, deleteMedia} from '../thunks/mediaThunks';
import {MediaState, MediaItem} from '../../types';

const initialState: MediaState = {
  mediaList: [],
  uploadedItems: [],
  selectedMedia: null,
  loading: false,
  error: null,
  refreshing: false,
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setSelectedMedia: (state, action: PayloadAction<MediaItem>) => {
      state.selectedMedia = action.payload;
    },
    clearSelectedMedia: (state) => {
      state.selectedMedia = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addMediaToList: (state, action: PayloadAction<MediaItem>) => {
      state.uploadedItems.unshift(action.payload);
      state.mediaList.unshift(action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMediaList.pending, (state, action) => {
        if (action.meta.arg?.refresh) {
          state.refreshing = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchMediaList.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        const fetchedIds = new Set(action.payload.map(item => item.id));
        const uniqueUploads = state.uploadedItems.filter(
          item => !fetchedIds.has(item.id),
        );
        state.mediaList = [...uniqueUploads, ...action.payload];
        state.error = null;
      })
      .addCase(fetchMediaList.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = (action.payload as string) || 'Failed to fetch media';
      })
      .addCase(deleteMedia.fulfilled, (state, action) => {
        state.mediaList = state.mediaList.filter(
          item => item.id !== action.payload,
        );
        state.uploadedItems = state.uploadedItems.filter(
          item => item.id !== action.payload,
        );
      });
  },
});

export const {setSelectedMedia, clearSelectedMedia, clearError, addMediaToList} =
  mediaSlice.actions;
export default mediaSlice.reducer;
