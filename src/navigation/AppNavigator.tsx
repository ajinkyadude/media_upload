import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {checkAuthStatus} from '../redux/thunks/authThunks';
import {useAppDispatch, useAppSelector} from '../redux/store';
import {RootStackParamList} from '../types';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ListScreen from '../screens/ListScreen';
import AddVideoScreen from '../screens/AddVideoScreen';
import AddPhotoScreen from '../screens/AddPhotoScreen';
import UploadScreen from '../screens/UploadScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const {isAuthenticated, isInitialized} = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen
              name="List"
              component={ListScreen}
              options={{
                headerShown: true,
                title: 'Media List',
              }}
            />
            <Stack.Screen
              name="AddVideo"
              component={AddVideoScreen}
              options={{
                headerShown: true,
                title: 'Add Video',
              }}
            />
            <Stack.Screen
              name="AddPhoto"
              component={AddPhotoScreen}
              options={{
                headerShown: true,
                title: 'Add Photo',
              }}
            />
            <Stack.Screen
              name="Upload"
              component={UploadScreen}
              options={{
                headerShown: true,
                title: 'Upload Media',
                gestureEnabled: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
