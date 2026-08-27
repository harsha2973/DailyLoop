import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, fontFamilies } from '../theme/colors';

export interface AuthDialogModalProps {
  visible: boolean;
  type?: 'account_not_found' | 'invalid_password' | 'task_notification' | 'info' | 'success';
  title: string;
  message: string;
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  onClose: () => void;
}

export const AuthDialogModal: React.FC<AuthDialogModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  primaryButtonText = 'OK',
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
  onClose,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.dialogCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Title & Description */}
              <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
              <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

              {/* Action Buttons Row */}
              <View style={styles.buttonRow}>
                {secondaryButtonText ? (
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      {
                        backgroundColor: theme.secondaryButton,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => {
                      if (onSecondaryPress) onSecondaryPress();
                      else onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.secondaryButtonText, { color: theme.secondaryButtonText }]}>
                      {secondaryButtonText}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    secondaryButtonText ? styles.flexBtn : styles.fullWidthBtn,
                    { backgroundColor: theme.primaryButton },
                  ]}
                  onPress={() => {
                    if (onPrimaryPress) onPrimaryPress();
                    else onClose();
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.primaryButtonText, { color: theme.primaryButtonText }]}>
                    {primaryButtonText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 27, 23, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.containerPadding,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#24231D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontFamily: fontFamilies.heading,
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  message: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  primaryButton: {
    height: 44,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexBtn: {
    flex: 1,
  },
  fullWidthBtn: {
    width: '100%',
  },
  primaryButtonText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontFamily: fontFamilies.body,
    fontWeight: '600',
    fontSize: 13,
  },
});
