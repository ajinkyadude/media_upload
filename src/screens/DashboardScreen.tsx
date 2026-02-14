import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {logoutUser} from '../redux/thunks/authThunks';
import {useAppDispatch, useAppSelector} from '../redux/store';
import Card from '../components/common/Card';
import {COLORS} from '../constants/colors';
import {RootStackParamList} from '../types';

type DashboardNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

interface MenuItem {
  id: number;
  title: string;
  icon: string;
  description: string;
  screen: keyof RootStackParamList;
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavProp>();
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.auth);

  const handleLogout = useCallback((): void => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => dispatch(logoutUser()),
      },
    ]);
  }, [dispatch]);

  const menuItems: MenuItem[] = [
    {
      id: 1,
      title: 'View Media List',
      icon: '📋',
      description: 'Browse all uploaded media',
      screen: 'List',
    },
    {
      id: 2,
      title: 'Add Photo',
      icon: '📷',
      description: 'Capture or select a photo',
      screen: 'AddPhoto',
    },
    {
      id: 3,
      title: 'Add Video',
      icon: '🎥',
      description: 'Select a video to upload',
      screen: 'AddVideo',
    },
  ];

  const handleNavigate = useCallback(
    (screen: keyof RootStackParamList): void => {
      if (screen !== 'Upload') {
        navigation.navigate(screen as 'List' | 'AddPhoto' | 'AddVideo');
      }
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        {menuItems.map(item => (
          <Card
            key={item.id}
            onPress={() => handleNavigate(item.screen)}
            style={styles.menuCard}>
            <View style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Card>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  logoutIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  menuCard: {
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  chevron: {
    fontSize: 28,
    color: COLORS.textSecondary,
  },
});

export default DashboardScreen;
