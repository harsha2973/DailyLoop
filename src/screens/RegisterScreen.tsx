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

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoMark}>∞</Text>
            </View>
            <Text style={styles.title}>Join DailyLoop</Text>
            <Text style={styles.subtitle}>Plan less. Do more.</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Name Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Harsha Gowda"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

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
                  placeholder="At least 6 characters"
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
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Secondary Login Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginBold}>Log in</Text>
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
  errorText: {
    color: colors.danger,
    ...typography.bodySm,
    marginBottom: spacing.md,
    textAlign: 'center',
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
  loginLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  loginText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  loginBold: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
