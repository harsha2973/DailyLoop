import React, { useState, useEffect } from 'react';
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
import { AppLogo } from '../components/AppLogo';

export const RegisterScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const { register } = useAuth();
  const { theme } = useTheme();

  const initialEmail = route?.params?.email || '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route?.params?.email) {
      setEmail(route.params.email);
    }
  }, [route?.params?.email]);

  const handleRegister = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
            <Text style={[styles.title, { color: theme.textPrimary }]}>Join DailyLoop</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Plan less. Do more.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            {error && (
              <View style={[styles.errorBox, { borderColor: theme.priorityHigh }]}>
                <Text style={[styles.errorText, { color: theme.priorityHigh }]}>{error}</Text>
              </View>
            )}

            {/* Name Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>FULL NAME</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Harsha Gowda"
                  placeholderTextColor={theme.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

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
                  placeholder="At least 6 characters"
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
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={theme.primaryButtonText} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: theme.primaryButtonText }]}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Secondary Login Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={[styles.loginText, { color: theme.textSecondary }]}>
                Already have an account? <Text style={[styles.loginBold, { color: theme.textPrimary }]}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  loginLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  loginText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
  },
  loginBold: {
    fontFamily: fontFamilies.headingBold,
  },
});
