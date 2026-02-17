import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, persistor } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { cacheService } from './src/services/cacheService';

const App = () => {
    useEffect(() => {
        cacheService.cleanupAllCacheFiles().catch(err => {
            console.warn('Startup cache cleanup failed:', err);
        });
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <AppNavigator />
                </PersistGate>
            </Provider>
        </GestureHandlerRootView>
    );
};

export default App;
