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
import { colors, radius, spacing, typography } from '../theme/colors';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* DailyLoop Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoMark}>∞</Text>
            </View>
            <Text style={styles.title}>Sign in to DailyLoop</Text>
            <Text style={styles.subtitle}>Plan less. Do more.</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                {error.toLowerCase().includes('sign up') && (
                  <TouchableOpacity
                    style={styles.signupButton}
                    onPress={() => navigation.navigate('Register')}
                  >
                    <Text style={styles.signupButtonText}>Create Account / Sign Up →</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeToggle}>
                  <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.primaryButtonText}>Continue with Email</Text>
              )}
            </TouchableOpacity>

            {/* Secondary Register Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerBold}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.containerPadding, // 24dp
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
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoMark: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  title: {
    ...typography.displayLarge,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    ...typography.bodySm,
    textAlign: 'center',
    fontWeight: '500',
  },
  signupButton: {
    marginTop: spacing.xs + 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  signupButtonText: {
    color: colors.onPrimary,
    ...typography.caption,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    height: 46,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  eyeToggle: {
    padding: spacing.xs,
  },
  eyeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    ...typography.title,
    color: colors.onPrimary,
    fontSize: 15,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  registerText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  registerBold: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
