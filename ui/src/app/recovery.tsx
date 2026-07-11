import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import {
  ActivityIndicator, Linking, Modal, Pressable,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  earnAchievement, fetchAchievementsWithStatus, milestoneDate,
  syncAutoAchievements, type AchievementWithStatus,
} from '@/api/achievements';
import { fetchProfile, updateGamblingTypes, updateQuizScore } from '@/api/profile';
import { fetchResources, type Resource } from '@/api/resources';
import { HomeBackdrop } from '@/components/home-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import { useDrawer } from '@/context/drawer';

// ─── constants ────────────────────────────────────────────────────
const TABS = [
  { key: 'start',        label: 'Getting Started' },
  { key: 'material',     label: 'Resources' },
  { key: 'achievements', label: 'Achievements' },
] as const;
type Tab = (typeof TABS)[number]['key'];

const GAMBLING_TYPES = [
  'Sports Betting', 'Casino', 'Online Gambling', 'Poker',
  'Lottery / Scratch Cards', 'Horse / Dog Racing',
  'Bingo', 'Stocks / Crypto', 'Other',
];

const QUESTIONS = [
  'Did you ever lose time from work or school due to gambling?',
  'Has gambling ever made your home life unhappy?',
  'Did gambling affect your reputation?',
  'Have you ever felt remorse after gambling?',
  'Did you ever gamble to get money to pay debts or otherwise solve financial difficulties?',
  'Did gambling cause a decrease in your ambition or efficiency?',
  'After losing, did you feel you must return as soon as possible and win back your losses?',
  'After a win, did you have a strong urge to return and win more?',
  'Did you often gamble until your last dollar was gone?',
  'Did you ever borrow to finance your gambling?',
  'Have you ever sold anything to finance gambling?',
  'Were you reluctant to use "gambling money" for normal expenditures?',
  'Did gambling make you careless of the welfare of yourself or your family?',
  'Did you ever gamble longer than you had planned?',
  'Have you ever gambled to escape worry or trouble?',
  'Have you ever committed, or considered committing, an illegal act to finance gambling?',
  'Did gambling cause you to have difficulty sleeping?',
  'Do arguments, disappointments or frustrations create within you an urge to gamble?',
  'Did you ever have an urge to celebrate good fortune with a few hours of gambling?',
  'Have you ever considered self-destruction or suicide as a result of your gambling?',
];

const RESOURCE_CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  newcomer:       { label: 'Getting Started',       icon: 'star-outline',          color: AppColors.accent },
  literature:     { label: 'GA Literature',          icon: 'book-outline',          color: AppColors.talk },
  gamban:         { label: 'Block Gambling',         icon: 'shield-checkmark',      color: '#EF4444' },
  self_exclusion: { label: 'Self-Exclusion & Help',  icon: 'hand-left-outline',     color: AppColors.share },
};

const SELF_REPORT_COPY: Record<string, string> = {
  first_meeting:    'Attending your first GA meeting is a huge step. Well done for showing up.',
  installed_gamban: 'Blocking gambling sites takes real commitment. This is a powerful choice.',
  self_excluded:    'Self-exclusion is one of the strongest tools in your recovery. Be proud.',
};

// Maps achievement keys that are tied to clean-date milestones → days after clean date
const CLEAN_DATE_MILESTONE_DAYS: Record<string, number> = {
  '1_day_clean':     1,
  '1_week_clean':    7,
  '1_month_clean':   30,
  '2_months_clean':  60,
  '3_months_clean':  90,
  '6_months_clean':  180,
  '1_year_clean':    365,
  '18_months_clean': 540,
};

function earnedDate(str: string) {
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Day 1 checklist ──────────────────────────────────────────────
function Day1Checklist({
  profile, achievements, manual, setManual, router,
}: {
  profile: any; achievements: AchievementWithStatus[];
  manual: Set<string>; setManual: (s: Set<string>) => void; router: any;
}) {
  const quizDone = achievements.find(a => a.key === 'completed_20_questions')?.earned
    ?? (profile?.quiz_score !== null && profile?.quiz_score !== undefined);

  const TASKS = [
    { key: 'helpline',  label: 'Call the GA helpline',        sublabel: '1-800-522-4700',        auto: false, action: () => Linking.openURL('tel:18005224700') },
    { key: 'meeting',   label: 'Find a meeting near you',     sublabel: 'Browse the Meetings tab', auto: false, action: () => router.push('/meetings') },
    { key: 'tell',      label: 'Tell one person you trust',   sublabel: 'Share your decision',    auto: false, action: null },
    { key: 'rec_date',  label: 'Set your recovery date',      sublabel: 'Set in Profile tab',     auto: true,  done: !!profile?.clean_date },
    { key: 'quiz',      label: 'Complete the 20 Questions',   sublabel: 'See the quiz below',     auto: true,  done: quizDone },
    { key: 'gamban',    label: 'Install Gamban',              sublabel: 'Third-party paid app · blocks gambling sites', auto: false, action: () => WebBrowser.openBrowserAsync('https://gamban.com') },
    { key: 'how_ga',    label: "Read 'How GA Works'",         sublabel: 'GA official guide',      auto: false, action: () => WebBrowser.openBrowserAsync('https://www.gamblersanonymous.org/ga/content/unity-program') },
  ];

  function toggle(key: string) {
    const next = new Set(manual);
    next.has(key) ? next.delete(key) : next.add(key);
    setManual(next);
  }

  const doneCount = TASKS.filter(t => (t.auto ? (t.done ?? false) : manual.has(t.key))).length;

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.cardTitle}>Day 1 Checklist</Text>
        <Text style={s.cardBadge}>{doneCount}/{TASKS.length}</Text>
      </View>
      {TASKS.map((t) => {
        const done = t.auto ? (t.done ?? false) : manual.has(t.key);
        return (
          <Pressable
            key={t.key}
            style={s.taskRow}
            onPress={() => {
              if (t.auto) { (t as any).action?.(); }
              else if ((t as any).action) { (t as any).action(); }
              else toggle(t.key);
            }}>
            <View style={[s.taskCheck, done && s.taskCheckDone]}>
              {done && <Ionicons name="checkmark" size={13} color="#fff" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.taskLabel, done && s.taskLabelDone]}>{t.label}</Text>
              <Text style={s.taskSub}>{t.sublabel}</Text>
            </View>
            {!(t as any).auto && (t as any).action && (
              <Ionicons name="chevron-forward" size={15} color={AppColors.textMuted} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Gambling type selector ────────────────────────────────────────
function GamblingTypeSelector({
  selected, onSave, saving,
}: { selected: string[]; onSave: (t: string[]) => void; saving: boolean }) {
  const [local, setLocal] = useState<string[]>(selected);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { setLocal(selected); }, [selected.join(',')]);

  function toggle(t: string) {
    setLocal(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  const changed = JSON.stringify([...local].sort()) !== JSON.stringify([...selected].sort());

  return (
    <View style={s.card}>
      <Pressable style={s.collapsibleHeader} onPress={() => setExpanded(e => !e)}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>Your Gambling Type</Text>
          {!expanded && selected.length > 0 && (
            <Text style={s.cardSub} numberOfLines={1}>
              {selected.join(' · ')}
            </Text>
          )}
          {!expanded && selected.length === 0 && (
            <Text style={s.cardSub}>Tap to select</Text>
          )}
        </View>
        <Ionicons
          name={expanded ? 'remove' : 'add'}
          size={22}
          color={AppColors.textMuted}
        />
      </Pressable>

      {expanded && (
        <>
          <Text style={s.cardSub}>Select all that apply to you.</Text>
          <View style={s.chipWrap}>
            {GAMBLING_TYPES.map(t => {
              const on = local.includes(t);
              return (
                <Pressable key={t} onPress={() => toggle(t)}
                  style={[s.chip, on && s.chipOn]}>
                  <Text style={[s.chipText, on && s.chipTextOn]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>
          {changed && (
            <Pressable onPress={() => onSave(local)} disabled={saving}
              style={[s.saveBtn, saving && { opacity: 0.5 }]}>
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={s.saveBtnText}>Save Selection</Text>}
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

// ─── 20 Questions quiz ────────────────────────────────────────────
function QuizCard({
  quizScore, onComplete,
}: { quizScore: number | null; onComplete: (score: number) => Promise<void> }) {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(20).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  function answer(val: boolean) {
    const next = [...answers];
    next[currentQ] = val;
    setAnswers(next);
    if (currentQ < 19) setTimeout(() => setCurrentQ(q => q + 1), 180);
    else setShowResult(true);
  }

  async function handleSave() {
    const yesCount = answers.filter(a => a === true).length;
    setSaving(true);
    await onComplete(yesCount);
    setSaving(false);
  }

  if (quizScore !== null) {
    const interpretation = quizScore >= 7
      ? 'Most compulsive gamblers answer Yes to 7 or more questions. Consider reaching out to GA or a counselor.'
      : 'Your answers suggest gambling may not yet be a serious problem. Check in regularly as situations change.';
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>GA 20 Questions</Text>
          <View style={s.donePill}>
            <Ionicons name="checkmark-circle" size={14} color={AppColors.meetings} />
            <Text style={s.donePillText}>Completed</Text>
          </View>
        </View>
        <View style={s.scoreBox}>
          <Text style={s.scoreNum}>{quizScore}<Text style={s.scoreOf}>/20</Text></Text>
          <Text style={s.scoreLabel}>Yes answers</Text>
        </View>
        <Text style={s.cardSub}>{interpretation}</Text>
      </View>
    );
  }

  if (!started) {
    return (
      <View style={s.card}>
        <Text style={s.cardTitle}>GA 20 Questions</Text>
        <Text style={s.cardSub}>
          Answer 20 Yes/No questions to better understand your relationship with gambling.
          GA suggests that 7 or more Yes answers may indicate compulsive gambling.
        </Text>
        <Pressable onPress={() => setStarted(true)} style={s.saveBtn}>
          <Text style={s.saveBtnText}>Start Quiz</Text>
        </Pressable>
      </View>
    );
  }

  if (showResult) {
    const yesCount = answers.filter(a => a === true).length;
    const interpretation = yesCount >= 7
      ? 'Most compulsive gamblers answer Yes to 7 or more questions. Consider reaching out to GA.'
      : 'Your answers suggest gambling may not yet be a serious problem for you.';
    return (
      <View style={s.card}>
        <Text style={s.cardTitle}>Your Result</Text>
        <View style={s.scoreBox}>
          <Text style={s.scoreNum}>{yesCount}<Text style={s.scoreOf}>/20</Text></Text>
          <Text style={s.scoreLabel}>Yes answers</Text>
        </View>
        <Text style={s.cardSub}>{interpretation}</Text>
        <Pressable onPress={handleSave} disabled={saving}
          style={[s.saveBtn, saving && { opacity: 0.5 }]}>
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.saveBtnText}>Save & Complete</Text>}
        </Pressable>
      </View>
    );
  }

  const progress = (currentQ / 20) * 100;

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.cardTitle}>Question {currentQ + 1} of 20</Text>
        <Text style={s.cardBadge}>{Math.round(progress)}%</Text>
      </View>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${progress}%` as any }]} />
      </View>
      <Text style={s.questionText}>{QUESTIONS[currentQ]}</Text>
      <View style={s.answerRow}>
        <Pressable onPress={() => answer(true)} style={[s.answerBtn, s.yesBtn]}>
          <Text style={s.answerBtnText}>Yes</Text>
        </Pressable>
        <Pressable onPress={() => answer(false)} style={[s.answerBtn, s.noBtn]}>
          <Text style={s.answerBtnText}>No</Text>
        </Pressable>
      </View>
      {currentQ > 0 && (
        <Pressable onPress={() => setCurrentQ(q => q - 1)}>
          <Text style={[s.cardSub, { textAlign: 'center', marginTop: 4 }]}>← Previous</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Tab 2: Resources ─────────────────────────────────────────────
function MaterialTab({ resources }: { resources: Resource[] }) {
  const order = ['newcomer', 'literature', 'gamban', 'self_exclusion'];
  const grouped = order.reduce<Record<string, Resource[]>>((acc, cat) => {
    acc[cat] = resources.filter(r => r.category === cat);
    return acc;
  }, {});

  return (
    <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 24 }}>
      {order.map(cat => {
        const items = grouped[cat];
        if (!items?.length) return null;
        const meta = RESOURCE_CATEGORY_META[cat];
        return (
          <View key={cat}>
            <View style={s.sectionHeader}>
              <Ionicons name={meta.icon as any} size={16} color={meta.color} />
              <Text style={[s.sectionLabel, { color: meta.color }]}>{meta.label}</Text>
            </View>
            <View style={{ gap: 10, marginTop: 10 }}>
              {items.map(r => (
                <Pressable key={r.id}
                  onPress={() => r.url && WebBrowser.openBrowserAsync(r.url)}
                  style={({ pressed }) => [s.resourceCard, pressed && { opacity: 0.7 }]}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={s.resourceTitle}>{r.title}</Text>
                    {r.summary && <Text style={s.resourceSub}>{r.summary}</Text>}
                  </View>
                  <Ionicons name="open-outline" size={18} color={AppColors.textMuted} />
                </Pressable>
              ))}
              {cat === 'gamban' && (
                <Text style={s.disclosure}>
                  Gamban is an independent third-party service. Subscription fees may apply. Recovery Community is not affiliated with Gamban and receives no compensation.
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Achievement row (module-scope to avoid remount on parent re-render) ─────
function AchRow({
  a, onSelfReport,
}: { a: AchievementWithStatus; onSelfReport: (a: AchievementWithStatus) => void }) {
  return (
    <View style={[s.achRow, !a.earned && s.achRowLocked]}>
      <View style={[s.achIcon, { backgroundColor: a.earned ? a.color + '22' : AppColors.tile }]}>
        <Ionicons name={a.icon as any} size={22} color={a.earned ? a.color : AppColors.textMuted} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[s.achTitle, !a.earned && s.achTitleLocked]}>{a.title}</Text>
        <Text style={s.achDesc}>{a.description}</Text>
        {a.earned && a.earned_at && (
          <Text style={[s.achDate, { color: a.color }]}>Earned {earnedDate(a.earned_at)}</Text>
        )}
      </View>
      {a.earned ? (
        <Ionicons name="checkmark-circle" size={22} color={a.color} />
      ) : a.type === 'self_reported' ? (
        <Pressable onPress={() => onSelfReport(a)} style={[s.markBtn, { borderColor: a.color }]}>
          <Text style={[s.markBtnText, { color: a.color }]}>Mark Done</Text>
        </Pressable>
      ) : (
        <Ionicons name="lock-closed-outline" size={18} color={AppColors.textMuted} />
      )}
    </View>
  );
}

// ─── Tab 3: Achievements ──────────────────────────────────────────
function AchievementsTab({
  achievements, onSelfReport,
}: { achievements: AchievementWithStatus[]; onSelfReport: (a: AchievementWithStatus) => void }) {
  const milestones = achievements.filter(a => a.category === 'milestone');
  const activities = achievements.filter(a => a.category === 'activity');

  return (
    <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 24 }}>
      <View>
        <Text style={s.sectionLabel}>Clean Time Milestones</Text>
        <View style={{ gap: 10, marginTop: 10 }}>
          {milestones.map(a => <AchRow key={a.key} a={a} onSelfReport={onSelfReport} />)}
        </View>
      </View>
      <View>
        <Text style={s.sectionLabel}>Activity Badges</Text>
        <View style={{ gap: 10, marginTop: 10 }}>
          {activities.map(a => <AchRow key={a.key} a={a} onSelfReport={onSelfReport} />)}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Celebration modal ────────────────────────────────────────────
function CelebrationModal({
  achievement, onClose,
}: { achievement: AchievementWithStatus | null; onClose: () => void }) {
  if (!achievement) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.card}>
          <View style={[m.iconWrap, { backgroundColor: achievement.color + '22' }]}>
            <Ionicons name={achievement.icon as any} size={44} color={achievement.color} />
          </View>
          <Text style={m.emoji}>🎉</Text>
          <Text style={m.headline}>Achievement Unlocked!</Text>
          <Text style={m.title}>{achievement.title}</Text>
          <Text style={m.desc}>{achievement.description}</Text>
          <Pressable onPress={onClose} style={[m.btn, { backgroundColor: achievement.color }]}>
            <Text style={m.btnText}>Awesome!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Confirm modal (self-reported) ────────────────────────────────
function ConfirmModal({
  achievement, onConfirm, onClose,
}: { achievement: AchievementWithStatus | null; onConfirm: () => void; onClose: () => void }) {
  if (!achievement) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.card}>
          <View style={[m.iconWrap, { backgroundColor: achievement.color + '22' }]}>
            <Ionicons name={achievement.icon as any} size={36} color={achievement.color} />
          </View>
          <Text style={m.title}>{achievement.title}</Text>
          <Text style={m.desc}>
            {SELF_REPORT_COPY[achievement.key] ?? achievement.description}
          </Text>
          <Text style={[m.desc, { color: AppColors.textMuted, fontSize: 12 }]}>
            Tap confirm to mark this as done.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
            <Pressable onPress={onClose} style={[m.btn, { flex: 1, backgroundColor: AppColors.tile }]}>
              <Text style={[m.btnText, { color: AppColors.textMuted }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={[m.btn, { flex: 1, backgroundColor: achievement.color }]}>
              <Text style={m.btnText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────
export default function RecoveryScreen() {
  const { user } = useAuth();
  const { open } = useDrawer();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('start');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [gamblingTypes, setGamblingTypes] = useState<string[]>([]);
  const [savingTypes, setSavingTypes] = useState(false);
  const [manualTasks, setManualTasks] = useState<Set<string>>(new Set());
  const [celebrating, setCelebrating] = useState<AchievementWithStatus | null>(null);
  const [confirming, setConfirming] = useState<AchievementWithStatus | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchProfile(user.id),
      fetchAchievementsWithStatus(user.id),
      fetchResources(),
    ]).then(async ([p, achs, res]) => {
      setProfile(p);
      setGamblingTypes(p?.gambling_types ?? []);
      setResources(res);

      const earnedKeys = new Set(achs.filter((a: AchievementWithStatus) => a.earned).map((a: AchievementWithStatus) => a.key));
      const newKeys = await syncAutoAchievements(
        user.id,
        p ?? { clean_date: null, gambling_types: null, quiz_score: null, first_name: null },
        earnedKeys,
      );

      if (newKeys.length > 0) {
        const updated = await fetchAchievementsWithStatus(user.id);
        setAchievements(updated);
        const newMilestone = updated.find(a => newKeys.includes(a.key) && a.category === 'milestone');
        if (newMilestone) setCelebrating(newMilestone);
      } else {
        setAchievements(achs);
      }
      setLoading(false);
    });
  }, [user]);

  async function handleSaveTypes(types: string[]) {
    if (!user) return;
    setSavingTypes(true);
    try {
      await updateGamblingTypes(user.id, types);
      setGamblingTypes(types);
      setProfile((p: any) => ({ ...p, gambling_types: types }));
      if (types.length > 0) {
        await earnAchievement(user.id, 'set_gambling_type');
        const updated = await fetchAchievementsWithStatus(user.id);
        setAchievements(updated);
      }
    } finally {
      setSavingTypes(false);
    }
  }

  async function handleQuizComplete(score: number) {
    if (!user) return;
    await updateQuizScore(user.id, score);
    await earnAchievement(user.id, 'completed_20_questions');
    const updated = await fetchAchievementsWithStatus(user.id);
    setAchievements(updated);
    setProfile((p: any) => ({ ...p, quiz_score: score }));
  }

  async function handleConfirmSelfReport() {
    if (!user || !confirming) return;
    const days = CLEAN_DATE_MILESTONE_DAYS[confirming.key];
    const earnedAt = days !== undefined && profile?.clean_date
      ? milestoneDate(profile.clean_date, days)
      : undefined;
    await earnAchievement(user.id, confirming.key, earnedAt);
    const updated = await fetchAchievementsWithStatus(user.id);
    setAchievements(updated);
    const earned = updated.find(a => a.key === confirming!.key);
    setConfirming(null);
    if (earned) setCelebrating(earned);
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={AppColors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <HomeBackdrop />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.headerRow}>
          <Pressable onPress={open} hitSlop={10}>
            <Ionicons name="menu" size={26} color={AppColors.text} />
          </Pressable>
          <Text style={s.screenTitle}>Recovery</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* tab bar */}
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

        {/* tab content */}
        {tab === 'start' && (
          <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
            {/* Telephone list shortcut */}
            <Pressable
              onPress={() => router.push('/telephone-list')}
              style={({ pressed }) => [s.card, s.phoneCard, pressed && { opacity: 0.75 }]}>
              <View style={s.phoneIcon}>
                <Ionicons name="call" size={22} color={AppColors.meetings} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.cardTitle}>Telephone List</Text>
                <Text style={s.cardSub}>Call a member · use the telephone list</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
            </Pressable>

            <Day1Checklist
              profile={profile}
              achievements={achievements}
              manual={manualTasks}
              setManual={setManualTasks}
              router={router}
            />
            <GamblingTypeSelector
              selected={gamblingTypes}
              onSave={handleSaveTypes}
              saving={savingTypes}
            />
            <QuizCard
              quizScore={profile?.quiz_score ?? null}
              onComplete={handleQuizComplete}
            />
          </ScrollView>
        )}

        {tab === 'material' && <MaterialTab resources={resources} />}

        {tab === 'achievements' && (
          <AchievementsTab
            achievements={achievements}
            onSelfReport={setConfirming}
          />
        )}
      </SafeAreaView>

      <CelebrationModal achievement={celebrating} onClose={() => setCelebrating(null)} />
      <ConfirmModal
        achievement={confirming}
        onConfirm={handleConfirmSelfReport}
        onClose={() => setConfirming(null)}
      />
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, marginBottom: 14 },
  screenTitle: { color: AppColors.text, fontSize: 24, fontWeight: '700' },

  tabBar: { flexDirection: 'row', backgroundColor: AppColors.tile, borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: AppColors.tileBorder },
  tabItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  tabItemActive: { backgroundColor: AppColors.accent },
  tabLabel: { color: AppColors.textMuted, fontSize: 12, fontWeight: '500' },
  tabLabelActive: { color: '#fff', fontWeight: '700' },

  card: { backgroundColor: AppColors.tile, borderWidth: 1, borderColor: AppColors.tileBorder, borderRadius: 16, padding: 16, gap: 12 },
  phoneCard: { flexDirection: 'row', alignItems: 'center', borderColor: AppColors.meetings + '40' },
  phoneIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: AppColors.meetings + '20', alignItems: 'center', justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: AppColors.text, fontSize: 16, fontWeight: '700' },
  collapsibleHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardSub: { color: AppColors.textMuted, fontSize: 13, lineHeight: 19 },
  cardBadge: { color: AppColors.accent, fontSize: 13, fontWeight: '600' },

  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 5 },
  taskCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: AppColors.hairline, alignItems: 'center', justifyContent: 'center' },
  taskCheckDone: { backgroundColor: AppColors.meetings, borderColor: AppColors.meetings },
  taskLabel: { color: AppColors.text, fontSize: 14, fontWeight: '500' },
  taskLabelDone: { color: AppColors.textMuted, textDecorationLine: 'line-through' },
  taskSub: { color: AppColors.textMuted, fontSize: 11, marginTop: 1 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: AppColors.screen, borderWidth: 1, borderColor: AppColors.hairline },
  chipOn: { backgroundColor: AppColors.accent, borderColor: AppColors.accent },
  chipText: { color: AppColors.textMuted, fontSize: 13 },
  chipTextOn: { color: '#fff', fontWeight: '600' },

  saveBtn: { backgroundColor: AppColors.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  progressBar: { height: 6, backgroundColor: AppColors.hairline, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: AppColors.accent, borderRadius: 3 },
  questionText: { color: AppColors.text, fontSize: 15, lineHeight: 22, fontWeight: '500' },
  answerRow: { flexDirection: 'row', gap: 12 },
  answerBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  yesBtn: { backgroundColor: AppColors.meetings + '22', borderWidth: 1, borderColor: AppColors.meetings },
  noBtn: { backgroundColor: '#F2616B22', borderWidth: 1, borderColor: '#F2616B' },
  answerBtnText: { fontSize: 16, fontWeight: '700', color: AppColors.text },

  scoreBox: { alignItems: 'center', paddingVertical: 8 },
  scoreNum: { color: AppColors.accent, fontSize: 48, fontWeight: '700' },
  scoreOf: { color: AppColors.textMuted, fontSize: 24, fontWeight: '400' },
  scoreLabel: { color: AppColors.textMuted, fontSize: 14 },

  donePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: AppColors.meetings + '22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  donePillText: { color: AppColors.meetings, fontSize: 12, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLabel: { color: AppColors.text, fontSize: 15, fontWeight: '700' },
  resourceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: AppColors.tile, borderWidth: 1, borderColor: AppColors.tileBorder, borderRadius: 14, padding: 14 },
  resourceTitle: { color: AppColors.text, fontSize: 14, fontWeight: '600' },
  resourceSub: { color: AppColors.textMuted, fontSize: 12, lineHeight: 17 },
  disclosure: { color: AppColors.textMuted, fontSize: 11, lineHeight: 16, fontStyle: 'italic', paddingHorizontal: 4 },

  achRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: AppColors.tile, borderWidth: 1, borderColor: AppColors.tileBorder, borderRadius: 14, padding: 14 },
  achRowLocked: { opacity: 0.55 },
  achIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  achTitle: { color: AppColors.text, fontSize: 14, fontWeight: '600' },
  achTitleLocked: { color: AppColors.textMuted },
  achDesc: { color: AppColors.textMuted, fontSize: 12, lineHeight: 17 },
  achDate: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  markBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  markBtnText: { fontSize: 12, fontWeight: '600' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: AppColors.tile, borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: AppColors.tileBorder },
  iconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 32 },
  headline: { color: AppColors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  title: { color: AppColors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  desc: { color: AppColors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  btn: { width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
