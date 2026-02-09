import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {uploadMedia} from '../thunks/uploadThunks';
import {UploadState, UploadedMedia} from '../../types';

const initialState: UploadState = {
  uploading: false,
  progress: 0,
  error: null,
  success: false,
  uploadedMedia: null,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    resetUpload: () => initialState,
    updateProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
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
        state.error = (action.payload as string) || 'Upload failed';
        state.success = false;
      });
  },
});

export const {resetUpload, updateProgress, clearError} = uploadSlice.actions;
export default uploadSlice.reducer;
