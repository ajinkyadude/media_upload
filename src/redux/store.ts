import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {useDispatch, useSelector, TypedUseSelectorHook} from 'react-redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  createTransform,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import mediaReducer from './slices/mediaSlice';
import uploadReducer from './slices/uploadSlice';

const mediaTransform = createTransform(
  (inboundState: any) => {
    return inboundState;
  },
  (outboundState: any) => {
    if (!outboundState) {
      return {
        deletedIds: [],
        uploadedItems: [],
      };
    }
    return {
      deletedIds: Array.isArray(outboundState.deletedIds) ? outboundState.deletedIds : [],
      uploadedItems: Array.isArray(outboundState.uploadedItems) ? outboundState.uploadedItems : [],
    };
  },
  {whitelist: ['deletedIds', 'uploadedItems']},
);

const mediaPersistConfig = {
  key: 'media',
  storage: AsyncStorage,
  whitelist: ['deletedIds', 'uploadedItems'],
  transforms: [mediaTransform],
};

const rootReducer = combineReducers({
  auth: authReducer,
  media: persistReducer(mediaPersistConfig, mediaReducer),
  upload: uploadReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'media/setSelectedMedia',
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
        ignoredActionPaths: ['payload.uri', 'payload.file'],
        ignoredPaths: ['media.selectedMedia'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
