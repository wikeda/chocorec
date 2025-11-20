/**
 * バリデーションロジック
 * フォーム入力値の妥当性をチェックする
 */

/**
 * トレーニング記録フォームのバリデーション
 * @param {Object} formData - フォームデータ
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateTrainingRecord(formData) {
  const errors = [];

  // 必須項目チェック
  if (!formData.date) {
    errors.push('日付を選択してください');
  }
  if (!formData.exercise) {
    errors.push('種目を選択してください');
  }
  if (formData.count === null || formData.count === undefined || formData.count === '') {
    errors.push('回数を入力してください');
  }

  // 回数の妥当性チェック
  if (parseInt(formData.count) <= 0) {
    errors.push('回数は1回以上にしてください');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}




