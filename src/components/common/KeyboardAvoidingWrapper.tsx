import React, {useRef, useEffect, useCallback} from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextInput,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

interface KeyboardAvoidingWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
}

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset = 0,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  useEffect(() => {

    const subscription = Keyboard.addListener('keyboardDidShow', e => {
      const focusedInput = TextInput.State.currentlyFocusedInput();
      if (!focusedInput || !scrollViewRef.current) {
        return;
      }

      (focusedInput as any).measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          if (y === undefined || height === undefined) {
            return;
          }
          const keyboardTop = e.endCoordinates.screenY;
          const inputBottom = y + height;
          const padding = 80;

          if (inputBottom > keyboardTop - padding) {
            const scrollBy = inputBottom - keyboardTop + padding;
            scrollViewRef.current?.scrollTo({
              y: scrollOffsetRef.current + scrollBy,
              animated: true,
            });
          }
        },
      );
    });

    return () => subscription.remove();
  }, []);

  const scrollView = (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="always"
      scrollEventThrottle={16}
      onScroll={handleScroll}
      keyboardDismissMode={
        Platform.OS === 'android' ? 'on-drag' : 'none'
      }>
      {children}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}>
      {Platform.OS === 'ios' ? (
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}>
          {scrollView}
        </TouchableWithoutFeedback>
      ) : (
        scrollView
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default KeyboardAvoidingWrapper;
