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
    // 日付文字列比較 (YYYY-MM-DD)
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    // 同じ日付なら作成日時順
    return new Date(b.createdAt) - new Date(a.createdAt);
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
      // 種目ごとの色を取得
      const color = EXERCISE_COLORS[record.exercise] || '#666';
      // セット数の表示（デフォルト3セット）
      const sets = record.sets || 3;
      // 重さの表示
      const weightDisplay = record.weight ? ` @ ${record.weight}kg` : '';

      html += `
        <tr class="record-row">
          <td class="cell-radio">
            <input type="radio" name="selected-record" value="${record.id}" id="record-${record.id}" onchange="handleRecordSelection()">
          </td>
          <td class="cell-exercise" style="color: ${color}; font-weight: bold;">${record.exercise}</td>
          <td class="cell-count">${record.count} 回 x ${sets} セット${weightDisplay}</td>
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
    const dateKey = record.date;

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

  // フォームに値を設定
  const dateSelect = document.getElementById('edit-date-select');
  const exerciseSelect = document.getElementById('edit-exercise-select');
  const countInput = document.getElementById('edit-count-input');
  const setsSelect = document.getElementById('edit-sets-select');
  const weightSelect = document.getElementById('edit-weight-select');

  if (dateSelect) {
    // 日付選択のオプションを再生成（過去7日）
    populateDateOptions(dateSelect);
    const dateStr = record.date;
    // 該当する日付が選択肢にない場合は追加して選択
    const hasExistingOption = Array.from(dateSelect.options).some(option => option.value === dateStr);
    if (!hasExistingOption) {
      const option = document.createElement('option');
      option.value = dateStr;
      option.textContent = `${dateStr} (記録日)`;
      dateSelect.appendChild(option);
    }
    dateSelect.value = dateStr;
  }

  if (exerciseSelect) {
    // セレクトが空の場合や初期化漏れに備えて再生成
    if (exerciseSelect.options.length === 0) {
      initEditForm(); // 種目選択を再初期化
    }
    // セレクトに対象の種目が存在しない場合は追加する
    const hasExercise = Array.from(exerciseSelect.options).some(option => option.value === record.exercise);
    if (!hasExercise) {
      const option = document.createElement('option');
      option.value = record.exercise;
      option.textContent = `${record.exercise} (記録の種目)`;
      exerciseSelect.appendChild(option);
    }
    exerciseSelect.value = record.exercise;
  }

  if (countInput) {
    countInput.value = record.count;
  }

  if (setsSelect) {
    setsSelect.value = record.sets || 3;
  }

  if (weightSelect) {
    // 重さセレクトの初期化（ui.jsの関数を使用）
    if (typeof initWeightSelect === 'function') {
      // edit用のselectを初期化
      const tempWeightSelect = weightSelect;
      tempWeightSelect.id = 'weight'; // 一時的にIDを変更
      initWeightSelect();
      tempWeightSelect.id = 'edit-weight-select'; // 元に戻す
    }
    weightSelect.value = record.weight || '';
  }

  modal.classList.remove('hidden');
}

/**
 * 過去7日の日付オプションを生成する（ui.jsからコピーまたは共通化すべきだが、簡易的にここに実装）
 */
function populateDateOptions(selectElement) {
  selectElement.innerHTML = '';
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const option = document.createElement('option');
    option.value = dateStr;

    let label = `${month}/${day}`;
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    label += ` (${dayOfWeek})`;

    if (i === 0) label += ' - 今日';
    else if (i === 1) label += ' - 昨日';

    option.textContent = label;
    selectElement.appendChild(option);
  }
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

  // 種目選択のオプション生成
  const exerciseSelect = document.getElementById('edit-exercise-select');
  if (exerciseSelect) {
    // EXERCISESが未初期化の場合はここで初期化する
    if ((!EXERCISES || EXERCISES.length === 0) && typeof initializeExerciseConstants === 'function') {
      initializeExerciseConstants();
    }

    exerciseSelect.innerHTML = '';
    const exerciseList = (EXERCISES && EXERCISES.length > 0)
      ? EXERCISES
      : (typeof getExerciseNames === 'function' ? getExerciseNames() : []);

    exerciseList.forEach(exercise => {
      const option = document.createElement('option');
      option.value = exercise;
      option.textContent = exercise;
      exerciseSelect.appendChild(option);
    });
  }

  // セット数選択のオプション生成
  const setsSelect = document.getElementById('edit-sets-select');
  if (setsSelect) {
    setsSelect.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      setsSelect.appendChild(option);
    }
  }

  // 重さ選択の初期化
  const weightSelect = document.getElementById('edit-weight-select');
  if (weightSelect && typeof initWeightSelect === 'function') {
    const tempWeightSelect = weightSelect;
    tempWeightSelect.id = 'weight'; // 一時的にIDを変更
    initWeightSelect();
    tempWeightSelect.id = 'edit-weight-select'; // 元に戻す
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

  const formData = new FormData(event.target);
  const date = formData.get('date');
  const exercise = formData.get('exercise');
  const count = parseInt(formData.get('count'), 10);
  const sets = parseInt(formData.get('sets'), 10);
  const weight = formData.get('weight') ? parseFloat(formData.get('weight')) : null;

  if (!date || !exercise || isNaN(count) || count <= 0 || isNaN(sets) || sets <= 0) {
    alert('正しい値を入力してください');
    return;
  }

  // レコード更新
  const updates = {
    date: date,
    exercise: exercise,
    count: count,
    sets: sets
  };

  // 重さが指定されている場合のみ追加
  if (weight !== null && weight > 0) {
    updates.weight = weight;
  } else {
    // 重さがない場合は削除
    updates.weight = null;
  }

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
 * 記録削除ハンドラ
 */
function handleDeleteRecord() {
  if (!editingRecordId) {
    alert('削除対象の記録が見つかりません');
    return;
  }

  // 確認ダイアログ
  if (!confirm('この記録を削除してもよろしいですか？')) {
    return;
  }

  try {
    deleteRecord(editingRecordId);

    // UI更新
    renderHistoryList();

    // モーダルを閉じる
    closeEditModal();

    alert('記録を削除しました');
  } catch (error) {
    console.error('Failed to delete record:', error);
    alert('記録の削除に失敗しました');
  }
}

/**
 * アプリケーションの初期化
 */
function initHistoryPage() {
  // 戻るボタン
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }

  // CSVダウンロードボタン
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function () {
      try {
        exportToCSV();
      } catch (error) {
        console.error('Failed to export CSV:', error);
        alert('CSVのエクスポートに失敗しました');
      }
    });
  }

  // 編集ボタン（ヘッダー）
  const editBtn = document.getElementById('edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', openSelectedEditModal);
  }

  // 編集フォームの初期化
  try {
    initEditForm();
  } catch (error) {
    console.error('Failed to init edit form:', error);
  }

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

  // 削除ボタン
  const deleteBtn = document.getElementById('delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', handleDeleteRecord);
  }

  // 記録一覧の表示
  try {
    renderHistoryList();
  } catch (error) {
    console.error('Failed to render history list:', error);
  }
}

// DOMContentLoaded時に初期化（EXERCISES初期化を確実に待つ）
document.addEventListener('DOMContentLoaded', initHistoryPage);




