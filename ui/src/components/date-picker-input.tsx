import { StyleSheet, TextInput } from 'react-native';
import { AppColors } from '@/constants/appTheme';

export function DatePickerInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      placeholderTextColor={AppColors.textMuted}
      keyboardType="numeric"
      style={styles.input}
      autoCorrect={false}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    backgroundColor: AppColors.screen,
    borderWidth: 1,
    borderColor: AppColors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: AppColors.text,
    fontSize: 16,
  },
});
