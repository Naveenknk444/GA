import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home-backdrop';
import { TaskDetailModal } from '@/components/task-detail-modal';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import { useDrawer } from '@/context/drawer';
import {
  checkIn, unCheckIn, fetchCheckins, fetchChecklistTasks,
  fetchHiddenSystemTaskKeys, hideSystemTask, restoreSystemTask,
  getMondayStr, type Task, type TaskGroups, type CheckinState,
} from '@/api/checklist';
import {
  fetchUserTasks, fetchDeletedUserTasks, fetchUserTaskCheckins,
  checkInUserTask, unCheckInUserTask, restoreUserTask, deleteUserTask,
  type UserTask, type UserTaskGroups, type UserTaskType,
} from '@/api/user-tasks';

// ── Types & constants ──────────────────────────────────────────────────────────

type Tab = 'daily' | 'weekly' | 'onetime';

const TABS: { key: Tab; label: string }[] = [
  { key: 'daily',   label: 'Daily'    },
  { key: 'weekly',  label: 'Weekly'   },
  { key: 'onetime', label: 'One-time' },
];

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function dateLabel(type: Tab): string {
  const now = new Date();
  if (type === 'daily')  return `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  if (type === 'weekly') {
    const mon = new Date(getMondayStr(now));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return `${MONTHS[mon.getMonth()]} ${mon.getDate()} – ${MONTHS[sun.getMonth()]} ${sun.getDate()}`;
  }
  return 'Completed for good';
}

function resetLabel(type: Tab): string {
  if (type === 'daily')  return 'Resets at midnight every day';
  if (type === 'weekly') return 'Resets every Monday';
  return 'These are done once and stay done';
}

// ── Row components ─────────────────────────────────────────────────────────────

function SystemTaskRow({
  task, done, editMode, onToggle, onHide,
}: {
  task:     Task;
  done:     boolean;
  editMode: boolean;
  onToggle: () => void;
  onHide:   () => void;
}) {
  if (editMode) {
    return (
      <View style={s.editTaskRow}>
        <Pressable onPress={onHide} hitSlop={10} style={s.deleteRowBtn}>
          <Ionicons name="remove-circle" size={22} color="#EF4444" />
        </Pressable>
        <Pressable onPress={onToggle} style={[s.check, done && s.checkDone]}>
          {done && <Ionicons name="checkmark" size={14} color="#fff" />}
        </Pressable>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[s.taskLabel, done && s.taskLabelDone]} numberOfLines={1}>
            {task.label}
          </Text>
          {task.sublabel && <Text style={s.taskSub}>{task.sublabel}</Text>}
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [s.taskRow, pressed && { opacity: 0.65 }]}
    >
      <View style={[s.check, done && s.checkDone]}>
        {done && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[s.taskLabel, done && s.taskLabelDone]}>{task.label}</Text>
        {task.sublabel && <Text style={s.taskSub}>{task.sublabel}</Text>}
      </View>
    </Pressable>
  );
}

function UserTaskRow({
  task, done, editMode, onToggle, onEdit, onDelete,
}: {
  task:     UserTask;
  done:     boolean;
  editMode: boolean;
  onToggle: () => void;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  if (editMode) {
    return (
      <View style={s.editTaskRow}>
        <Pressable onPress={onDelete} hitSlop={10} style={s.deleteRowBtn}>
          <Ionicons name="remove-circle" size={22} color="#EF4444" />
        </Pressable>
        <Pressable onPress={onToggle} style={[s.check, done && s.checkDone]}>
          {done && <Ionicons name="checkmark" size={14} color="#fff" />}
        </Pressable>
        <Text style={[s.taskLabel, { flex: 1 }, done && s.taskLabelDone]} numberOfLines={1}>
          {task.label}
        </Text>
        {task.priority === 'high' && !done && <Text style={s.highIcon}>⚡</Text>}
        <Pressable onPress={onEdit} hitSlop={10} style={s.editRowBtn}>
          <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [s.taskRow, pressed && { opacity: 0.65 }]}
    >
      <View style={[s.check, done && s.checkDone]}>
        {done && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <Text style={[s.taskLabel, { flex: 1 }, done && s.taskLabelDone]}>
        {task.label}
      </Text>
      {task.priority === 'high' && !done && <Text style={s.highIcon}>⚡</Text>}
    </Pressable>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function ChecklistScreen() {
  const { user } = useAuth();
  const { open } = useDrawer();

  const [tab,             setTab]             = useState<Tab>('daily');
  const [groups,          setGroups]          = useState<TaskGroups>({ daily: [], weekly: [], onetime: [] });
  const [state,           setState]           = useState<CheckinState>({ daily: new Set(), weekly: new Set(), onetime: new Set() });
  const [userGroups,      setUserGroups]      = useState<UserTaskGroups>({ daily: [], weekly: [], onetime: [] });
  const [userCheckins,    setUserCheckins]    = useState<Set<string>>(new Set());
  const [deletedTasks,    setDeletedTasks]    = useState<UserTask[]>([]);
  const [hiddenSystemKeys, setHiddenSystemKeys] = useState<Set<string>>(new Set());
  const [loading,         setLoading]         = useState(true);
  const [editMode,        setEditMode]        = useState(false);
  const [showDeleted,     setShowDeleted]     = useState(false);
  const [showModal,       setShowModal]       = useState(false);
  const [editingTask,     setEditingTask]     = useState<UserTask | null>(null);

  async function loadAll() {
    if (!user) return;
    const [g, ug, del, hiddenKeys] = await Promise.all([
      fetchChecklistTasks(),
      fetchUserTasks(user.id),
      fetchDeletedUserTasks(user.id),
      fetchHiddenSystemTaskKeys(user.id),
    ]);
    setGroups(g);
    setUserGroups(ug);
    setDeletedTasks(del);
    setHiddenSystemKeys(hiddenKeys);

    const allUserTasks = [...ug.daily, ...ug.weekly, ...ug.onetime];
    const [sysCheckins, userCheckinSet] = await Promise.all([
      fetchCheckins(user.id, g),
      fetchUserTaskCheckins(user.id, allUserTasks),
    ]);
    setState(sysCheckins);
    setUserCheckins(userCheckinSet);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, [user]);

  async function toggleSystem(task: Task) {
    if (!user) return;
    const set  = state[task.type];
    const done = set.has(task.key);
    const next = new Set(set);
    done ? next.delete(task.key) : next.add(task.key);
    setState(prev => ({ ...prev, [task.type]: next }));
    if (done) await unCheckIn(user.id, task);
    else      await checkIn(user.id, task);
  }

  async function toggleUser(task: UserTask) {
    if (!user) return;
    const done = userCheckins.has(task.id);
    const next = new Set(userCheckins);
    done ? next.delete(task.id) : next.add(task.id);
    setUserCheckins(next);
    if (done) await unCheckInUserTask(user.id, task);
    else      await checkInUserTask(user.id, task);
  }

  async function handleHideSystemTask(taskKey: string) {
    if (!user) return;
    await hideSystemTask(user.id, taskKey);
    loadAll();
  }

  async function handleRestoreSystemTask(taskKey: string) {
    if (!user) return;
    await restoreSystemTask(user.id, taskKey);
    loadAll();
  }

  async function handleQuickDelete(task: UserTask) {
    await deleteUserTask(task.id);
    loadAll();
  }

  async function handleRestore(taskId: string) {
    await restoreUserTask(taskId);
    loadAll();
  }

  function openCreate() { setEditingTask(null); setShowModal(true); }
  function openEdit(task: UserTask) { setEditingTask(task); setShowModal(true); }

  // ── Derived data for current tab ──
  const allSysForTab  = groups[tab];
  const sysTasks      = allSysForTab.filter(t => !hiddenSystemKeys.has(t.key));
  const hiddenSys     = allSysForTab.filter(t => hiddenSystemKeys.has(t.key));
  const userTasks     = userGroups[tab];
  const doneSet       = state[tab];

  const totalCount = sysTasks.length + userTasks.length;
  const doneCount  =
    sysTasks.filter(t => doneSet.has(t.key)).length +
    userTasks.filter(t => userCheckins.has(t.id)).length;

  const deletedForTab      = deletedTasks.filter(t => t.type === tab);
  const hasRemovedContent  = deletedForTab.length > 0 || hiddenSys.length > 0;
  const hasContent         = sysTasks.length > 0 || userTasks.length > 0;

  return (
    <View style={{ flex: 1 }}>
      <HomeBackdrop />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={open} hitSlop={10}>
            <Ionicons name="menu" size={22} color={AppColors.text} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.title}>Daily Checklist</Text>
            <Text style={s.subtitle}>GA Program · Page 17</Text>
          </View>
          <Pressable
            onPress={() => { setEditMode(e => !e); setShowDeleted(false); }}
            hitSlop={10}
            style={s.editBtn}
          >
            <Text style={s.editBtnText}>{editMode ? 'Done' : ''}</Text>
            {!editMode && <Ionicons name="pencil" size={17} color={AppColors.accent} />}
          </Pressable>
        </View>

        {/* Tab bar */}
        <View style={s.tabBar}>
          {TABS.map(t => {
            const active = tab === t.key;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)}
                style={[s.tabItem, active && s.tabItemActive]}>
                <Text style={[s.tabLabel, active && s.tabLabelActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color={AppColors.accent} size="large" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

            {/* Period label */}
            <View style={s.periodRow}>
              <Ionicons
                name={tab === 'daily' ? 'sunny-outline' : tab === 'weekly' ? 'calendar-outline' : 'ribbon-outline'}
                size={14} color={AppColors.accent}
              />
              <Text style={s.periodText}>{dateLabel(tab)}</Text>
            </View>

            {/* Progress bar */}
            {tab !== 'onetime' && totalCount > 0 && (
              <View style={s.progressCard}>
                <View style={s.progressBar}>
                  <View style={[s.progressFill, { width: `${(doneCount / totalCount) * 100}%` as any }]} />
                </View>
                <Text style={s.progressLabel}>{doneCount} of {totalCount} completed</Text>
              </View>
            )}

            {hasContent || editMode ? (
              <View style={s.card}>

                {/* ── MY TASKS (top) ── */}
                {(userTasks.length > 0 || editMode) && (
                  <>
                    <View style={s.sectionHeader}>
                      <Text style={s.sectionHeaderText}>My Tasks</Text>
                    </View>

                    {userTasks.map((task, i) => (
                      <View key={task.id}>
                        {i > 0 && <View style={s.divider} />}
                        <UserTaskRow
                          task={task}
                          done={userCheckins.has(task.id)}
                          editMode={editMode}
                          onToggle={() => toggleUser(task)}
                          onEdit={() => openEdit(task)}
                          onDelete={() => handleQuickDelete(task)}
                        />
                      </View>
                    ))}

                    {/* Add task button */}
                    {editMode && (
                      <>
                        {userTasks.length > 0 && <View style={s.divider} />}
                        <Pressable
                          onPress={openCreate}
                          style={({ pressed }) => [s.addTaskRow, pressed && { opacity: 0.7 }]}
                        >
                          <Ionicons name="add-circle-outline" size={20} color={AppColors.meetings} />
                          <Text style={s.addTaskText}>Add a task</Text>
                        </Pressable>
                      </>
                    )}
                  </>
                )}

                {/* ── GA PROGRAM DEFAULTS (bottom) ── */}
                {sysTasks.length > 0 && (
                  <>
                    {(userTasks.length > 0 || editMode) && <View style={s.divider} />}
                    <View style={s.gaHeader}>
                      <Ionicons name="book-outline" size={11} color={AppColors.recovery} />
                      <Text style={[s.sectionHeaderText, { color: AppColors.recovery }]}>GA Program</Text>
                    </View>

                    {sysTasks.map((task, i) => (
                      <View key={task.key}>
                        {i > 0 && <View style={s.divider} />}
                        <SystemTaskRow
                          task={task}
                          done={doneSet.has(task.key)}
                          editMode={editMode}
                          onToggle={() => toggleSystem(task)}
                          onHide={() => handleHideSystemTask(task.key)}
                        />
                      </View>
                    ))}
                  </>
                )}

              </View>
            ) : (
              <View style={s.empty}>
                <Ionicons name="checkmark-circle-outline" size={36} color={AppColors.textMuted} />
                <Text style={s.emptyText}>No tasks for this period.</Text>
                <Text style={s.emptySub}>Tap the pencil to add your own tasks.</Text>
              </View>
            )}

            {/* Removed / Hidden tasks (edit mode only) */}
            {editMode && hasRemovedContent && (
              <View style={s.deletedCard}>
                <Pressable
                  onPress={() => setShowDeleted(o => !o)}
                  style={s.deletedHeader}
                >
                  <Ionicons name="trash-outline" size={14} color={AppColors.textMuted} />
                  <Text style={s.deletedHeaderText}>
                    Removed Tasks ({deletedForTab.length + hiddenSys.length})
                  </Text>
                  <Ionicons
                    name={showDeleted ? 'chevron-up' : 'chevron-down'}
                    size={14} color={AppColors.textMuted}
                  />
                </Pressable>

                {showDeleted && (
                  <View>
                    {/* Hidden GA system tasks */}
                    {hiddenSys.map((task, i) => (
                      <View key={task.key}>
                        {i > 0 && <View style={s.divider} />}
                        <View style={s.deletedRow}>
                          <Ionicons name="book-outline" size={12} color={AppColors.textMuted} style={{ marginTop: 1 }} />
                          <Text style={s.deletedLabel} numberOfLines={1}>{task.label}</Text>
                          <Pressable
                            onPress={() => handleRestoreSystemTask(task.key)}
                            style={s.restoreBtn}
                          >
                            <Text style={s.restoreBtnText}>Restore</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}

                    {/* Deleted user tasks */}
                    {deletedForTab.map((task, i) => (
                      <View key={task.id}>
                        {(i > 0 || hiddenSys.length > 0) && <View style={s.divider} />}
                        <View style={s.deletedRow}>
                          <Text style={s.deletedLabel} numberOfLines={1}>{task.label}</Text>
                          <Pressable
                            onPress={() => handleRestore(task.id)}
                            style={s.restoreBtn}
                          >
                            <Text style={s.restoreBtnText}>Restore</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <Text style={s.resetNote}>{resetLabel(tab)}</Text>

          </ScrollView>
        )}

      </SafeAreaView>

      {showModal && user && (
        <TaskDetailModal
          userId={user.id}
          task={editingTask}
          defaultType={tab as UserTaskType}
          onSave={loadAll}
          onClose={() => setShowModal(false)}
        />
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10,
  },
  title:    { color: AppColors.text, fontSize: 22, fontWeight: '700' },
  subtitle: { color: AppColors.textMuted, fontSize: 12, marginTop: 1 },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  editBtnText: { color: AppColors.accent, fontSize: 15, fontWeight: '600' },

  tabBar: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 14,
    backgroundColor: AppColors.tile, borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: AppColors.tileBorder,
  },
  tabItem:        { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  tabItemActive:  { backgroundColor: AppColors.accent },
  tabLabel:       { color: AppColors.textMuted, fontSize: 13, fontWeight: '500' },
  tabLabelActive: { color: '#fff', fontWeight: '700' },

  body: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },

  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  periodText: { color: AppColors.accent, fontSize: 13, fontWeight: '600' },

  progressCard:  { gap: 6 },
  progressBar:   { height: 6, backgroundColor: AppColors.hairline, borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: 6, backgroundColor: AppColors.meetings, borderRadius: 3 },
  progressLabel: { color: AppColors.textMuted, fontSize: 12 },

  card: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 16, overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: AppColors.hairline },

  sectionHeader: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(59,130,246,0.06)',
  },
  sectionHeaderText: {
    color: AppColors.accent, fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  gaHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(139,92,246,0.06)',
  },

  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  check: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: AppColors.hairline,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  checkDone:     { backgroundColor: AppColors.meetings, borderColor: AppColors.meetings },
  taskLabel:     { color: AppColors.text, fontSize: 15, fontWeight: '500' },
  taskLabelDone: { color: AppColors.textMuted, textDecorationLine: 'line-through' },
  taskSub:       { color: AppColors.textMuted, fontSize: 12 },
  highIcon:      { fontSize: 12 },

  editTaskRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingVertical: 12, paddingHorizontal: 12,
  },
  deleteRowBtn: { padding: 2 },
  editRowBtn:   { padding: 4 },

  addTaskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16,
  },
  addTaskText: { color: AppColors.meetings, fontSize: 15, fontWeight: '500' },

  deletedCard: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 16, overflow: 'hidden',
  },
  deletedHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14,
  },
  deletedHeaderText: { flex: 1, color: AppColors.textMuted, fontSize: 13, fontWeight: '600' },
  deletedRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 8,
  },
  deletedLabel: { flex: 1, color: AppColors.textMuted, fontSize: 14 },
  restoreBtn: {
    backgroundColor: AppColors.accent + '20',
    borderWidth: 1, borderColor: AppColors.accent + '40',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  restoreBtnText: { color: AppColors.accent, fontSize: 12, fontWeight: '600' },

  empty:     { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: AppColors.text, fontSize: 15, fontWeight: '600' },
  emptySub:  { color: AppColors.textMuted, fontSize: 13, textAlign: 'center' },

  resetNote: {
    color: AppColors.textMuted, fontSize: 12,
    textAlign: 'center', fontStyle: 'italic',
  },
});
