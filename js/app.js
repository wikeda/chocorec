/**
 * アプリケーションエントリーポイント
 * アプリの初期化とイベントハンドラの設定を行う
 */

/**
 * アプリケーションの初期化
 */
function initApp() {
  // UI要素の初期化
  if (typeof initDateSelect === 'function') {
    initDateSelect();
  }
  if (typeof initExerciseSelect === 'function') {
    initExerciseSelect();
  }
  if (typeof initCountSelect === 'function') {
    initCountSelect();
  }
  if (typeof initSetsSelect === 'function') {
    initSetsSelect();
  }
  if (typeof initWeightSelect === 'function') {
    initWeightSelect();
  }

  // イベントリスナーの設定
  setupEventListeners();

  // グラフの初期表示（週次をデフォルト）
  if (typeof updateWeekChart === 'function') {
    updateWeekChart();
  }

  // グラフコントロールの表示切り替え（chart.jsで設定）
  if (typeof setupChartControls === 'function') {
    setupChartControls();
  }
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
  // フォーム送信イベント
  const form = document.getElementById('training-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // グラフタブの設定
  if (typeof setupChartTabs === 'function') {
    setupChartTabs();
  }
  if (typeof setupChartControls === 'function') {
    setupChartControls();
  }
}

/**
 * フォーム送信ハンドラ
 * @param {Event} event - イベントオブジェクト
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const date = formData.get('date');
  const exercise = formData.get('exercise');
  const count = parseInt(formData.get('count'), 10);
  const sets = parseInt(formData.get('sets'), 10);
  const weight = formData.get('weight') ? parseFloat(formData.get('weight')) : null;

  if (!date || !exercise || isNaN(count) || count <= 0 || isNaN(sets) || sets <= 0) {
    alert('正しい値を入力してください。');
    return;
  }

  const record = {
    date: date,
    exercise: exercise,
    count: count,
    sets: sets
  };

  // 重さが指定されている場合のみ追加
  if (weight !== null && weight > 0) {
    record.weight = weight;
  }

  try {
    addRecord(record);
    alert('記録しました！');

    // グラフを更新
    updateChart();

  } catch (error) {
    console.error(error);
    alert('エラーが発生しました。');
  }
}
