import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {pick, keepLocalCopy, type DocumentPickerResponse} from '@react-native-documents/picker';
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
  const [selectedVideo, setSelectedVideo] =
    useState<DocumentPickerResponse | null>(null);
  const [title, setTitle] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSelectVideo = useCallback(async (): Promise<void> => {
    try {
      const [result] = await pick({
        type: ['video/*'],
      });

      if (result) {
        const validationResult = validation.isValidVideo({
          type: result.type || '',
          size: result.size || 0,
        });

        if (!validationResult.valid) {
          Alert.alert('Invalid Video', validationResult.error || '');
          return;
        }

        const [localCopy] = await keepLocalCopy({
          files: [{uri: result.uri, fileName: result.name ?? 'video.mp4'}],
          destination: 'cachesDirectory',
        });

        setSelectedVideo({
          ...result,
          uri: localCopy.status === 'success' ? localCopy.localUri : result.uri,
        });
        setError('');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('User cancelled')) {
        return;
      }
      Alert.alert('Error', 'Failed to select video');
      console.error(err);
    }
  }, []);

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
        uri: selectedVideo.uri,
        type: selectedVideo.type || 'video/mp4',
        name: selectedVideo.name || 'video.mp4',
        size: selectedVideo.size || 0,
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
                  {selectedVideo.name}
                </Text>
                <Text style={styles.videoSize}>
                  💾 {helpers.formatFileSize(selectedVideo.size || 0)}
                </Text>
                <Text style={styles.videoType}>
                  📹 {selectedVideo.type || 'video/mp4'}
                </Text>
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
