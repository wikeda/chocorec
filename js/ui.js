/**
 * UI制御ロジック
 * DOM操作とUIの更新を担当する
 */

/**
 * 過去7日の日付オプションを生成する
 * @param {HTMLSelectElement} selectElement - セレクト要素
 */
function populateDateOptions(selectElement) {
  selectElement.innerHTML = '';
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const option = document.createElement('option');
    option.value = date.toISOString().split('T')[0];
    const dayLabel = i === 0 ? '今日' : i === 1 ? '昨日' : `${i}日前`;
    option.textContent = `${formatDate(date)} (${dayLabel})`;
    // デフォルトは昨日（i === 1）を選択
    if (i === 1) {
      option.selected = true;
    }
    selectElement.appendChild(option);
  }
}

/**
 * 時刻選択のオプションを生成する
 * @param {HTMLSelectElement} selectElement - セレクト要素
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @param {number} step - 刻み値（分の場合のみ使用）
 */
function populateTimeOptions(selectElement, min, max, step = 1) {
  selectElement.innerHTML = '';
  for (let i = min; i <= max; i += step) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = String(i).padStart(2, '0');
    selectElement.appendChild(option);
  }
}

/**
 * 日付をフォーマットする（YYYY-MM-DD）
 * @param {Date} date - 日付オブジェクト
 * @returns {string} フォーマットされた日付文字列
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 日付を日本語形式でフォーマットする（MM/DD形式）
 * @param {Date} date - 日付オブジェクト
 * @returns {string} フォーマットされた日付文字列
 */
function formatDateJP(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

/**
 * 日時をフォーマットする（DD日 HH:MM形式）
 * @param {Date} date - 日時オブジェクト
 * @returns {string} フォーマットされた日時文字列
 */
function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}日 ${hours}:${minutes}`;
}

/**
 * 睡眠時間をフォーマットする（HH時間MM分形式）
 * @param {number} hours - 時間
 * @param {number} minutes - 分
 * @returns {string} フォーマットされた文字列
 */
function formatSleepDuration(hours, minutes) {
  if (hours === 0 && minutes === 0) {
    return '0分';
  }
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours}時間`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}分`);
  }
  return parts.join('');
}

/**
 * 昨日・今日の記録表を更新する
 */
function updateRecentRecordsTable() {
  const table = document.getElementById('recent-table');
  if (!table) return;
  
  const tbody = table.querySelector('tbody') || document.createElement('tbody');
  tbody.innerHTML = '';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayRecords = getRecordsByDate(today);
  const yesterdayRecords = getRecordsByDate(yesterday);
  
  const allRecords = [...todayRecords, ...yesterdayRecords].sort((a, b) => {
    return new Date(b.startDateTime) - new Date(a.startDateTime);
  });
  
  if (allRecords.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="2">記録がありません</td>';
    tbody.appendChild(row);
  } else {
    allRecords.forEach(record => {
      const row = document.createElement('tr');
      const startDate = new Date(record.startDateTime);
      row.innerHTML = `
        <td>${formatDateTime(startDate)}</td>
        <td>${formatSleepDuration(record.sleepDuration.hours, record.sleepDuration.minutes)}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  if (!table.querySelector('tbody')) {
    table.appendChild(tbody);
  }
}

/**
 * フォームをリセットする
 */
function resetForm() {
  const form = document.getElementById('sleep-form');
  if (form) {
    form.reset();
    // 日付を今日に戻す
    const dateSelect = document.getElementById('date-select');
    if (dateSelect) {
      dateSelect.selectedIndex = 0;
    }
  }
}

