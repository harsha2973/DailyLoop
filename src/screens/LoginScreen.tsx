import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';
import { AuthDialogModal } from '../components/AuthDialogModal';
import { AppLogo } from '../components/AppLogo';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    type: 'account_not_found' | 'invalid_password' | 'info';
    title: string;
    message: string;
    primaryButtonText: string;
    onPrimaryPress: () => void;
    secondaryButtonText?: string;
    onSecondaryPress?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    primaryButtonText: 'OK',
    onPrimaryPress: () => {},
  });

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const isNotFound =
        err.status === 404 ||
        err.message?.toLowerCase().includes('not exist') ||
        err.message?.toLowerCase().includes('sign up');

      const isWrongPassword =
        err.status === 401 ||
        err.message?.toLowerCase().includes('wrong password') ||
        err.message?.toLowerCase().includes('incorrect');

      if (isNotFound) {
        setDialogConfig({
          visible: true,
          type: 'account_not_found',
          title: 'Account Not Found',
          message: `No registered account exists with email "${email.trim()}". Would you like to create a new account instead?`,
          primaryButtonText: 'Create Account',
          onPrimaryPress: () => {
            setDialogConfig((prev) => ({ ...prev, visible: false }));
            navigation.navigate('Register', { email: email.trim() });
          },
          secondaryButtonText: 'Cancel',
          onSecondaryPress: () => {
            setDialogConfig((prev) => ({ ...prev, visible: false }));
          },
        });
      } else if (isWrongPassword) {
        setDialogConfig({
          visible: true,
          type: 'invalid_password',
          title: 'Incorrect Password',
          message: `The password you entered for "${email.trim()}" is incorrect. Please check your credentials and try again.`,
          primaryButtonText: 'Try Again',
          onPrimaryPress: () => {
            setDialogConfig((prev) => ({ ...prev, visible: false }));
            setPassword('');
          },
        });
      } else {
        setError(err.message || 'Login failed. Check your network or credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <AppLogo
              size={32}
              containerSize={56}
              backgroundColor={theme.primaryButton}
              color={theme.primaryButtonText}
              borderRadius={radius.sm}
              containerStyle={shadows.sm}
            />
            <Text style={[styles.title, { color: theme.textPrimary }]}>Sign in to DailyLoop</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Plan less. Do more.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            {error && (
              <View style={[styles.errorBox, { borderColor: theme.priorityHigh }]}>
                <Text style={[styles.errorText, { color: theme.priorityHigh }]}>{error}</Text>
                {error.toLowerCase().includes('sign up') && (
                  <TouchableOpacity
                    style={[styles.signupButton, { backgroundColor: theme.primaryButton }]}
                    onPress={() => navigation.navigate('Register', { email: email.trim() })}
                  >
                    <Text style={[styles.signupButtonText, { color: theme.primaryButtonText }]}>
                      Create Account / Sign Up →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>EMAIL</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>PASSWORD</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeToggle}>
                  <Text style={[styles.eyeText, { color: theme.textSecondary }]}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primaryButton }, shadows.sm]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={theme.primaryButtonText} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: theme.primaryButtonText }]}>
                  Continue with Email
                </Text>
              )}
            </TouchableOpacity>

            {/* Secondary Register Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register', { email: email.trim() })}
              style={styles.registerLink}
            >
              <Text style={[styles.registerText, { color: theme.textSecondary }]}>
                Don't have an account? <Text style={[styles.registerBold, { color: theme.textPrimary }]}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Authentication Dialogue Popup */}
      <AuthDialogModal
        visible={dialogConfig.visible}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        primaryButtonText={dialogConfig.primaryButtonText}
        onPrimaryPress={dialogConfig.onPrimaryPress}
        secondaryButtonText={dialogConfig.secondaryButtonText}
        onSecondaryPress={dialogConfig.onSecondaryPress}
        onClose={() => setDialogConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: spacing.containerPadding,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoMark: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 26,
  },
  title: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 26,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  formCard: {
    borderRadius: radius.xl, // 32px curved radius
    padding: spacing.lg,
    borderWidth: 1,
  },
  errorBox: {
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    textAlign: 'center',
  },
  signupButton: {
    marginTop: spacing.xs + 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  signupButtonText: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: 14,
    paddingVertical: 0,
  },
  eyeToggle: {
    padding: spacing.xs,
  },
  eyeText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
  },
  primaryButton: {
    height: 48,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 15,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  registerText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
  },
  registerBold: {
    fontFamily: fontFamilies.headingBold,
  },
});
