/**
 * バリデーションロジック
 * フォーム入力値の妥当性をチェックする
 */

/**
 * 睡眠記録フォームのバリデーション
 * @param {Object} formData - フォームデータ
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateSleepRecord(formData) {
  const errors = [];
  
  // 必須項目チェック
  if (!formData.date) {
    errors.push('日付を選択してください');
  }
  if (formData.hour === null || formData.hour === undefined || formData.hour === '') {
    errors.push('時刻（時）を選択してください');
  }
  if (formData.minute === null || formData.minute === undefined || formData.minute === '') {
    errors.push('時刻（分）を選択してください');
  }
  if (formData.durationHour === null || formData.durationHour === undefined || formData.durationHour === '') {
    errors.push('睡眠時間（時）を選択してください');
  }
  if (formData.durationMinute === null || formData.durationMinute === undefined || formData.durationMinute === '') {
    errors.push('睡眠時間（分）を選択してください');
  }
  
  // 睡眠時間の妥当性チェック
  if (formData.durationHour === 0 && formData.durationMinute === 0) {
    errors.push('睡眠時間は0分以上にしてください');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

