import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {uploadMedia} from '../thunks/uploadThunks';
import {UploadState, ChunkUploadProgress} from '../../types';

const initialState: UploadState = {
  uploading: false,
  progress: 0,
  error: null,
  success: false,
  uploadedMedia: null,
  chunkProgress: null,
  isCancelled: false,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    resetUpload: () => initialState,
    updateProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    updateChunkProgress: (state, action: PayloadAction<ChunkUploadProgress>) => {
      state.chunkProgress = action.payload;
    },
    cancelUpload: (state) => {
      state.isCancelled = true;
      state.uploading = false;
      state.error = 'Upload cancelled by user';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(uploadMedia.pending, state => {
        state.uploading = true;
        state.progress = 0;
        state.error = null;
        state.success = false;
        state.chunkProgress = null;
        state.isCancelled = false;
      })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.uploading = false;
        state.progress = 100;
        state.success = true;
        state.uploadedMedia = action.payload;
        state.error = null;
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.uploading = false;
        if (!state.isCancelled) {
          state.error = (action.payload as string) || 'Upload failed';
        }
        state.success = false;
      });
  },
});

export const {resetUpload, updateProgress, updateChunkProgress, cancelUpload, clearError} =
  uploadSlice.actions;
export default uploadSlice.reducer;
