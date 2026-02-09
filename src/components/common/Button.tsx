import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {COLORS} from '../../constants/colors';
import {ButtonProps} from '../../types';

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const styles: ViewStyle[] = [buttonStyles.button];

    if (variant === 'primary') {
      styles.push(buttonStyles.primaryButton);
    } else if (variant === 'secondary') {
      styles.push(buttonStyles.secondaryButton);
    } else if (variant === 'outline') {
      styles.push(buttonStyles.outlineButton);
    }

    if (disabled || loading) {
      styles.push(buttonStyles.disabledButton);
    }

    if (style) {
      styles.push(style as ViewStyle);
    }

    return styles;
  };

  const getTextStyle = (): TextStyle[] => {
    const styles: TextStyle[] = [buttonStyles.text];

    if (variant === 'primary') {
      styles.push(buttonStyles.primaryText);
    } else if (variant === 'secondary') {
      styles.push(buttonStyles.secondaryText);
    } else if (variant === 'outline') {
      styles.push(buttonStyles.outlineText);
    }

    if (textStyle) {
      styles.push(textStyle as TextStyle);
    }

    return styles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
});

export default Button;
