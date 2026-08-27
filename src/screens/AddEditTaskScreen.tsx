import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';
import { Priority, Task, TimeOfDay } from '../types';

const CATEGORIES = ['Work', 'Personal', 'Health', 'Study', 'General'];

const TIME_OF_DAY_OPTIONS: { id: TimeOfDay; label: string }[] = [
  { id: 'Morning', label: 'Morning' },
  { id: 'Afternoon', label: 'Afternoon' },
  { id: 'Evening', label: 'Evening' },
  { id: 'Night', label: 'Night' },
];

const defaultDateTime = () => new Date();
const defaultDeadline = () => new Date(Date.now() + 24 * 60 * 60 * 1000);

export const AddEditTaskScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const existingTask: Task | undefined = route.params?.task;
  const isEditing = !!existingTask;

  const { addTask, editTask, defaultPriority } = useTasks();
  const { theme } = useTheme();

  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [category, setCategory] = useState(existingTask?.category || 'Work');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(existingTask?.timeOfDay || 'Morning');
  const [priority, setPriority] = useState<Priority>(existingTask?.priority || defaultPriority || 'medium');
  const [dateTime, setDateTime] = useState(
    existingTask ? new Date(existingTask.dateTime) : defaultDateTime()
  );
  const [deadline, setDeadline] = useState(
    existingTask ? new Date(existingTask.deadline) : defaultDeadline()
  );

  const [pickerTarget, setPickerTarget] = useState<'dateTime' | 'deadline' | null>(null);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [titleError, setTitleError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const priorities: { id: Priority; label: string; bg: string; text: string }[] = [
    { id: 'high', label: 'High', bg: theme.priorityHighBg, text: theme.priorityHighText },
    { id: 'medium', label: 'Medium', bg: theme.priorityMediumBg, text: theme.priorityMediumText },
    { id: 'low', label: 'Low', bg: theme.priorityLowBg, text: theme.priorityLowText },
  ];

  const handleOpenPicker = (target: 'dateTime' | 'deadline', mode: 'date' | 'time') => {
    setPickerTarget(target);
    setPickerMode(mode);
  };

  const handlePickerChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed' || !selectedDate) {
      setPickerTarget(null);
      return;
    }

    const isDateTime = pickerTarget === 'dateTime';
    const currentDate = isDateTime ? dateTime : deadline;
    const setter = isDateTime ? setDateTime : setDeadline;

    const updated = new Date(currentDate);
    if (pickerMode === 'date') {
      updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    } else {
      updated.setHours(selectedDate.getHours(), selectedDate.getMinutes());
    }

    setter(updated);
    setPickerTarget(null);
  };

  const handleSave = async () => {
    setSubmitError(null);

    if (!title.trim()) {
      setTitleError('Task title is required');
      return;
    }
    setTitleError(undefined);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      timeOfDay,
      priority,
      dateTime: dateTime.toISOString(),
      deadline: deadline.toISOString(),
    };

    setLoading(true);
    try {
      if (isEditing) {
        await editTask(existingTask!._id, payload);
      } else {
        await addTask(payload);
      }
      navigation.goBack();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save task.');
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
        {/* Navigation Header */}
        <View style={[styles.navHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>{isEditing ? 'Edit Task' : 'New Task'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Card 1: Task Details (Title & Description) */}
          <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>TASK TITLE</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.titleInput, { color: theme.textPrimary }]}
                  placeholder="e.g. Finish project proposal"
                  placeholderTextColor={theme.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              {!!titleError && <Text style={[styles.fieldError, { color: theme.danger }]}>{titleError}</Text>}
            </View>

            <View style={styles.fieldGroupLast}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>DESCRIPTION (OPTIONAL)</Text>
              <View style={[styles.textAreaContainer, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.textAreaInput, { color: theme.textPrimary }]}
                  placeholder="Add notes or subtasks..."
                  placeholderTextColor={theme.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>

          {/* Card 2: Organization (Time of Day & Category) */}
          <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>TIME OF DAY</Text>
              <View style={styles.chipRow}>
                {TIME_OF_DAY_OPTIONS.map((item) => {
                  const active = timeOfDay === item.id;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setTimeOfDay(item.id)}
                      style={[
                        styles.chipPill,
                        {
                          backgroundColor: active ? theme.primaryButton : theme.surfaceSecondary,
                          borderColor: active ? theme.primaryButton : theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.chipPillText, { color: active ? theme.primaryButtonText : theme.textSecondary }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroupLast}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {CATEGORIES.map((cat) => {
                  const active = category === cat;

                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.chipPill,
                        {
                          backgroundColor: active ? theme.primaryButton : theme.surfaceSecondary,
                          borderColor: active ? theme.primaryButton : theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.chipPillText, { color: active ? theme.primaryButtonText : theme.textSecondary }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Card 3: Priority */}
          <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={styles.fieldGroupLast}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>PRIORITY</Text>
              <View style={styles.priorityRow}>
                {priorities.map((p) => {
                  const active = priority === p.id;

                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setPriority(p.id)}
                      style={[
                        styles.priorityBtn,
                        { backgroundColor: active ? p.bg : theme.surfaceSecondary, borderColor: theme.border },
                        active && { borderColor: p.text },
                      ]}
                    >
                      <Text style={[styles.priorityBtnText, { color: active ? p.text : theme.textSecondary }]}>
                        ● {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Card 4: Schedule & Deadline */}
          <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={styles.fieldGroupLast}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>SCHEDULE AND DEADLINE</Text>
              <View style={[styles.timingCard, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                {/* Scheduled Row */}
                <View style={styles.timingRow}>
                  <Text style={[styles.timingLabel, { color: theme.textPrimary }]}>Scheduled</Text>
                  <View style={styles.pickerPillsRow}>
                    <TouchableOpacity
                      style={[styles.pickerPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => handleOpenPicker('dateTime', 'date')}
                    >
                      <Text style={[styles.pickerPillText, { color: theme.textPrimary }]}>
                        {dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.pickerPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => handleOpenPicker('dateTime', 'time')}
                    >
                      <Text style={[styles.pickerPillText, { color: theme.textPrimary }]}>
                        {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.timingDivider, { backgroundColor: theme.border }]} />

                {/* Deadline Row */}
                <View style={styles.timingRow}>
                  <Text style={[styles.timingLabel, { color: theme.textPrimary }]}>Deadline</Text>
                  <View style={styles.pickerPillsRow}>
                    <TouchableOpacity
                      style={[styles.pickerPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => handleOpenPicker('deadline', 'date')}
                    >
                      <Text style={[styles.pickerPillText, { color: theme.textPrimary }]}>
                        {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.pickerPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => handleOpenPicker('deadline', 'time')}
                    >
                      <Text style={[styles.pickerPillText, { color: theme.textPrimary }]}>
                        {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {pickerTarget !== null && (
            <DateTimePicker
              value={pickerTarget === 'dateTime' ? dateTime : deadline}
              mode={Platform.OS === 'ios' ? 'datetime' : pickerMode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handlePickerChange}
            />
          )}

          {!!submitError && <Text style={[styles.submitError, { color: theme.danger }]}>{submitError}</Text>}
        </ScrollView>

        {/* Floating Bottom Action Button Bar */}
        <SafeAreaView pointerEvents="box-none" style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={[styles.createTaskButton, { backgroundColor: theme.primaryButton }, shadows.md]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={theme.primaryButtonText} />
            ) : (
              <Text style={[styles.createTaskButtonText, { color: theme.primaryButtonText }]}>
                {isEditing ? 'Save Changes' : 'Create Task'}
              </Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  cancelBtn: {
    paddingVertical: spacing.xs,
  },
  cancelText: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
  },
  screenTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 48,
  },
  container: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.lg,
    paddingBottom: 110, // Generous padding so content scrolls behind floating button
    gap: spacing.lg,
  },
  sectionCard: {
    borderRadius: radius.xl, // 32px curved radius
    padding: spacing.lg,
    borderWidth: 1,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  fieldGroupLast: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    marginBottom: spacing.xs + 2,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  inputContainer: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 48,
    justifyContent: 'center',
  },
  titleInput: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
  },
  fieldError: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  textAreaContainer: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 90,
  },
  textAreaInput: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chipPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipPillText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryScroll: {
    gap: spacing.sm,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityBtnText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: '600',
  },
  timingCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  timingLabel: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
  },
  pickerPillsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  pickerPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pickerPillText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: '500',
  },
  timingDivider: {
    height: 1,
  },
  submitError: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.containerPadding,
  },
  createTaskButton: {
    height: 52,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createTaskButtonText: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
    fontWeight: '600',
  },
});
