/**
 * アプリケーションエントリーポイント
 * アプリの初期化とイベントハンドラの設定を行う
 */

/**
 * アプリケーションの初期化
 */
function initApp() {
  // UI要素の初期化
  initFormElements();
  
  // イベントリスナーの設定
  setupEventListeners();
  
  // 初期データの表示
  updateRecentRecordsTable();
  
  // グラフの初期表示（週次をデフォルト）
  if (typeof updateWeekChart === 'function') {
    updateWeekChart();
  }
}

/**
 * フォーム要素の初期化
 */
function initFormElements() {
  // 日付選択のオプション生成
  const dateSelect = document.getElementById('date-select');
  if (dateSelect) {
    populateDateOptions(dateSelect);
  }
  
  // 時刻選択のオプション生成
  const hourSelect = document.getElementById('hour-select');
  if (hourSelect) {
    populateTimeOptions(hourSelect, 0, 23);
  }
  
  const minuteSelect = document.getElementById('minute-select');
  if (minuteSelect) {
    populateTimeOptions(minuteSelect, 0, 55, 5);
  }
  
  // 睡眠時間選択のオプション生成
  const durationHourSelect = document.getElementById('duration-hour-select');
  if (durationHourSelect) {
    populateTimeOptions(durationHourSelect, 0, 23);
  }
  
  const durationMinuteSelect = document.getElementById('duration-minute-select');
  if (durationMinuteSelect) {
    populateTimeOptions(durationMinuteSelect, 0, 55, 5);
  }
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
  // フォーム送信イベント
  const form = document.getElementById('sleep-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  // CSVダウンロードボタン
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', handleDownloadClick);
  }
  
  // グラフタブの設定
  setupChartTabs();
}

/**
 * フォーム送信ハンドラ
 * @param {Event} event - イベントオブジェクト
 */
function handleFormSubmit(event) {
  event.preventDefault();
  
  const formData = {
    date: document.getElementById('date-select').value,
    hour: parseInt(document.getElementById('hour-select').value),
    minute: parseInt(document.getElementById('minute-select').value),
    durationHour: parseInt(document.getElementById('duration-hour-select').value),
    durationMinute: parseInt(document.getElementById('duration-minute-select').value)
  };
  
  // バリデーション
  const validation = validateSleepRecord(formData);
  if (!validation.isValid) {
    alert(validation.errors.join('\n'));
    return;
  }
  
  // 日時文字列の構築
  const [year, month, day] = formData.date.split('-');
  const startDateTime = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    formData.hour,
    formData.minute
  );
  
  // 睡眠種類の判定
  const sleepType = determineSleepType(startDateTime);
  
  // レコード作成
  const record = {
    startDateTime: startDateTime.toISOString(),
    sleepDuration: {
      hours: formData.durationHour,
      minutes: formData.durationMinute
    },
    sleepType: sleepType
  };
  
  try {
    addRecord(record);
    
    // UI更新
    updateRecentRecordsTable();
    updateChart(); // グラフも更新
    
    // フォームリセット
    resetForm();
    
    alert('記録を追加しました');
  } catch (error) {
    console.error('Failed to add record:', error);
    alert('記録の追加に失敗しました');
  }
}

/**
 * CSVダウンロードボタンのハンドラ
 */
function handleDownloadClick() {
  try {
    exportToCSV();
  } catch (error) {
    console.error('Failed to export CSV:', error);
    alert('CSVのエクスポートに失敗しました');
  }
}

// DOMContentLoaded時にアプリを初期化
document.addEventListener('DOMContentLoaded', initApp);

