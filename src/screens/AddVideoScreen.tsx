import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import {pick, types, isErrorWithCode, errorCodes} from '@react-native-documents/picker';
import {createVideoThumbnail} from 'react-native-compressor';
import RNFS from 'react-native-fs';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import KeyboardAvoidingWrapper from '../components/common/KeyboardAvoidingWrapper';
import {COLORS} from '../constants/colors';
import {validation} from '../utils/validation';
import {helpers} from '../utils/helpers';
import {RootStackParamList} from '../types';

type AddVideoNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddVideo'
>;

const AddVideoScreen: React.FC = () => {
  const navigation = useNavigation<AddVideoNavProp>();
  const [selectedVideo, setSelectedVideo] = useState<Asset | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [error, setError] = useState<string>('');

  const generateThumbnail = useCallback(async (videoUri: string): Promise<void> => {
    try {
      const result = await createVideoThumbnail(videoUri);
      setThumbnailUri(result.path);
    } catch (err) {
      console.warn('Failed to generate video thumbnail:', err);
      setThumbnailUri(null);
    }
  }, []);

  const handleResponse = useCallback((response: ImagePickerResponse): void => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      const errorMessages: Record<string, string> = {
        camera_unavailable:
          'Camera is not available on this device. Please use a physical device.',
        permission:
          'Media library permission was denied. Please enable it in your device settings.',
        others: response.errorMessage || 'Failed to select video',
      };
      Alert.alert(
        'Error',
        errorMessages[response.errorCode] ||
          response.errorMessage ||
          'Failed to select video',
      );
      return;
    }

    if (response.assets && response.assets[0]) {
      const video = response.assets[0];

      const validationResult = validation.isValidVideo({
        type: video.type || '',
        size: video.fileSize || 0,
        name: video.fileName,
      });

      if (!validationResult.valid) {
        Alert.alert('Invalid Video', validationResult.error || '');
        return;
      }

      setSelectedVideo(video);
      setError('');

      if (video.uri) {
        generateThumbnail(video.uri);
      }
    }
  }, [generateThumbnail]);

  const requestStoragePermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }
    try {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          {
            title: 'Video Access Permission',
            message: 'This app needs access to your videos to select them for upload.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        }
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to select videos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        }
      }
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to select videos. Please enable it in your device settings.',
      );
      return false;
    } catch (err) {
      console.warn('Storage permission error:', err);
      return false;
    }
  }, []);

  const handleSelectFromGallery = useCallback(async (): Promise<void> => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'video',
        quality: 0.8,
        presentationStyle: 'fullScreen',
      },
      handleResponse,
    );
  }, [requestStoragePermission, handleResponse]);

  const handleSelectFromFiles = useCallback(async (): Promise<void> => {
    try {
      const videoTypes = Platform.select({
        ios: [
          'public.movie',
          'public.mpeg-4',
          'com.apple.quicktime-movie',
          'org.matroska.mkv',
          'io.matroska.mkv',
          'public.mpeg',
          'public.avi',
          'org.webmproject.webm',
          'public.hevc',
          'public.mpeg-2-video',
          'public.mpeg-2-transport-stream',
          'com.microsoft.windows-media-wmv',

          'public.data',
          'public.content',
        ],
        default: [
          'video/mp4',
          'video/quicktime',
          'video/x-matroska',
          'video/matroska',
          'video/mpeg',
          'video/x-msvideo',
          'video/avi',
          'video/webm',
          'video/hevc',
          'video/x-hevc',
          'video/x-ms-wmv',
          'video/3gpp',
          'video/3gpp2',
          'video/mp2t',
          types.video,
        ],
      }) as string[];

      const [result] = await pick({
        type: videoTypes,
        allowMultiSelection: false,
        mode: 'open',
      });

      let fileName = result.name || '';
      if (!fileName && result.uri) {
        const decodedUri = decodeURIComponent(result.uri);
        fileName = decodedUri.split('/').pop() || 'video';
      }

      let fileType = result.type || '';
      if (!fileType || !fileType.startsWith('video/')) {
        const inferred = helpers.getMimeTypeFromExtension(fileName);
        if (inferred) {
          fileType = inferred;
        } else if (!fileType) {
          fileType = 'video/mp4';
        }
      }

      let fileSize = result.size || 0;
      if (!fileSize && result.uri) {
        try {
          const filePath = result.uri.replace('file://', '');
          const stat = await RNFS.stat(filePath);
          fileSize = stat.size;
        } catch (statErr) {
          console.warn('Could not stat file for size:', statErr);
        }
      }

      const validationResult = validation.isValidVideo({
        type: fileType,
        size: fileSize,
        name: fileName,
      });

      if (!validationResult.valid) {
        Alert.alert('Invalid Video', validationResult.error || '');
        return;
      }

      const asset: Asset = {
        uri: result.uri,
        type: fileType,
        fileName: fileName,
        fileSize: fileSize,
      };

      setSelectedVideo(asset);
      setError('');

      if (result.uri) {
        generateThumbnail(result.uri);
      }
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      console.warn('File picker error:', err);
      Alert.alert('Error', 'Failed to select video file. Please try again.');
    }
  }, [generateThumbnail]);

  const handleContinue = useCallback((): void => {
    if (!selectedVideo) {
      setError('Please select a video');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    navigation.navigate('Upload', {
      mediaData: {
        uri: selectedVideo.uri || '',
        type: selectedVideo.type || 'video/mp4',
        name: selectedVideo.fileName || 'video.mp4',
        size: selectedVideo.fileSize || 0,
        title: title.trim(),
        thumbnail: thumbnailUri || undefined,
      },
    });
  }, [selectedVideo, title, navigation, thumbnailUri]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingWrapper contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add Video</Text>
        <Text style={styles.subtitle}>
          Select a video from your gallery or browse files
        </Text>

        <Button
          title="🎥 Select from Gallery"
          onPress={handleSelectFromGallery}
          variant="primary"
          style={styles.selectButton}
        />

        <Button
          title="📂 Browse Files"
          onPress={handleSelectFromFiles}
          variant="secondary"
          style={styles.selectButton}
        />

        <Text style={styles.hintText}>
          Gallery shows MP4 & MOV. Use "Browse Files" for MKV, AVI, WebM, MPEG, HEVC.
        </Text>

        {selectedVideo ? (
          <Card style={styles.videoCard}>
            <Text style={styles.videoLabel}>Selected Video</Text>

            {thumbnailUri ? (
              <Image
                source={{uri: thumbnailUri}}
                style={styles.thumbnailPreview}
                resizeMode="cover"
              />
            ) : null}

            <View style={styles.videoPreview}>
              <Text style={styles.videoIcon}>🎬</Text>
              <View style={styles.videoDetails}>
                <Text style={styles.videoName} numberOfLines={2}>
                  {selectedVideo.fileName || 'video.mp4'}
                </Text>
                <Text style={styles.videoSize}>
                  💾 {helpers.formatFileSize(selectedVideo.fileSize || 0)}
                </Text>
                <Text style={styles.videoType}>
                  📹 {selectedVideo.type || 'video/mp4'}
                </Text>
                {selectedVideo.duration ? (
                  <Text style={styles.videoDuration}>
                    ⏱️ {Math.round(selectedVideo.duration)}s
                  </Text>
                ) : null}
              </View>
            </View>

            <Input
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter video title"
              style={styles.titleInput}
            />
          </Card>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {selectedVideo ? (
          <Button
            title="Continue to Upload"
            onPress={handleContinue}
            style={styles.continueButton}
          />
        ) : null}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Video Requirements</Text>
          <Text style={styles.infoText}>• Maximum size: 900MB</Text>
          <Text style={styles.infoText}>
            • Supported formats: MP4, MOV, MKV, MPEG, MPG, AVI, WebM, HEVC
          </Text>
          <Text style={styles.infoTitle}>📋 How to Select</Text>
          <Text style={styles.infoText}>
            • "Select from Gallery" – picks from your Photos library (MP4, MOV)
          </Text>
          <Text style={styles.infoText}>
            • "Browse Files" – opens the file browser for all video formats
            (MKV, AVI, WebM, MPEG, HEVC, etc.)
          </Text>
        </Card>
      </KeyboardAvoidingWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 200
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  selectButton: {
    marginBottom: 12,
  },
  hintText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  videoCard: {
    marginBottom: 16,
  },
  videoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  thumbnailPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: COLORS.grayLight,
    marginBottom: 12,
  },
  videoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  videoIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  videoDetails: {
    flex: 1,
  },
  videoName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  videoSize: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  videoType: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  videoDuration: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  titleInput: {
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  continueButton: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: `${COLORS.info}10`,
    borderWidth: 1,
    borderColor: `${COLORS.info}30`,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
});

export default AddVideoScreen;
