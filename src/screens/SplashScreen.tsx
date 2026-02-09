import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {COLORS} from '../constants/colors';

const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>📱</Text>
      <Text style={styles.title}>Media Upload App</Text>
      <ActivityIndicator
        size="large"
        color={COLORS.white}
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
