import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
  ListRenderItem,
} from 'react-native';
import {fetchMediaList, deleteMedia} from '../redux/thunks/mediaThunks';
import {useAppDispatch, useAppSelector} from '../redux/store';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import Card from '../components/common/Card';
import {COLORS} from '../constants/colors';
import {helpers} from '../utils/helpers';
import {MediaItem} from '../types';

const MediaThumbnail: React.FC<{item: MediaItem}> = ({item: mediaItem}) => {
  const [failed, setFailed] = useState(false);
  const thumbnailSource = mediaItem.thumbnail || mediaItem.url;

  if (failed || !thumbnailSource) {
    return (
      <View style={[styles.thumbnail, styles.thumbnailFallback]}>
        <Text style={styles.thumbnailFallbackIcon}>
          {mediaItem.type === 'video' ? '🎬' : '🖼️'}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{uri: thumbnailSource}}
      style={styles.thumbnail}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
};

const ListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const {mediaList, loading, refreshing, error} = useAppSelector(
    state => state.media,
  );

  useEffect(() => {
    dispatch(fetchMediaList(undefined));
  }, [dispatch]);

  const handleRefresh = useCallback((): void => {
    dispatch(fetchMediaList({refresh: true}));
  }, [dispatch]);

  const handleDelete = useCallback(
    (item: MediaItem): void => {
      Alert.alert(
        'Delete Media',
        'Are you sure you want to delete this item?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => dispatch(deleteMedia(item.id)),
          },
        ],
      );
    },
    [dispatch],
  );

  const renderMediaItem: ListRenderItem<MediaItem> = useCallback(
    ({item}) => (
      <Card style={styles.mediaCard}>
        <View style={styles.mediaContent}>
          <MediaThumbnail item={item} />
          <View style={styles.mediaInfo}>
            <Text style={styles.mediaTitle}>{item.title}</Text>
            <View style={styles.mediaDetails}>
              <Text style={styles.mediaType}>
                {item.type === 'video' ? '🎥' : '📷'}{' '}
                {item.type.toUpperCase()}
              </Text>
              <Text style={styles.mediaSize}>
                {helpers.formatFileSize(item.size)}
              </Text>
            </View>
            <Text style={styles.mediaDate}>
              {helpers.formatDate(item.createdAt)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </Card>
    ),
    [handleDelete],
  );

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📁</Text>
        <Text style={styles.emptyText}>No media uploaded yet</Text>
        <Text style={styles.emptySubtext}>
          Start by adding photos or videos
        </Text>
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: MediaItem): string => item.id,
    [],
  );

  if (loading && !refreshing) {
    return <Loader text="Loading media..." />;
  }

  return (
    <View style={styles.container}>
      {error ? (
        <ErrorMessage
          message={error}
          onRetry={handleRefresh}
          style={styles.errorMessage}
        />
      ) : null}

      <FlatList
        data={mediaList}
        renderItem={renderMediaItem}
        keyExtractor={keyExtractor}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={!error ? renderEmptyList : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  errorMessage: {
    margin: 16,
  },
  mediaCard: {
    marginBottom: 12,
  },
  mediaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.grayLight,
  },
  thumbnailFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailFallbackIcon: {
    fontSize: 32,
  },
  mediaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  mediaDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  mediaType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 12,
  },
  mediaSize: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  mediaDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default ListScreen;
