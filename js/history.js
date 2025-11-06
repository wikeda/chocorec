/**
 * 過去記録一覧画面のロジック
 * 過去の記録を表示し、編集機能を提供する
 */

let editingRecordId = null;

/**
 * 過去記録一覧を表示する
 */
function renderHistoryList() {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;

  const records = getAllRecords();

  // 日付順でソート（新しい順）
  const sortedRecords = records.sort((a, b) => {
    return new Date(b.startDateTime) - new Date(a.startDateTime);
  });

  if (sortedRecords.length === 0) {
    historyList.innerHTML = '<p class="no-records">記録がありません</p>';
    return;
  }

  // 日付ごとにグループ化
  const groupedRecords = groupRecordsByDate(sortedRecords);

  let html = '';
  for (const [date, dateRecords] of Object.entries(groupedRecords)) {
    html += `<div class="date-group">
      <h3 class="date-header">${formatDateHeader(date)}</h3>
      <table class="records-table">
        <tbody>`;

    dateRecords.forEach(record => {
      const startDate = new Date(record.startDateTime);
      const sleepTypeLabel = record.sleepType === 'night' ? '夜' : '昼';
      const sleepTypeClass = record.sleepType === 'night' ? 'sleep-type-night' : 'sleep-type-day';
      const day = String(startDate.getDate()).padStart(2, '0');
      const hours = String(startDate.getHours()).padStart(2, '0');
      const minutes = String(startDate.getMinutes()).padStart(2, '0');

      html += `
        <tr class="record-row">
          <td class="cell-radio">
            <input type="radio" name="selected-record" value="${record.id}" id="record-${record.id}" onchange="handleRecordSelection()">
          </td>
          <td class="cell-date">${day}日 ${hours}:${minutes}</td>
          <td class="cell-duration">${formatSleepDuration(record.sleepDuration.hours, record.sleepDuration.minutes)}</td>
          <td class="cell-type">
            <span class="sleep-type-badge ${sleepTypeClass}">${sleepTypeLabel}</span>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
  }

  historyList.innerHTML = html;
}

/**
 * 記録を日付ごとにグループ化する
 * @param {Array} records - 記録の配列
 * @returns {Object} 日付をキーとしたオブジェクト
 */
function groupRecordsByDate(records) {
  const grouped = {};
  
  records.forEach(record => {
    const date = new Date(record.startDateTime);
    const dateKey = formatDate(date);
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(record);
  });
  
  return grouped;
}

/**
 * 日付ヘッダーをフォーマットする
 * @param {string} dateStr - 日付文字列（YYYY-MM-DD）
 * @returns {string} フォーマットされた文字列
 */
function formatDateHeader(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  if (targetDate.getTime() === today.getTime()) {
    return '今日';
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return '昨日';
  } else {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日(${weekday})`;
  }
}

/**
 * ラジオボタン選択時の処理
 */
function handleRecordSelection() {
  const editBtn = document.getElementById('edit-btn');
  const selectedRadio = document.querySelector('input[name="selected-record"]:checked');

  if (editBtn) {
    editBtn.disabled = !selectedRadio;
  }
}

/**
 * 選択された記録の編集モーダルを開く
 */
function openSelectedEditModal() {
  const selectedRadio = document.querySelector('input[name="selected-record"]:checked');

  if (!selectedRadio) {
    alert('編集する記録を選択してください');
    return;
  }

  const recordId = selectedRadio.value;
  openEditModal(recordId);
}

/**
 * 編集モーダルを開く
 * @param {string} recordId - 編集する記録のID
 */
function openEditModal(recordId) {
  editingRecordId = recordId;
  const record = getRecordById(recordId);

  if (!record) {
    alert('記録が見つかりません');
    return;
  }

  const modal = document.getElementById('edit-modal');
  const startDate = new Date(record.startDateTime);
  
  // フォームに値を設定
  const dateSelect = document.getElementById('edit-date-select');
  const hourSelect = document.getElementById('edit-hour-select');
  const minuteSelect = document.getElementById('edit-minute-select');
  const durationHourSelect = document.getElementById('edit-duration-hour-select');
  const durationMinuteSelect = document.getElementById('edit-duration-minute-select');
  
  if (dateSelect) {
    // 日付選択のオプションを再生成（過去7日）
    populateDateOptions(dateSelect);
    const dateStr = formatDate(startDate);
    // 該当する日付が選択肢にあるか確認
    let found = false;
    for (let i = 0; i < dateSelect.options.length; i++) {
      if (dateSelect.options[i].value === dateStr) {
        dateSelect.selectedIndex = i;
        found = true;
        break;
      }
    }
    // 見つからない場合は最初のオプションを選択
    if (!found && dateSelect.options.length > 0) {
      dateSelect.selectedIndex = 0;
    }
  }
  
  if (hourSelect) {
    hourSelect.value = startDate.getHours();
  }
  
  if (minuteSelect) {
    // 5分単位に丸める
    const minutes = Math.round(startDate.getMinutes() / 5) * 5;
    minuteSelect.value = minutes;
  }
  
  if (durationHourSelect) {
    durationHourSelect.value = record.sleepDuration.hours;
  }
  
  if (durationMinuteSelect) {
    durationMinuteSelect.value = record.sleepDuration.minutes;
  }
  
  modal.classList.remove('hidden');
}

/**
 * 編集モーダルを閉じる
 */
function closeEditModal() {
  const modal = document.getElementById('edit-modal');
  modal.classList.add('hidden');
  editingRecordId = null;
}

/**
 * 編集フォームの初期化
 */
function initEditForm() {
  // 日付選択のオプション生成
  const dateSelect = document.getElementById('edit-date-select');
  if (dateSelect) {
    populateDateOptions(dateSelect);
  }
  
  // 時刻選択のオプション生成
  const hourSelect = document.getElementById('edit-hour-select');
  if (hourSelect) {
    populateTimeOptions(hourSelect, 0, 23);
  }
  
  const minuteSelect = document.getElementById('edit-minute-select');
  if (minuteSelect) {
    populateTimeOptions(minuteSelect, 0, 55, 5);
  }
  
  // 睡眠時間選択のオプション生成
  const durationHourSelect = document.getElementById('edit-duration-hour-select');
  if (durationHourSelect) {
    populateTimeOptions(durationHourSelect, 0, 23);
  }
  
  const durationMinuteSelect = document.getElementById('edit-duration-minute-select');
  if (durationMinuteSelect) {
    populateTimeOptions(durationMinuteSelect, 0, 55, 5);
  }
}

/**
 * 編集フォームの送信ハンドラ
 */
function handleEditSubmit(event) {
  event.preventDefault();
  
  if (!editingRecordId) {
    alert('編集対象の記録が見つかりません');
    return;
  }
  
  const formData = {
    date: document.getElementById('edit-date-select').value,
    hour: parseInt(document.getElementById('edit-hour-select').value),
    minute: parseInt(document.getElementById('edit-minute-select').value),
    durationHour: parseInt(document.getElementById('edit-duration-hour-select').value),
    durationMinute: parseInt(document.getElementById('edit-duration-minute-select').value)
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
  
  // レコード更新
  const updates = {
    startDateTime: startDateTime.toISOString(),
    sleepDuration: {
      hours: formData.durationHour,
      minutes: formData.durationMinute
    },
    sleepType: sleepType
  };
  
  try {
    updateRecord(editingRecordId, updates);
    
    // UI更新
    renderHistoryList();
    
    // モーダルを閉じる
    closeEditModal();
    
    alert('記録を更新しました');
  } catch (error) {
    console.error('Failed to update record:', error);
    alert('記録の更新に失敗しました');
  }
}

/**
 * アプリケーションの初期化
 */
function initHistoryPage() {
  // 戻るボタン
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = 'index.html';
    });
  }

  // 編集ボタン（ヘッダー）
  const editBtn = document.getElementById('edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', openSelectedEditModal);
  }

  // 編集フォームの初期化
  initEditForm();

  // 編集フォームの送信イベント
  const editForm = document.getElementById('edit-form');
  if (editForm) {
    editForm.addEventListener('submit', handleEditSubmit);
  }

  // キャンセルボタン
  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeEditModal);
  }

  // 記録一覧の表示
  renderHistoryList();
}

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', initHistoryPage);

