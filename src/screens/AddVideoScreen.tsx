import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
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
  const [title, setTitle] = useState<string>('');
  const [error, setError] = useState<string>('');

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
      });

      if (!validationResult.valid) {
        Alert.alert('Invalid Video', validationResult.error || '');
        return;
      }

      setSelectedVideo(video);
      setError('');
    }
  }, []);

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

  const handleSelectVideo = useCallback(async (): Promise<void> => {
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
      },
    });
  }, [selectedVideo, title, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingWrapper contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add Video</Text>
        <Text style={styles.subtitle}>
          Select a video from your device (Max 100MB)
        </Text>

        <Button
          title="🎥 Select Video"
          onPress={handleSelectVideo}
          variant="primary"
          style={styles.selectButton}
        />

        {selectedVideo ? (
          <Card style={styles.videoCard}>
            <Text style={styles.videoLabel}>Selected Video</Text>

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
          <Text style={styles.infoText}>• Maximum size: 100MB</Text>
          <Text style={styles.infoText}>
            • Supported formats: MP4, MOV, AVI
          </Text>
          <Text style={styles.infoText}>
            • Ensure good network connection for upload
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
    marginBottom: 24,
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
