import React from 'react';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {COLORS} from '../../constants/colors';
import {LoaderProps} from '../../types';

const Loader: React.FC<LoaderProps> = ({
  size = 'large',
  color = COLORS.primary,
  text,
  overlay = false,
}) => {
  return (
    <View style={[styles.container, overlay && styles.overlay]}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size={size} color={color} />
        {text ? <Text style={styles.text}>{text}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    zIndex: 999,
  },
  loaderContainer: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
});

export default Loader;
