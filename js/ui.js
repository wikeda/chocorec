/**
 * UI操作関連のロジック
 * フォームの初期化や表示更新を行う
 */

/**
 * 日付選択の初期化
 */
function initDateSelect() {
  const dateSelect = document.getElementById('date-select');
  if (!dateSelect) return;

  populateDateOptions(dateSelect);
}

/**
 * 日付オプションを生成する
 * @param {HTMLSelectElement} selectElement - セレクト要素
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

    option.textContent = label;
    selectElement.appendChild(option);
  }
}

/**
 * 種目選択の初期化
 */
function initExerciseSelect() {
  const exerciseSelect = document.getElementById('exercise-select');
  if (!exerciseSelect) return;

  // 既存のオプションをクリア
  exerciseSelect.innerHTML = '';

  // デフォルトの空オプション
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '種目を選択してください';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  exerciseSelect.appendChild(defaultOption);

  // constants.jsから種目リストを取得して追加
  if (typeof EXERCISES !== 'undefined') {
    EXERCISES.forEach(exercise => {
      const option = document.createElement('option');
      option.value = exercise;
      option.textContent = exercise;
      exerciseSelect.appendChild(option);
    });
  }

  // 種目変更時のイベントリスナー
  exerciseSelect.addEventListener('change', function () {
    updateCountInput();
  });
}

/**
 * 回数プルダウンを初期化
 */
function initCountSelect() {
  const countSelect = document.getElementById('count');
  if (!countSelect) return;

  countSelect.innerHTML = '';

  // 1～50回まで選択肢を生成
  for (let i = 1; i <= 50; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    if (i === 10) option.selected = true; // デフォルトは10回
    countSelect.appendChild(option);
  }
}

/**
 * セット数プルダウンを初期化
 */
function initSetsSelect() {
  const setsSelect = document.getElementById('sets');
  if (!setsSelect) return;

  setsSelect.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    if (i === 3) option.selected = true; // デフォルトは3セット
    setsSelect.appendChild(option);
  }
}

/**
 * 重さプルダウンを初期化
 */
function initWeightSelect() {
  const weightSelect = document.getElementById('weight');
  if (!weightSelect) return;

  weightSelect.innerHTML = '';

  // 空のオプション（重さなし）
  const noneOption = document.createElement('option');
  noneOption.value = '';
  noneOption.textContent = 'なし';
  weightSelect.appendChild(noneOption);

  // 5kg刻みで100kgまで
  for (let i = 5; i <= 100; i += 5) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    if (i === 20) option.selected = true; // デフォルトは20kg
    weightSelect.appendChild(option);
  }
}

/**
 * 種目選択時に前回の回数、セット数、重さを自動入力
 */
function updateCountInput() {
  const exerciseSelect = document.getElementById('exercise-select');
  const countInput = document.getElementById('count');
  const setsSelect = document.getElementById('sets');
  const weightSelect = document.getElementById('weight');

  if (!exerciseSelect || !countInput || !setsSelect) return;

  const exercise = exerciseSelect.value;
  const lastData = getLastCount(exercise);

  if (lastData) {
    // lastDataがオブジェクトか数値かで分岐
    if (typeof lastData === 'object' && lastData !== null) {
      countInput.value = lastData.count;
      if (lastData.sets) {
        setsSelect.value = lastData.sets;
      } else {
        setsSelect.value = 3; // デフォルト
      }
      // 重さも自動入力
      if (weightSelect) {
        if (lastData.weight !== null && lastData.weight !== undefined) {
          weightSelect.value = lastData.weight;
        } else {
          weightSelect.value = 20; // デフォルト20kg
        }
      }
    } else {
      // 古いデータ互換
      countInput.value = lastData;
      setsSelect.value = 3; // デフォルト
      if (weightSelect) {
        weightSelect.value = 20; // デフォルト20kg
      }
    }
  } else {
    countInput.value = '';
    setsSelect.value = 3; // デフォルト
    if (weightSelect) {
      weightSelect.value = 20; // デフォルト20kg
    }
  }
}
