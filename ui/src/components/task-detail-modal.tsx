import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Modal, Pressable, ScrollView,
  StyleSheet, Switch, Text, TextInput, View,
} from 'react-native';

import { DatePickerInput } from '@/components/date-picker-input';
import { AppColors } from '@/constants/appTheme';
import {
  createUserTask, updateUserTask, deleteUserTask, fetchUserTaskStats,
  type UserTask, type UserTaskDraft, type TaskCategory,
  type UserTaskType, type TaskPriority, type UserTaskStats,
} from '@/api/user-tasks';

// ── Option tables ──────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: 'recovery',  label: '🤝 Recovery'  },
  { value: 'finance',   label: '💰 Finance'   },
  { value: 'health',    label: '🏥 Health'    },
  { value: 'household', label: '🏠 Household' },
  { value: 'family',    label: '👨‍👩‍👧 Family'  },
  { value: 'work',      label: '💼 Work'      },
  { value: 'wellbeing', label: '🧘 Wellbeing' },
  { value: 'learning',  label: '📖 Learning'  },
];

const TYPE_OPTIONS: { value: UserTaskType; label: string; desc: string }[] = [
  { value: 'daily',   label: 'Daily',    desc: 'Resets every day at midnight' },
  { value: 'weekly',  label: 'Weekly',   desc: 'Resets every Monday'          },
  { value: 'onetime', label: 'One-time', desc: 'Completed once and stays done' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'normal', label: 'Normal'  },
  { value: 'high',   label: '⚡ High' },
];

// ── Dropdown field (inline expand) ────────────────────────────────────────────

function DropdownField<T extends string>({
  label, value, options, onChange,
}: {
  label:   string;
  value:   T;
  options: { value: T; label: string; desc?: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={m.fieldWrap}>
      <Text style={m.fieldLabel}>{label}</Text>
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={[m.dropBtn, open && m.dropBtnOpen]}
      >
        <Text style={m.dropBtnText}>{selected?.label ?? value}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={AppColors.textMuted}
        />
      </Pressable>
      {open && (
        <View style={m.dropList}>
          {options.map((opt, i) => (
            <View key={opt.value}>
              {i > 0 && <View style={m.dropDivider} />}
              <Pressable
                onPress={() => { onChange(opt.value); setOpen(false); }}
                style={({ pressed }) => [m.dropItem, pressed && { opacity: 0.7 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[m.dropItemText, opt.value === value && m.dropItemActive]}>
                    {opt.label}
                  </Text>
                  {opt.desc && <Text style={m.dropItemDesc}>{opt.desc}</Text>}
                </View>
                {opt.value === value && (
                  <Ionicons name="checkmark" size={16} color={AppColors.accent} />
                )}
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────────

interface Props {
  userId:      string;
  task:        UserTask | null;     // null = create new
  defaultType: UserTaskType;        // pre-selects tab's type when creating
  onSave:      () => void;
  onClose:     () => void;
}

export function TaskDetailModal({ userId, task, defaultType, onSave, onClose }: Props) {
  const isNew = task === null;

  const [title,           setTitle]           = useState(task?.label ?? '');
  const [note,            setNote]            = useState(task?.note ?? '');
  const [category,        setCategory]        = useState<TaskCategory>(task?.category ?? 'recovery');
  const [type,            setType]            = useState<UserTaskType>(task?.type ?? defaultType);
  const [priority,        setPriority]        = useState<TaskPriority>(task?.priority ?? 'normal');
  const [targetDate,      setTargetDate]      = useState(task?.target_date ?? '');
  const [linkedToSponsor, setLinkedToSponsor] = useState(task?.linked_to_sponsor ?? false);
  const [stats,           setStats]           = useState<UserTaskStats | null>(null);
  const [saving,          setSaving]          = useState(false);
  const [confirmDelete,   setConfirmDelete]   = useState(false);
  const [titleError,      setTitleError]      = useState(false);

  useEffect(() => {
    if (!isNew && task) {
      fetchUserTaskStats(userId, task.id, task.type).then(setStats);
    }
  }, []);

  async function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) { setTitleError(true); return; }

    setSaving(true);
    try {
      const draft: UserTaskDraft = {
        label:             trimmed,
        note:              note.trim() || null,
        category,
        type,
        priority,
        linked_to_sponsor: linkedToSponsor,
        target_date:       targetDate || null,
      };

      if (isNew) await createUserTask(userId, draft);
      else       await updateUserTask(task!.id, draft);

      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    setSaving(true);
    try {
      await deleteUserTask(task.id);
      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.backdrop}>
        <View style={m.sheet}>

          {/* Header */}
          <View style={m.header}>
            <View style={m.headerIcon}>
              <Ionicons
                name={isNew ? 'add-circle-outline' : 'create-outline'}
                size={18}
                color={AppColors.meetings}
              />
            </View>
            <Text style={m.headerTitle}>{isNew ? 'New Task' : 'Edit Task'}</Text>
            <Pressable onPress={onClose} hitSlop={12} style={m.xBtn}>
              <Ionicons name="close" size={20} color={AppColors.text} />
            </Pressable>
          </View>

          <View style={m.divider} />

          {/* Scrollable fields */}
          <ScrollView
            style={m.body}
            contentContainerStyle={m.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <View style={m.fieldWrap}>
              <Text style={m.fieldLabel}>Task Title *</Text>
              <TextInput
                value={title}
                onChangeText={t => { setTitle(t); setTitleError(false); }}
                placeholder="What do you want to do?"
                placeholderTextColor={AppColors.textMuted}
                style={[m.textInput, titleError && m.textInputError]}
                returnKeyType="done"
              />
              {titleError && <Text style={m.errorText}>Title is required.</Text>}
            </View>

            {/* Note */}
            <View style={m.fieldWrap}>
              <Text style={m.fieldLabel}>Note (optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add details or a reminder…"
                placeholderTextColor={AppColors.textMuted}
                style={[m.textInput, m.textInputMulti]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Category */}
            <DropdownField<TaskCategory>
              label="Category"
              value={category}
              options={CATEGORY_OPTIONS}
              onChange={setCategory}
            />

            {/* Type */}
            <DropdownField<UserTaskType>
              label="Task Type"
              value={type}
              options={TYPE_OPTIONS}
              onChange={setType}
            />

            {/* Priority */}
            <DropdownField<TaskPriority>
              label="Priority"
              value={priority}
              options={PRIORITY_OPTIONS}
              onChange={setPriority}
            />

            {/* Target Date */}
            <View style={m.fieldWrap}>
              <View style={m.fieldLabelRow}>
                <Text style={m.fieldLabel}>Target Date (optional)</Text>
                {targetDate !== '' && (
                  <Pressable onPress={() => setTargetDate('')} hitSlop={8}>
                    <Text style={m.clearText}>Clear</Text>
                  </Pressable>
                )}
              </View>
              <DatePickerInput value={targetDate} onChange={setTargetDate} />
            </View>

            {/* Linked to Sponsor */}
            <View style={m.fieldWrap}>
              <View style={m.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={m.switchLabel}>Linked to Sponsor</Text>
                  <Text style={m.switchDesc}>Flag tasks to discuss with your sponsor.</Text>
                </View>
                <Switch
                  value={linkedToSponsor}
                  onValueChange={setLinkedToSponsor}
                  trackColor={{ false: AppColors.hairline, true: AppColors.meetings + '88' }}
                  thumbColor={linkedToSponsor ? AppColors.meetings : AppColors.textMuted}
                />
              </View>
            </View>

            {/* Progress (existing tasks only) */}
            {!isNew && stats !== null && (
              <View style={m.progressSection}>
                <Text style={m.fieldLabel}>Progress</Text>
                <View style={m.progressGrid}>
                  <View style={m.progressCell}>
                    <Text style={m.progressValue}>{stats.streak}</Text>
                    <Text style={m.progressKey}>
                      {type === 'weekly' ? 'Week streak' : 'Day streak'}
                    </Text>
                  </View>
                  <View style={m.progressDivider} />
                  <View style={m.progressCell}>
                    <Text style={m.progressValue}>{stats.total}</Text>
                    <Text style={m.progressKey}>Times done</Text>
                  </View>
                  <View style={m.progressDivider} />
                  <View style={m.progressCell}>
                    <Text style={m.progressValue}>
                      {stats.lastDone
                        ? new Date(stats.lastDone + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                          })
                        : '—'}
                    </Text>
                    <Text style={m.progressKey}>Last done</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={m.divider} />

          {/* Footer */}
          {confirmDelete ? (
            <View style={m.footer}>
              <Text style={m.confirmText}>
                Move this task to Deleted Tasks? You can restore it later.
              </Text>
              <View style={m.footerRow}>
                <Pressable onPress={() => setConfirmDelete(false)} style={[m.footerBtn, m.cancelBtn]}>
                  <Text style={m.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleDelete} style={[m.footerBtn, m.deleteBtn]} disabled={saving}>
                  {saving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={m.deleteBtnText}>Delete</Text>}
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={m.footer}>
              {!isNew && (
                <Pressable onPress={() => setConfirmDelete(true)} style={m.deleteLinkBtn}>
                  <Ionicons name="trash-outline" size={15} color="#EF4444" />
                  <Text style={m.deleteLinkText}>Delete task</Text>
                </Pressable>
              )}
              <View style={m.footerRow}>
                <Pressable onPress={onClose} style={[m.footerBtn, m.cancelBtn]}>
                  <Text style={m.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSave} style={[m.footerBtn, m.saveBtn]} disabled={saving}>
                  {saving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={m.saveBtnText}>{isNew ? 'Add Task' : 'Save'}</Text>}
                </Pressable>
              </View>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const m = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#101521',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderBottomWidth: 0,
  },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, gap: 12,
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: AppColors.meetings + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, color: AppColors.text, fontSize: 18, fontWeight: '700' },
  xBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: AppColors.screen,
    alignItems: 'center', justifyContent: 'center',
  },

  divider: { height: 1, backgroundColor: AppColors.hairline },

  body: { flexShrink: 1 },
  bodyContent: { padding: 20, gap: 16, paddingBottom: 8 },

  fieldWrap:     { gap: 6 },
  fieldLabel:    {
    color: AppColors.accent, fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  fieldLabelRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  clearText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },

  textInput: {
    backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: AppColors.text, fontSize: 15,
    outlineStyle: 'none' as any,
  },
  textInputError: { borderColor: '#EF4444' },
  textInputMulti: { minHeight: 76, paddingTop: 12 },
  errorText:      { color: '#EF4444', fontSize: 12 },

  dropBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
  },
  dropBtnOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: 'transparent',
  },
  dropBtnText: { flex: 1, color: AppColors.text, fontSize: 15 },

  dropList: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderTopWidth: 0, borderColor: AppColors.tileBorder,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  dropDivider: { height: 1, backgroundColor: AppColors.hairline },
  dropItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11, gap: 10,
  },
  dropItemText:   { color: AppColors.text, fontSize: 14 },
  dropItemActive: { color: AppColors.accent, fontWeight: '600' },
  dropItemDesc:   { color: AppColors.textMuted, fontSize: 11, marginTop: 1 },

  switchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
  },
  switchLabel: { color: AppColors.text, fontSize: 15, fontWeight: '500' },
  switchDesc:  { color: AppColors.textMuted, fontSize: 12, marginTop: 2 },

  progressSection: {
    backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 10, padding: 14, gap: 12,
  },
  progressGrid:    { flexDirection: 'row', alignItems: 'center' },
  progressCell:    { flex: 1, alignItems: 'center', gap: 3 },
  progressDivider: { width: 1, height: 34, backgroundColor: AppColors.hairline },
  progressValue:   { color: AppColors.text, fontSize: 22, fontWeight: '700' },
  progressKey:     { color: AppColors.textMuted, fontSize: 11 },

  footer:    { padding: 16, gap: 10 },
  footerRow: { flexDirection: 'row', gap: 10 },
  footerBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtn:      { backgroundColor: AppColors.tile, borderWidth: 1, borderColor: AppColors.tileBorder },
  cancelBtnText:  { color: AppColors.text, fontSize: 15, fontWeight: '600' },
  saveBtn:        { backgroundColor: AppColors.meetings },
  saveBtnText:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  deleteBtn:      { backgroundColor: '#EF4444' },
  deleteBtnText:  { color: '#fff', fontSize: 15, fontWeight: '700' },
  confirmText:    { color: AppColors.textMuted, fontSize: 13, textAlign: 'center' },
  deleteLinkBtn:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 2,
  },
  deleteLinkText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
});
