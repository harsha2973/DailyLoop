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
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { updateProfileRequest } from '../api/authApi';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';
import { AuthDialogModal } from '../components/AuthDialogModal';

export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onPrimaryPress: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onPrimaryPress: () => {},
  });

  const handleSaveProfile = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (!email.trim()) {
      setError('Email address cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfileRequest(name.trim(), email.trim());
      await updateUser(res.user);

      setEditingName(false);
      setEditingEmail(false);

      setDialogConfig({
        visible: true,
        title: 'Profile Updated',
        message: 'Your profile details have been updated successfully.',
        onPrimaryPress: () => {
          setDialogConfig((prev) => ({ ...prev, visible: false }));
          navigation.goBack();
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Avatar & Hero Badge Card */}
          <View style={[styles.profileHeroCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={[styles.avatarBox, { backgroundColor: theme.primaryButton }]}>
              <Text style={[styles.avatarText, { color: theme.primaryButtonText }]}>
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <Text style={[styles.heroName, { color: theme.textPrimary }]}>{user?.name || name}</Text>
            <Text style={[styles.heroEmail, { color: theme.textSecondary }]}>{user?.email || email}</Text>
            <View style={[styles.statusBadge, { backgroundColor: theme.accentMuted }]}>
              <Text style={[styles.statusBadgeText, { color: theme.accent }]}>● Active Account</Text>
            </View>
          </View>

          {/* Error Message Box */}
          {error && (
            <View style={[styles.errorBox, { borderColor: theme.priorityHigh }]}>
              <Text style={[styles.errorText, { color: theme.priorityHigh }]}>{error}</Text>
            </View>
          )}

          {/* Details Form Card */}
          <View style={styles.sectionHeaderBox}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>ACCOUNT DETAILS</Text>
          </View>

          <View style={[styles.detailsCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            {/* Name Detail Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailTextContainer}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>FULL NAME</Text>
                {editingName ? (
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter full name"
                    placeholderTextColor={theme.textMuted}
                    autoFocus
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: theme.textPrimary }]}>{name}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.editBtn,
                  editingName ? { backgroundColor: theme.primaryButton } : { backgroundColor: theme.backgroundSecondary },
                ]}
                onPress={() => setEditingName(!editingName)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.editBtnText,
                    editingName ? { color: theme.primaryButtonText } : { color: theme.textPrimary },
                  ]}
                >
                  {editingName ? 'Done' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Email Detail Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailTextContainer}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>EMAIL ADDRESS</Text>
                {editingEmail ? (
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email address"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoFocus
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: theme.textPrimary }]}>{email}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.editBtn,
                  editingEmail ? { backgroundColor: theme.primaryButton } : { backgroundColor: theme.backgroundSecondary },
                ]}
                onPress={() => setEditingEmail(!editingEmail)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.editBtnText,
                    editingEmail ? { color: theme.primaryButtonText } : { color: theme.textPrimary },
                  ]}
                >
                  {editingEmail ? 'Done' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Changes Button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primaryButton }, shadows.sm]}
            onPress={handleSaveProfile}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={theme.primaryButtonText} />
            ) : (
              <Text style={[styles.saveBtnText, { color: theme.primaryButtonText }]}>Save Profile Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Dialogue */}
      <AuthDialogModal
        visible={dialogConfig.visible}
        type="success"
        title={dialogConfig.title}
        message={dialogConfig.message}
        primaryButtonText="OK"
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 18,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    padding: spacing.containerPadding,
  },
  profileHeroCard: {
    alignItems: 'center',
    borderRadius: radius.xl, // 32px curved radius
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 24,
  },
  heroName: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 20,
    marginBottom: 2,
  },
  heroEmail: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
  },
  sectionHeaderBox: {
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  detailsCard: {
    borderRadius: radius.xl, // 32px curved radius
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  detailTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  fieldLabel: {
    fontFamily: fontFamilies.body,
    fontSize: 10.5,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
  },
  input: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  editBtnText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
  },
  divider: {
    height: 1,
  },
  saveBtn: {
    height: 48,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 14,
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
});
