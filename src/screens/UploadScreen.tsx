import React, {useEffect, useCallback, useRef} from 'react';
import {View, Text, StyleSheet, BackHandler} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {uploadMedia} from '../redux/thunks/uploadThunks';
import {resetUpload, cancelUpload as cancelUploadAction} from '../redux/slices/uploadSlice';
import {uploadService} from '../services/uploadService';
import {useAppDispatch, useAppSelector} from '../redux/store';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import {COLORS} from '../constants/colors';
import {helpers} from '../utils/helpers';
import {RootStackParamList} from '../types';

type UploadNavProp = NativeStackNavigationProp<RootStackParamList, 'Upload'>;
type UploadRouteProp = RouteProp<RootStackParamList, 'Upload'>;

const UploadScreen: React.FC = () => {
  const navigation = useNavigation<UploadNavProp>();
  const route = useRoute<UploadRouteProp>();
  const dispatch = useAppDispatch();

  const isMountedRef = useRef<boolean>(true);
  const uploadStartedRef = useRef<boolean>(false);

  const {uploading, progress, error, success, chunkProgress, isCancelled} =
    useAppSelector(state => state.upload);

  const {mediaData} = route.params || {};

  useEffect(() => {
    if (mediaData && !uploadStartedRef.current) {
      uploadStartedRef.current = true;
      dispatch(uploadMedia(mediaData));
    }
  }, [dispatch, mediaData]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      uploadService.cancelUpload();
      dispatch(resetUpload());
    };
  }, [dispatch]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (uploading) {
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [uploading]);

  const handleDone = useCallback((): void => {
    dispatch(resetUpload());
    navigation.navigate('Dashboard');
  }, [dispatch, navigation]);

  const handleRetry = useCallback((): void => {
    uploadStartedRef.current = false;
    dispatch(resetUpload());
    if (mediaData) {
      uploadStartedRef.current = true;
      dispatch(uploadMedia(mediaData));
    }
  }, [dispatch, mediaData]);

  const handleCancel = useCallback((): void => {
    uploadService.cancelUpload();
    dispatch(cancelUploadAction());
    setTimeout(() => {
      if (isMountedRef.current) {
        dispatch(resetUpload());
        navigation.goBack();
      }
    }, 300);
  }, [dispatch, navigation]);

  const handleGoBack = useCallback((): void => {
    dispatch(resetUpload());
    navigation.goBack();
  }, [dispatch, navigation]);

  const getStatusIcon = (): string => {
    if (success) {
      return '✅';
    }
    if (error || isCancelled) {
      return '❌';
    }
    return '⏳';
  };

  const getStatusText = (): string => {
    if (success) {
      return 'Upload Complete!';
    }
    if (isCancelled) {
      return 'Upload Cancelled';
    }
    if (error) {
      return 'Upload Failed';
    }
    return 'Uploading...';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.uploadCard}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>

          {mediaData ? (
            <View style={styles.mediaInfo}>
              <Text style={styles.mediaTitle}>{mediaData.title}</Text>
              <Text style={styles.mediaDetails}>
                {mediaData.type?.includes('video') ? '🎥 Video' : '📷 Photo'}
                {'  •  '}
                {helpers.formatFileSize(mediaData.size)}
              </Text>
            </View>
          ) : null}

          {uploading ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, {width: `${progress}%`}]}
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>

              {chunkProgress ? (
                <View style={styles.chunkInfo}>
                  <Text style={styles.chunkText}>
                    📦 Chunk {chunkProgress.uploadedChunks} of{' '}
                    {chunkProgress.totalChunks}
                  </Text>
                  <Text style={styles.chunkText}>
                    📤 {helpers.formatFileSize(chunkProgress.bytesUploaded)} /{' '}
                    {helpers.formatFileSize(chunkProgress.totalBytes)}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {error && !isCancelled ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {isCancelled ? (
            <View style={styles.cancelledContainer}>
              <Text style={styles.cancelledText}>
                Upload was cancelled. No data was saved.
              </Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                Your media has been uploaded successfully!
              </Text>
            </View>
          ) : null}
        </Card>

        <View style={styles.buttonContainer}>
          {uploading ? (
            <Button
              title="Cancel Upload"
              onPress={handleCancel}
              variant="outline"
            />
          ) : null}

          {error && !isCancelled ? (
            <>
              <Button
                title="Retry Upload"
                onPress={handleRetry}
                style={styles.button}
              />
              <Button
                title="Go Back"
                onPress={handleGoBack}
                variant="outline"
                style={styles.button}
              />
            </>
          ) : null}

          {isCancelled ? (
            <Button
              title="Go Back"
              onPress={handleGoBack}
              variant="outline"
              style={styles.button}
            />
          ) : null}

          {success ? (
            <Button title="Done" onPress={handleDone} style={styles.button} />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  uploadCard: {
    padding: 32,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  mediaInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  mediaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  mediaDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.grayLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  chunkInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: `${COLORS.info}10`,
    borderRadius: 8,
  },
  chunkText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
  cancelledContainer: {
    backgroundColor: `${COLORS.warning}15`,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  cancelledText: {
    fontSize: 14,
    color: COLORS.warning,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: `${COLORS.success}15`,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  successText: {
    fontSize: 14,
    color: COLORS.success,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    marginTop: 12,
  },
});

export default UploadScreen;
