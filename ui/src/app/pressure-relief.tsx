import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet,
  Switch, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchLatestMeeting, saveMeeting, type PRGMeeting } from '@/api/pressure-relief';
import { DatePickerInput } from '@/components/date-picker-input';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';

const ACCENT = AppColors.share; // amber/gold — financial tool

// ── income types + helpers ───────────────────────────────────────────────────
type IncomeRow = { _id?: string; source: string; per_week: string; monthly: string };

const DEFAULT_INCOME: IncomeRow[] = [
  { _id: 'inc-0', source: 'Wages – Member',          per_week: '', monthly: '' },
  { _id: 'inc-1', source: 'Wages – Spouse/Partner',  per_week: '', monthly: '' },
  { _id: 'inc-2', source: 'Overtime / Bonus',        per_week: '', monthly: '' },
  { _id: 'inc-3', source: 'Part-time / Side work',   per_week: '', monthly: '' },
  { _id: 'inc-4', source: 'Social Security',         per_week: '', monthly: '' },
  { _id: 'inc-5', source: 'Pension / Retirement',    per_week: '', monthly: '' },
  { _id: 'inc-6', source: 'Other',                   per_week: '', monthly: '' },
];

function toMonthly(perWeek: string): string {
  const n = parseFloat(perWeek);
  return isNaN(n) ? '' : (n * 52 / 12).toFixed(2);
}
function toWeekly(monthly: string): string {
  const n = parseFloat(monthly);
  return isNaN(n) ? '' : (n * 12 / 52).toFixed(2);
}

// ── expense types + data ────────────────────────────────────────────────────
type ExpenseRow = { category: string; weekly: string; monthly: string };

const EXPENSE_GROUPS: { key: string; label: string; icon: string; items: string[] }[] = [
  { key: 'housing',    label: 'Housing',       icon: 'home-outline',                      items: ['Rent / Mortgage', 'Property Tax', 'Home Insurance', 'HOA Fees', 'Maintenance & Repairs'] },
  { key: 'utilities',  label: 'Utilities',     icon: 'flash-outline',                     items: ['Electricity', 'Gas', 'Water / Sewer', 'Home Phone', 'Cell Phone', 'Internet', 'Cable / Streaming'] },
  { key: 'food',       label: 'Food',          icon: 'restaurant-outline',                items: ['Groceries', 'Dining Out', 'School Lunches'] },
  { key: 'transport',  label: 'Transportation',icon: 'car-outline',                       items: ['Car Payment', 'Auto Insurance', 'Fuel / Oil', 'Parking / Tolls', 'Public Transit', 'Car Maintenance'] },
  { key: 'health',     label: 'Healthcare',    icon: 'medical-outline',                   items: ['Health Insurance', 'Doctor / Dentist', 'Prescriptions', 'Vision / Dental Insurance'] },
  { key: 'personal',   label: 'Personal Care', icon: 'person-outline',                    items: ['Haircuts / Grooming', 'Clothing', 'Laundry / Dry Cleaning'] },
  { key: 'children',   label: 'Children',      icon: 'people-outline',                    items: ['Child Care / Daycare', 'School Tuition', 'School Supplies', 'Activities / Sports', 'Allowance'] },
  { key: 'pets',       label: 'Pets',          icon: 'paw-outline',                       items: ['Pet Food', 'Vet / Grooming'] },
  { key: 'insurance',  label: 'Life Insurance',icon: 'shield-outline',                    items: ['Life Insurance Premium'] },
  { key: 'recreation', label: 'Recreation',    icon: 'musical-notes-outline',             items: ['Entertainment / Movies', 'Hobbies', 'Gym / Fitness', 'Subscriptions'] },
  { key: 'misc',       label: 'Miscellaneous', icon: 'ellipsis-horizontal-circle-outline',items: ['Gifts / Holidays', 'Donations / Charity', 'Personal Allowance', 'Savings', 'Other'] },
];

function buildDefaultExpenses(): ExpenseRow[] {
  return EXPENSE_GROUPS.flatMap(g => g.items.map(item => ({ category: item, weekly: '', monthly: '' })));
}

function mergeExpenses(defaults: ExpenseRow[], saved: ExpenseRow[]): ExpenseRow[] {
  const map = new Map(saved.map(r => [r.category, r]));
  return defaults.map(d => map.get(d.category) ?? d);
}

// ── creditor types + data ───────────────────────────────────────────────────
type CreditorRow = {
  _id?: string; type: string; creditor: string;
  balance: string; monthly_payment: string; interest_rate: string;
};

const DEBT_TYPES = [
  'Credit Card', 'Personal Loan', 'Auto Loan', 'Mortgage',
  'Medical', 'Student Loan', 'Tax Debt', 'Family / Friend', 'Other',
];

const TABS = [
  { key: 'details',   label: 'Details'   },
  { key: 'income',    label: 'Income'    },
  { key: 'expenses',  label: 'Expenses'  },
  { key: 'creditors', label: 'Creditors' },
  { key: 'summary',   label: 'Summary'   },
] as const;
type TabKey = typeof TABS[number]['key'];

// ── small reusable form field ────────────────────────────────────────────────
function Field({
  label, value, onChangeText, placeholder,
}: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder: string;
}) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppColors.textMuted}
        style={s.fieldInput}
        autoCorrect={false}
      />
    </View>
  );
}

// ── Income section ───────────────────────────────────────────────────────────
function IncomeSection({
  rows, onChange,
}: { rows: IncomeRow[]; onChange: (r: IncomeRow[]) => void }) {
  function update(i: number, field: keyof IncomeRow, value: string) {
    const next = rows.map((r, idx) => {
      if (idx !== i) return r;
      const updated = { ...r, [field]: value };
      if (field === 'per_week') updated.monthly  = toMonthly(value);
      if (field === 'monthly')  updated.per_week = toWeekly(value);
      return updated;
    });
    onChange(next);
  }

  function addRow() {
    onChange([...rows, { _id: `inc-new-${rows.length}-${Date.now()}`, source: '', per_week: '', monthly: '' }]);
  }

  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }

  const totalMonthly = rows.reduce((sum, r) => sum + (parseFloat(r.monthly) || 0), 0);

  return (
    <View style={s.card}>
      <View style={s.cardTitleRow}>
        <Text style={s.cardTitle}>INCOME SUMMARY</Text>
        <Pressable onPress={addRow} style={s.addBtn}>
          <Ionicons name="add" size={15} color={ACCENT} />
          <Text style={s.addBtnText}>Add row</Text>
        </Pressable>
      </View>

      {rows.map((r, i) => (
        <View key={r._id ?? String(i)}>
          {i > 0 && <View style={s.divider} />}
          <View style={s.incomeEntry}>
            <View style={s.incomeSourceRow}>
              <TextInput
                value={r.source}
                onChangeText={v => update(i, 'source', v)}
                placeholder="Income source"
                placeholderTextColor={AppColors.textMuted}
                style={[s.fieldInput, { flex: 1 }]}
                autoCorrect={false}
              />
              <Pressable onPress={() => removeRow(i)} hitSlop={10}>
                <Ionicons name="close-circle-outline" size={18} color={AppColors.textMuted} />
              </Pressable>
            </View>
            <View style={s.incomeAmountRow}>
              <View style={s.incomeAmountCol}>
                <Text style={s.fieldLabel}>Per Week ($)</Text>
                <TextInput
                  value={r.per_week}
                  onChangeText={v => update(i, 'per_week', v)}
                  placeholder="0.00"
                  placeholderTextColor={AppColors.textMuted}
                  keyboardType="decimal-pad"
                  style={s.fieldInput}
                />
              </View>
              <View style={s.incomeAmountCol}>
                <Text style={s.fieldLabel}>Monthly ($)</Text>
                <TextInput
                  value={r.monthly}
                  onChangeText={v => update(i, 'monthly', v)}
                  placeholder="0.00"
                  placeholderTextColor={AppColors.textMuted}
                  keyboardType="decimal-pad"
                  style={s.fieldInput}
                />
              </View>
            </View>
          </View>
        </View>
      ))}

      <View style={s.divider} />
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>TOTAL MONTHLY INCOME</Text>
        <Text style={[s.totalValue, { color: ACCENT }]}>${totalMonthly.toFixed(2)}</Text>
      </View>
    </View>
  );
}

// ── Expense section ──────────────────────────────────────────────────────────
function ExpenseSection({
  rows, onChange,
}: { rows: ExpenseRow[]; onChange: (r: ExpenseRow[]) => void }) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  function toggleGroup(key: string) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function update(category: string, field: 'weekly' | 'monthly', value: string) {
    onChange(rows.map(r => {
      if (r.category !== category) return r;
      const updated = { ...r, [field]: value };
      if (field === 'weekly')  updated.monthly = toMonthly(value);
      if (field === 'monthly') updated.weekly  = toWeekly(value);
      return updated;
    }));
  }

  const totalMonthly = rows.reduce((sum, r) => sum + (parseFloat(r.monthly) || 0), 0);

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>MONTHLY EXPENSES</Text>
      <Text style={s.expenseIntro}>Tap a group to expand and enter amounts.</Text>

      {EXPENSE_GROUPS.map(group => {
        const isOpen = openGroups.has(group.key);
        const groupRows = rows.filter(r => group.items.includes(r.category));
        const groupTotal = groupRows.reduce((sum, r) => sum + (parseFloat(r.monthly) || 0), 0);
        const filledCount = groupRows.filter(r => r.monthly || r.weekly).length;

        return (
          <View key={group.key}>
            <View style={s.divider} />
            <Pressable
              onPress={() => toggleGroup(group.key)}
              style={({ pressed }) => [s.groupHeader, pressed && { opacity: 0.7 }]}>
              <View style={s.groupHeaderLeft}>
                <Ionicons
                  name={group.icon as any}
                  size={18}
                  color={groupTotal > 0 ? ACCENT : AppColors.textMuted}
                />
                <Text style={s.groupLabel}>{group.label}</Text>
                {filledCount > 0 && (
                  <View style={s.filledBadge}>
                    <Text style={s.filledBadgeText}>{filledCount}</Text>
                  </View>
                )}
              </View>
              <View style={s.groupHeaderRight}>
                {groupTotal > 0 && (
                  <Text style={s.groupSubtotal}>${groupTotal.toFixed(0)}/mo</Text>
                )}
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={AppColors.textMuted}
                />
              </View>
            </Pressable>

            {isOpen && groupRows.map((r) => (
              <View key={r.category}>
                <View style={s.divider} />
                <View style={[s.incomeEntry, { paddingTop: 4 }]}>
                  <Text style={s.groupItemLabel}>{r.category}</Text>
                  <View style={s.incomeAmountRow}>
                    <View style={s.incomeAmountCol}>
                      <Text style={s.fieldLabel}>Weekly ($)</Text>
                      <TextInput
                        value={r.weekly}
                        onChangeText={v => update(r.category, 'weekly', v)}
                        placeholder="0.00"
                        placeholderTextColor={AppColors.textMuted}
                        keyboardType="decimal-pad"
                        style={s.fieldInput}
                      />
                    </View>
                    <View style={s.incomeAmountCol}>
                      <Text style={s.fieldLabel}>Monthly ($)</Text>
                      <TextInput
                        value={r.monthly}
                        onChangeText={v => update(r.category, 'monthly', v)}
                        placeholder="0.00"
                        placeholderTextColor={AppColors.textMuted}
                        keyboardType="decimal-pad"
                        style={s.fieldInput}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      })}

      <View style={s.divider} />
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>TOTAL MONTHLY EXPENSES</Text>
        <Text style={[s.totalValue, { color: '#F2616B' }]}>${totalMonthly.toFixed(2)}</Text>
      </View>
    </View>
  );
}

// ── Budget summary ────────────────────────────────────────────────────────────
function SummaryRow({
  label, value, negative, large, color,
}: {
  label: string; value: number; color: string; negative?: boolean; large?: boolean;
}) {
  const sign = (negative || value < 0) ? '-' : '';
  return (
    <View style={s.summaryRow}>
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={[s.summaryValue, large && s.summaryValueLarge, { color }]}>
        {sign}${Math.abs(value).toFixed(2)}
      </Text>
    </View>
  );
}

function BudgetSummary({
  income, expenses, creditors,
}: {
  income: IncomeRow[]; expenses: ExpenseRow[]; creditors: CreditorRow[];
}) {
  const totalIncome       = income.reduce((sum, r)     => sum + (parseFloat(r.monthly)         || 0), 0);
  const totalExpenses     = expenses.reduce((sum, r)   => sum + (parseFloat(r.monthly)         || 0), 0);
  const totalDebtPayments = creditors.reduce((sum, r)  => sum + (parseFloat(r.monthly_payment) || 0), 0);
  const totalDebtBalance  = creditors.reduce((sum, r)  => sum + (parseFloat(r.balance)         || 0), 0);
  const availableForDebt  = totalIncome - totalExpenses;
  const surplus           = availableForDebt - totalDebtPayments;

  const availColor   = availableForDebt >= 0 ? AppColors.meetings : '#F2616B';
  const surplusColor = surplus           >= 0 ? AppColors.meetings : '#F2616B';
  const noData       = totalIncome === 0 && totalExpenses === 0 && totalDebtBalance === 0;

  return (
    <View style={[s.card, { borderColor: ACCENT + '30' }]}>
      <Text style={s.cardTitle}>BUDGET SUMMARY</Text>

      {noData ? (
        <View style={s.creditorEmpty}>
          <Ionicons name="calculator-outline" size={28} color={AppColors.textMuted} />
          <Text style={s.creditorEmptyText}>No data yet</Text>
          <Text style={s.creditorEmptyHint}>
            Fill in income, expenses, and creditors above to see your budget picture.
          </Text>
        </View>
      ) : (
        <>
          {/* Income vs Expenses block */}
          <SummaryRow label="Monthly Income"   value={totalIncome}   color={ACCENT} />
          <SummaryRow label="Monthly Expenses" value={totalExpenses} color="#F2616B" negative />
          <View style={s.divider} />
          <SummaryRow
            label="Available for Debt Payments"
            value={availableForDebt}
            color={availColor}
            large
          />

          <View style={[s.divider, { marginVertical: 6 }]} />

          {/* Debt repayment block */}
          <SummaryRow label="Total Monthly Debt Payments" value={totalDebtPayments} color="#F2616B" negative />
          <View style={s.divider} />
          <SummaryRow
            label="Monthly Surplus / Deficit"
            value={surplus}
            color={surplusColor}
            large
          />

          <View style={[s.divider, { marginVertical: 6 }]} />

          {/* Total debt */}
          <SummaryRow label="Total Debt Balance" value={totalDebtBalance} color="#F2616B" />

          {/* Contextual message */}
          {surplus < 0 ? (
            <View style={s.summaryAlert}>
              <Ionicons name="alert-circle" size={15} color="#F2616B" />
              <Text style={s.summaryAlertText}>
                Monthly obligations exceed available funds. Your PRG committee can help negotiate reduced payments with creditors.
              </Text>
            </View>
          ) : totalIncome > 0 ? (
            <View style={s.summarySuccess}>
              <Ionicons name="checkmark-circle" size={15} color={AppColors.meetings} />
              <Text style={s.summarySuccessText}>
                Income covers obligations. Work with your PRG committee to direct the surplus toward debt repayment.
              </Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

// ── Creditor entry (single row) ──────────────────────────────────────────────
function CreditorEntry({
  row, index, onUpdate, onDelete,
}: {
  row: CreditorRow; index: number;
  onUpdate: (field: keyof CreditorRow, value: string) => void;
  onDelete: () => void;
}) {
  return (
    <View style={s.creditorEntry}>
      <View style={s.creditorEntryHeader}>
        <Text style={s.creditorNum}>Creditor {index + 1}</Text>
        <Pressable onPress={onDelete} hitSlop={10}>
          <Ionicons name="trash-outline" size={16} color="#F2616B" />
        </Pressable>
      </View>

      {/* Debt type chips */}
      <View style={s.chipWrap}>
        {DEBT_TYPES.map(t => (
          <Pressable
            key={t}
            onPress={() => onUpdate('type', t)}
            style={[s.typeChip, row.type === t && s.typeChipOn]}>
            <Text style={[s.typeChipText, row.type === t && s.typeChipTextOn]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {/* Creditor name */}
      <TextInput
        value={row.creditor}
        onChangeText={v => onUpdate('creditor', v)}
        placeholder="Creditor name (e.g. Chase Bank)"
        placeholderTextColor={AppColors.textMuted}
        style={s.fieldInput}
        autoCorrect={false}
      />

      {/* Balance + monthly payment */}
      <View style={s.incomeAmountRow}>
        <View style={s.incomeAmountCol}>
          <Text style={s.fieldLabel}>Balance ($)</Text>
          <TextInput
            value={row.balance}
            onChangeText={v => onUpdate('balance', v)}
            placeholder="0.00"
            placeholderTextColor={AppColors.textMuted}
            keyboardType="decimal-pad"
            style={s.fieldInput}
          />
        </View>
        <View style={s.incomeAmountCol}>
          <Text style={s.fieldLabel}>Monthly Payment ($)</Text>
          <TextInput
            value={row.monthly_payment}
            onChangeText={v => onUpdate('monthly_payment', v)}
            placeholder="0.00"
            placeholderTextColor={AppColors.textMuted}
            keyboardType="decimal-pad"
            style={s.fieldInput}
          />
        </View>
      </View>

      {/* Interest rate */}
      <View style={{ gap: 6 }}>
        <Text style={s.fieldLabel}>Interest Rate (%)</Text>
        <TextInput
          value={row.interest_rate}
          onChangeText={v => onUpdate('interest_rate', v)}
          placeholder="e.g. 19.99"
          placeholderTextColor={AppColors.textMuted}
          keyboardType="decimal-pad"
          style={[s.fieldInput, { width: '50%' as any }]}
        />
      </View>
    </View>
  );
}

// ── Creditor section ──────────────────────────────────────────────────────────
function CreditorSection({
  rows, onChange,
}: { rows: CreditorRow[]; onChange: (r: CreditorRow[]) => void }) {
  function update(index: number, field: keyof CreditorRow, value: string) {
    onChange(rows.map((r, i) => i === index ? { ...r, [field]: value } : r));
  }

  function addRow() {
    onChange([...rows, { _id: `cred-new-${rows.length}-${Date.now()}`, type: '', creditor: '', balance: '', monthly_payment: '', interest_rate: '' }]);
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  const totalBalance  = rows.reduce((sum, r) => sum + (parseFloat(r.balance)          || 0), 0);
  const totalMonthly  = rows.reduce((sum, r) => sum + (parseFloat(r.monthly_payment)  || 0), 0);

  return (
    <View style={s.card}>
      <View style={s.cardTitleRow}>
        <Text style={s.cardTitle}>CREDITORS LIST</Text>
        <Pressable onPress={addRow} style={s.addBtn}>
          <Ionicons name="add" size={15} color={ACCENT} />
          <Text style={s.addBtnText}>Add creditor</Text>
        </Pressable>
      </View>

      {rows.length === 0 ? (
        <View style={s.creditorEmpty}>
          <Ionicons name="card-outline" size={28} color={AppColors.textMuted} />
          <Text style={s.creditorEmptyText}>No creditors added yet</Text>
          <Text style={s.creditorEmptyHint}>Tap "Add creditor" to list each debt</Text>
        </View>
      ) : (
        rows.map((row, i) => (
          <View key={row._id ?? String(i)}>
            {i > 0 && <View style={s.divider} />}
            <CreditorEntry
              row={row}
              index={i}
              onUpdate={(field, value) => update(i, field, value)}
              onDelete={() => removeRow(i)}
            />
          </View>
        ))
      )}

      {rows.length > 0 && (
        <>
          <View style={s.divider} />
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>TOTAL BALANCE OWED</Text>
            <Text style={[s.totalValue, { color: '#F2616B' }]}>${totalBalance.toFixed(2)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>TOTAL MONTHLY PAYMENTS</Text>
            <Text style={[s.totalValue, { color: '#F2616B', fontSize: 15 }]}>${totalMonthly.toFixed(2)}</Text>
          </View>
        </>
      )}
    </View>
  );
}

// ── main screen ──────────────────────────────────────────────────────────────
export default function PressureReliefScreen() {
  const router    = useRouter();
  const { user }  = useAuth();

  const [meetingId,        setMeetingId]        = useState<string | null>(null);
  const [memberName,       setMemberName]        = useState('');
  const [spouseName,       setSpouseName]        = useState('');
  const [gaGroupName,      setGaGroupName]       = useState('');
  const [meetingDate,      setMeetingDate]       = useState('');
  const [reevalDate,       setReevalDate]        = useState('');
  const [committeeChair,   setCommitteeChair]    = useState('');
  const [otherAttendees,   setOtherAttendees]    = useState('');
  const [visibleToSponsor, setVisibleToSponsor]  = useState(false);
  const [income,           setIncome]            = useState<IncomeRow[]>(DEFAULT_INCOME);
  const [expenses,         setExpenses]          = useState<ExpenseRow[]>(buildDefaultExpenses);
  const [creditors,        setCreditors]         = useState<CreditorRow[]>([]);
  const [collapsed,        setCollapsed]         = useState(false);
  const [activeTab,        setActiveTab]         = useState<TabKey>('details');
  const [saving,           setSaving]            = useState(false);
  const [saved,            setSaved]             = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchLatestMeeting(user.id).then((m: PRGMeeting | null) => {
      if (!m) return;
      setMeetingId(m.id);
      setMemberName(m.member_name ?? '');
      setSpouseName(m.spouse_name ?? '');
      setGaGroupName(m.ga_group_name ?? '');
      setMeetingDate(m.meeting_date ?? '');
      setReevalDate(m.reevaluation_date ?? '');
      setCommitteeChair(m.committee_chair ?? '');
      setOtherAttendees(m.other_attendees ?? '');
      setVisibleToSponsor(m.visible_to_sponsor ?? false);
      if (m.income && m.income.length > 0) setIncome(m.income as IncomeRow[]);
      if (m.expenses   && m.expenses.length   > 0) setExpenses(mergeExpenses(buildDefaultExpenses(), m.expenses as ExpenseRow[]));
      if (m.creditors  && m.creditors.length  > 0) setCreditors(m.creditors as CreditorRow[]);
    });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const result = await saveMeeting(user.id, {
        id:                meetingId ?? undefined,
        member_name:       memberName.trim()     || null,
        spouse_name:       spouseName.trim()     || null,
        ga_group_name:     gaGroupName.trim()    || null,
        meeting_date:      meetingDate.trim()    || null,
        reevaluation_date: reevalDate.trim()     || null,
        committee_chair:   committeeChair.trim() || null,
        other_attendees:   otherAttendees.trim() || null,
        visible_to_sponsor: visibleToSponsor,
        income,
        total_income_monthly: income.reduce((sum, r) => sum + (parseFloat(r.monthly) || 0), 0),
        expenses,
        total_expenses_monthly: expenses.reduce((sum, r) => sum + (parseFloat(r.monthly) || 0), 0),
        creditors,
        available_for_debt:
          income.reduce((sum, r)   => sum + (parseFloat(r.monthly) || 0), 0) -
          expenses.reduce((sum, r) => sum + (parseFloat(r.monthly) || 0), 0),
      });
      if (result && !meetingId) setMeetingId(result.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={s.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={AppColors.text} />
          </Pressable>
          <Text style={s.title}>Pressure Relief Group</Text>
          <Pressable onPress={() => setCollapsed(c => !c)} hitSlop={12}>
            <Ionicons
              name={collapsed ? 'expand-outline' : 'contract-outline'}
              size={22}
              color={AppColors.textMuted}
            />
          </Pressable>
        </View>

        {/* ── Tab bar (only when expanded) ── */}
        {!collapsed && (
          <View style={s.tabBar}>
            {TABS.map(tab => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={s.tabItem}>
                <Text style={[s.tabLabel, activeTab === tab.key && s.tabLabelActive]}>
                  {tab.label}
                </Text>
                {activeTab === tab.key && <View style={s.tabUnderline} />}
              </Pressable>
            ))}
          </View>
        )}

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {collapsed ? (
            <BudgetSummary income={income} expenses={expenses} creditors={creditors} />
          ) : (
            <>
              {/* ── Details tab ── */}
              {activeTab === 'details' && <>
                <View style={s.infoCard}>
                  <View style={s.infoRow}>
                    <Ionicons name="information-circle" size={20} color={ACCENT} />
                    <Text style={[s.infoTitle, { color: ACCENT }]}>What is a PRG Meeting?</Text>
                  </View>
                  <Text style={s.infoText}>
                    A Pressure Relief Group (PRG) meeting is a special GA meeting designed to help you
                    achieve financial stability. Two experienced GA members — a treasurer and a secretary —
                    sit with you and your spouse or significant other to review your complete financial
                    picture and create a realistic budget and repayment plan.
                  </Text>
                  <Text style={s.infoText}>
                    The goal is financial restitution and a return to normal living — freedom from the
                    pressure of debt and financial chaos.
                  </Text>
                  <View style={s.disclaimer}>
                    <Ionicons name="shield-checkmark-outline" size={13} color={AppColors.textMuted} />
                    <Text style={s.disclaimerText}>
                      This workbook is a guide only and is not a substitute for professional financial
                      or legal advice.
                    </Text>
                  </View>
                </View>

                <View style={s.card}>
                  <Text style={s.cardTitle}>MEETING DETAILS</Text>
                  <Field
                    label="GA Member Name"
                    value={memberName}
                    onChangeText={setMemberName}
                    placeholder="Your full name"
                  />
                  <View style={s.divider} />
                  <Field
                    label="Spouse / Partner Name"
                    value={spouseName}
                    onChangeText={setSpouseName}
                    placeholder="Optional"
                  />
                  <View style={s.divider} />
                  <Field
                    label="GA Group Name"
                    value={gaGroupName}
                    onChangeText={setGaGroupName}
                    placeholder="Your home group"
                  />
                  <View style={s.divider} />
                  <View style={s.field}>
                    <Text style={s.fieldLabel}>Meeting Date</Text>
                    <DatePickerInput value={meetingDate} onChange={setMeetingDate} />
                  </View>
                  <View style={s.divider} />
                  <View style={s.field}>
                    <Text style={s.fieldLabel}>Re-evaluation Date</Text>
                    <DatePickerInput value={reevalDate} onChange={setReevalDate} />
                  </View>
                  <View style={s.divider} />
                  <Field
                    label="Budget Committee Chair"
                    value={committeeChair}
                    onChangeText={setCommitteeChair}
                    placeholder="Treasurer's name"
                  />
                  <View style={s.divider} />
                  <Field
                    label="Other GA Attendees"
                    value={otherAttendees}
                    onChangeText={setOtherAttendees}
                    placeholder="Names of other members present"
                  />
                </View>

                <View style={s.card}>
                  <Text style={s.cardTitle}>SHARING</Text>
                  <View style={s.toggleRow}>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={s.toggleLabel}>Share with my sponsor</Text>
                      <Text style={s.toggleSub}>Your linked sponsor can view this workbook</Text>
                    </View>
                    <Switch
                      value={visibleToSponsor}
                      onValueChange={setVisibleToSponsor}
                      trackColor={{ false: AppColors.hairline, true: ACCENT }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>
              </>}

              {/* ── Income tab ── */}
              {activeTab === 'income'    && <IncomeSection rows={income} onChange={setIncome} />}

              {/* ── Expenses tab ── */}
              {activeTab === 'expenses'  && <ExpenseSection rows={expenses} onChange={setExpenses} />}

              {/* ── Creditors tab ── */}
              {activeTab === 'creditors' && <CreditorSection rows={creditors} onChange={setCreditors} />}

              {/* ── Summary tab ── */}
              {activeTab === 'summary'   && <BudgetSummary income={income} expenses={expenses} creditors={creditors} />}
            </>
          )}

          {/* ── Save Button (always visible) ── */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[s.saveBtn, saving && { opacity: 0.6 }]}>
            <Ionicons
              name={saved ? 'checkmark-circle' : 'save-outline'}
              size={18}
              color="#fff"
            />
            <Text style={s.saveBtnText}>
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Meeting Details'}
            </Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.screen },
  safe: { flex: 1, paddingHorizontal: 20 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 12, marginBottom: 20,
  },
  title: { color: AppColors.text, fontSize: 20, fontWeight: '700' },

  scroll: { gap: 16, paddingBottom: 44 },

  // info card
  infoCard: {
    backgroundColor: ACCENT + '10',
    borderWidth: 1, borderColor: ACCENT + '30',
    borderRadius: 16, padding: 18, gap: 10,
  },
  infoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoTitle: { fontSize: 15, fontWeight: '700' },
  infoText:  { color: AppColors.textMuted, fontSize: 13, lineHeight: 20 },
  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: AppColors.screen + 'CC',
    borderRadius: 8, padding: 10, marginTop: 2,
  },
  disclaimerText: { color: AppColors.textMuted, fontSize: 11, lineHeight: 16, flex: 1 },

  // section card
  card: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 16, padding: 18, gap: 14,
  },
  cardTitle: {
    color: AppColors.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  divider: { height: 1, backgroundColor: AppColors.hairline },

  // form fields
  field:      { gap: 6 },
  fieldLabel: {
    color: AppColors.textMuted, fontSize: 11, fontWeight: '600',
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.hairline,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: AppColors.text, fontSize: 15,
    outlineStyle: 'none' as any,
  },

  // sponsor toggle
  toggleRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { color: AppColors.text, fontSize: 15, fontWeight: '500' },
  toggleSub:   { color: AppColors.textMuted, fontSize: 12 },

  // income section
  cardTitleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: ACCENT + '18', borderWidth: 1, borderColor: ACCENT + '44' },
  addBtnText:      { color: ACCENT, fontSize: 12, fontWeight: '600' },
  incomeEntry:     { gap: 8 },
  incomeSourceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  incomeAmountRow: { flexDirection: 'row', gap: 8 },
  incomeAmountCol: { flex: 1, gap: 6 },
  totalRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel:      { color: AppColors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  totalValue:      { fontSize: 18, fontWeight: '700' },

  // tab bar
  tabBar:         { flexDirection: 'row' as const, borderBottomWidth: 1, borderBottomColor: AppColors.hairline },
  tabItem:        { flex: 1, alignItems: 'center' as const, paddingVertical: 11, position: 'relative' as const },
  tabLabel:       { color: AppColors.textMuted, fontSize: 13, fontWeight: '500' as const },
  tabLabelActive: { color: AppColors.text, fontWeight: '700' as const },
  tabUnderline:   { position: 'absolute' as const, bottom: 0, left: 8, right: 8, height: 2, backgroundColor: ACCENT, borderRadius: 1 },

  // budget summary
  summaryRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  summaryLabel:       { color: AppColors.textMuted, fontSize: 13, flex: 1, paddingRight: 8 },
  summaryValue:       { color: AppColors.text, fontSize: 16, fontWeight: '600' },
  summaryValueLarge:  { fontSize: 22, fontWeight: '700' },
  summaryAlert:       { flexDirection: 'row', gap: 8, backgroundColor: '#F2616B18', borderWidth: 1, borderColor: '#F2616B44', borderRadius: 10, padding: 12, marginTop: 4 },
  summaryAlertText:   { color: '#F2616B', fontSize: 12, flex: 1, lineHeight: 17 },
  summarySuccess:     { flexDirection: 'row', gap: 8, backgroundColor: '#3FCF8E18', borderWidth: 1, borderColor: '#3FCF8E44', borderRadius: 10, padding: 12, marginTop: 4 },
  summarySuccessText: { color: AppColors.meetings, fontSize: 12, flex: 1, lineHeight: 17 },

  // creditor section
  creditorEntry:        { gap: 12, paddingTop: 4 },
  creditorEntryHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  creditorNum:          { color: AppColors.text, fontSize: 13, fontWeight: '600' },
  chipWrap:             { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeChip:             { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: AppColors.screen, borderWidth: 1, borderColor: AppColors.hairline },
  typeChipOn:           { backgroundColor: ACCENT + '22', borderColor: ACCENT },
  typeChipText:         { color: AppColors.textMuted, fontSize: 12 },
  typeChipTextOn:       { color: ACCENT, fontWeight: '600' },
  creditorEmpty:        { alignItems: 'center', gap: 8, paddingVertical: 20 },
  creditorEmptyText:    { color: AppColors.text, fontSize: 14, fontWeight: '600' },
  creditorEmptyHint:    { color: AppColors.textMuted, fontSize: 12 },

  // expense section
  expenseIntro:    { color: AppColors.textMuted, fontSize: 12, lineHeight: 17, marginTop: -6 },
  groupHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  groupHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  groupHeaderRight:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupLabel:      { color: AppColors.text, fontSize: 14, fontWeight: '500' },
  groupSubtotal:   { color: ACCENT, fontSize: 12, fontWeight: '600' },
  filledBadge:     { backgroundColor: ACCENT + '22', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  filledBadgeText: { color: ACCENT, fontSize: 11, fontWeight: '700' },
  groupItemLabel:  { color: AppColors.text, fontSize: 13, fontWeight: '500', marginBottom: 2 },

  // next sections preview
  nextItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nextLabel: { color: AppColors.textMuted, fontSize: 14, flex: 1 },
  nextBadge: {
    color: AppColors.textMuted, fontSize: 11, fontWeight: '600',
    backgroundColor: AppColors.hairline,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },

  // save
  saveBtn: {
    backgroundColor: ACCENT,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 15,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
