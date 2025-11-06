/**
 * 睡眠種類判定ロジック
 * 睡眠開始時刻から睡眠の種類（夜/昼）を判定する
 */

/**
 * 睡眠開始時刻から睡眠の種類を判定
 * @param {Date} startDateTime - 睡眠開始日時
 * @returns {'night' | 'day'} - 睡眠の種類
 */
function determineSleepType(startDateTime) {
  const hour = startDateTime.getHours();
  // 22時以降から07時まで：夜の睡眠
  if (hour >= 22 || hour < 7) {
    return 'night';
  }
  // それ以外：昼の睡眠
  return 'day';
}

