/**
 * 定数定義
 * 種目マスタから動的に取得する
 */

// 後方互換性のため、EXERCISES配列とEXERCISE_COLORSオブジェクトを提供
// 実際のデータは exerciseMaster.js から取得される

// グローバル変数として定義（他のファイルから参照される）
let EXERCISES = [];
let EXERCISE_COLORS = {};

/**
 * 種目データを初期化（exerciseMaster.jsが読み込まれた後に実行）
 */
function initializeExerciseConstants() {
  if (typeof getExerciseNames === 'function') {
    EXERCISES = getExerciseNames();
  }
  if (typeof getExerciseColorMap === 'function') {
    EXERCISE_COLORS = getExerciseColorMap();
  }
}

// DOMContentLoadedで初期化
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function() {
    initializeExerciseConstants();
  });
}
