import { AppColors } from '@/constants/appTheme';

export function DatePickerInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        backgroundColor: AppColors.screen,
        border: `1px solid ${AppColors.accent}`,
        borderRadius: 10,
        padding: '10px 14px',
        color: AppColors.text,
        fontSize: 16,
        outline: 'none',
        colorScheme: 'dark',
        boxSizing: 'border-box',
      }}
    />
  );
}
