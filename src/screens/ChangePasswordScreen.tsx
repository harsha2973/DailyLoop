import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { changePasswordRequest } from '../api/authApi';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';
import { AuthDialogModal } from '../components/AuthDialogModal';

export const ChangePasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    type: 'success' | 'invalid_password' | 'info';
    title: string;
    message: string;
    onPrimaryPress: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    onPrimaryPress: () => {},
  });

  const handleChangePassword = async () => {
    setError(null);

    if (!oldPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePasswordRequest(oldPassword, newPassword);
      setDialogConfig({
        visible: true,
        type: 'success',
        title: 'Password Updated!',
        message: 'Your password has been changed successfully.',
        onPrimaryPress: () => {
          setDialogConfig((prev) => ({ ...prev, visible: false }));
          navigation.goBack();
        },
      });
    } catch (err: any) {
      const isIncorrectOld =
        err.status === 401 || err.message?.toLowerCase().includes('old password');

      if (isIncorrectOld) {
        setDialogConfig({
          visible: true,
          type: 'invalid_password',
          title: 'Incorrect Password',
          message: 'The current password you entered is incorrect.',
          onPrimaryPress: () => {
            setDialogConfig((prev) => ({ ...prev, visible: false }));
            setOldPassword('');
          },
        });
      } else {
        setError(err.message || 'Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.textSecondary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Change Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Ensure your account is using a strong password.
          </Text>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            {error && (
              <View style={[styles.errorBox, { borderColor: theme.priorityHigh }]}>
                <Text style={[styles.errorText, { color: theme.priorityHigh }]}>{error}</Text>
              </View>
            )}

            {/* Old Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>CURRENT PASSWORD</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Enter current password"
                  placeholderTextColor={theme.textMuted}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                />
                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} style={styles.eyeToggle}>
                  <Text style={[styles.eyeText, { color: theme.textSecondary }]}>
                    {showOldPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>NEW PASSWORD</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={theme.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeToggle}>
                  <Text style={[styles.eyeText, { color: theme.textSecondary }]}>
                    {showNewPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>CONFIRM NEW PASSWORD</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Re-enter new password"
                  placeholderTextColor={theme.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeToggle}>
                  <Text style={[styles.eyeText, { color: theme.textSecondary }]}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primaryButton }, shadows.sm]}
              onPress={handleChangePassword}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={theme.primaryButtonText} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: theme.primaryButtonText }]}>
                  Update Password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Dialogue Popup Modal */}
      <AuthDialogModal
        visible={dialogConfig.visible}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        primaryButtonText="Done"
        onPrimaryPress={dialogConfig.onPrimaryPress}
        onClose={() => setDialogConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: spacing.xs,
  },
  backText: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
  },
  headerTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 48,
  },
  container: {
    padding: spacing.containerPadding,
  },
  sectionSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  card: {
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
    fontWeight: '500',
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
  },
  primaryButtonText: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    fontWeight: '600',
  },
});
