import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {loginUser} from '../redux/thunks/authThunks';
import {clearError} from '../redux/slices/authSlice';
import {useAppDispatch, useAppSelector} from '../redux/store';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ErrorMessage from '../components/common/ErrorMessage';
import KeyboardAvoidingWrapper from '../components/common/KeyboardAvoidingWrapper';
import {COLORS} from '../constants/colors';
import {validation} from '../utils/validation';

interface FormErrors {
  email?: string;
  password?: string;
}

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const {loading, error} = useAppSelector(state => state.auth);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!validation.isRequired(email)) {
      newErrors.email = 'Email is required';
    } else if (!validation.isValidEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!validation.isRequired(password)) {
      newErrors.password = 'Password is required';
    } else if (!validation.isValidPassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleLogin = useCallback((): void => {
    if (validateForm()) {
      dispatch(loginUser({email, password}));
    }
  }, [dispatch, email, password, validateForm]);

  const handleRetry = useCallback((): void => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <KeyboardAvoidingWrapper
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.logo}>📱</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        {error ? (
          <ErrorMessage
            message={error}
            onRetry={handleRetry}
            style={styles.errorContainer}
          />
        ) : null}

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          error={errors.password}
        />

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginButton}
        />

        <View style={styles.demoInfo}>
          <Text style={styles.demoText}>Demo Credentials:</Text>
          <Text style={styles.demoCredentials}>
            Email: demo@example.com
          </Text>
          <Text style={styles.demoCredentials}>Password: password123</Text>
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  demoInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: `${COLORS.info}15`,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.info,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  demoCredentials: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default LoginScreen;
