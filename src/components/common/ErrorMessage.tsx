import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import {COLORS} from '../../constants/colors';
import {ErrorMessageProps} from '../../types';

const ErrorMessage: React.FC<ErrorMessageProps> = ({message, onRetry, style}) => {
  if (!message) {
    return null;
  }

  return (
    <View style={[styles.container, style as ViewStyle]}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.error}15`,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ErrorMessage;
