import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
  Platform,
  Linking,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import KeyboardAvoidingWrapper from '../components/common/KeyboardAvoidingWrapper';
import {COLORS} from '../constants/colors';
import {validation} from '../utils/validation';
import {helpers} from '../utils/helpers';
import {RootStackParamList} from '../types';

type AddPhotoNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddPhoto'
>;

const AddPhotoScreen: React.FC = () => {
  const navigation = useNavigation<AddPhotoNavProp>();
  const [selectedImage, setSelectedImage] = useState<Asset | null>(null);
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
          'Camera permission was denied. Please enable it in your device settings.',
        others: response.errorMessage || 'Failed to select image',
      };
      Alert.alert(
        'Error',
        errorMessages[response.errorCode] || response.errorMessage || 'Failed to select image',
      );
      return;
    }

    if (response.assets && response.assets[0]) {
      const image = response.assets[0];

      const validationResult = validation.isValidImage({
        type: image.type || '',
        size: image.fileSize || 0,
      });

      if (!validationResult.valid) {
        Alert.alert('Invalid Image', validationResult.error || '');
        return;
      }

      setSelectedImage(image);
      setError('');
    }
  }, []);

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      });

      if (!permission) {
        return false;
      }

      // First check the current status
      const status = await check(permission);

      switch (status) {
        case RESULTS.GRANTED:
        case RESULTS.LIMITED:
          return true;

        case RESULTS.DENIED:
          // Permission hasn't been requested yet or was dismissed — request it
          const requestResult = await request(permission);
          if (requestResult === RESULTS.GRANTED || requestResult === RESULTS.LIMITED) {
            return true;
          }
          Alert.alert(
            'Permission Denied',
            'Camera permission is required to take photos. Please enable it in your device settings.',
          );
          return false;

        case RESULTS.BLOCKED:
          // Permission was permanently denied — direct user to settings
          Alert.alert(
            'Camera Permission Required',
            'Camera permission was previously denied. Please enable it in your device settings to take photos.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open Settings', onPress: () => Linking.openSettings()},
            ],
          );
          return false;

        case RESULTS.UNAVAILABLE:
          Alert.alert(
            'Camera Unavailable',
            'Camera is not available on this device. Please use a physical device.',
          );
          return false;

        default:
          return false;
      }
    } catch (err) {
      console.warn('Camera permission error:', err);
      return false;
    }
  }, []);

  const handleImagePicker = useCallback(
    async (type: 'camera' | 'gallery'): Promise<void> => {
      const options = {
        mediaType: 'photo' as const,
        quality: 0.8 as const,
        maxWidth: 1920,
        maxHeight: 1920,
        presentationStyle: 'fullScreen' as const,
      };

      if (type === 'camera') {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          return;
        }
        launchCamera(options, handleResponse);
      } else {
        launchImageLibrary(options, handleResponse);
      }
    },
    [requestCameraPermission, handleResponse],
  );

  const handleSelectFromGallery = useCallback((): void => {
    handleImagePicker('gallery');
  }, [handleImagePicker]);

  const handleTakePhoto = useCallback((): void => {
    handleImagePicker('camera');
  }, [handleImagePicker]);

  const handleContinue = useCallback((): void => {
    if (!selectedImage) {
      setError('Please select or capture a photo');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    navigation.navigate('Upload', {
      mediaData: {
        uri: selectedImage.uri || '',
        type: selectedImage.type || 'image/jpeg',
        name: selectedImage.fileName || 'photo.jpg',
        size: selectedImage.fileSize || 0,
        title: title.trim(),
      },
    });
  }, [selectedImage, title, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingWrapper contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add Photo</Text>
        <Text style={styles.subtitle}>
          Capture a new photo or select from gallery
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="📷 Take Photo"
            onPress={handleTakePhoto}
            variant="primary"
            style={styles.actionButton}
          />
          <Button
            title="🖼️ Choose from Gallery"
            onPress={handleSelectFromGallery}
            variant="outline"
            style={styles.actionButton}
          />
        </View>

        {selectedImage ? (
          <Card style={styles.previewCard}>
            <Text style={styles.previewLabel}>Preview</Text>
            <Image
              source={{uri: selectedImage.uri}}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={styles.imageInfo}>
              <Text style={styles.infoText}>
                📏 {selectedImage.width} × {selectedImage.height}
              </Text>
              <Text style={styles.infoText}>
                💾 {helpers.formatFileSize(selectedImage.fileSize || 0)}
              </Text>
            </View>

            <Input
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter photo title"
              style={styles.titleInput}
            />
          </Card>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {selectedImage ? (
          <Button
            title="Continue to Upload"
            onPress={handleContinue}
            style={styles.continueButton}
          />
        ) : null}
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
  buttonContainer: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  previewCard: {
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: COLORS.grayLight,
  },
  imageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  infoText: {
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
    marginTop: 8,
  },
});

export default AddPhotoScreen;
