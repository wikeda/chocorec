/**
 * 種目管理画面のUI制御
 */

let currentEditingId = null;

/**
 * ページ初期化
 */
window.addEventListener('DOMContentLoaded', function () {
  initExercisesPage();
});

/**
 * 種目管理ページの初期化
 */
function initExercisesPage() {
  renderExercisesList();
  setupExerciseEventListeners();
}

/**
 * イベントリスナーの設定
 */
function setupExerciseEventListeners() {
  // 追加ボタン
  const addBtn = document.getElementById('add-exercise-btn');
  if (addBtn) {
    addBtn.addEventListener('click', handleAddExercise);
  }

  // モーダルのキャンセルボタン
  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeExerciseModal);
  }

  // モーダルの削除ボタン
  const deleteBtn = document.getElementById('modal-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', handleDeleteExercise);
  }

  // フォーム送信
  const form = document.getElementById('exercise-form');
  if (form) {
    form.addEventListener('submit', handleExerciseFormSubmit);
  }

  // カラーピッカーとテキスト入力の同期
  const colorInput = document.getElementById('exercise-color');
  const colorTextInput = document.getElementById('exercise-color-text');

  if (colorInput && colorTextInput) {
    colorInput.addEventListener('input', function () {
      colorTextInput.value = colorInput.value;
    });

    colorTextInput.addEventListener('input', function () {
      const value = colorTextInput.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        colorInput.value = value;
      }
    });
  }

  // モーダル外クリックで閉じる
  const modal = document.getElementById('exercise-modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeExerciseModal();
      }
    });
  }
}

/**
 * 種目リストをレンダリング
 */
function renderExercisesList() {
  const listContainer = document.getElementById('exercises-list');
  if (!listContainer) return;

  const exercises = getActiveExercises();

  if (exercises.length === 0) {
    listContainer.innerHTML = '<p class="info-text">種目がありません。追加ボタンから種目を追加してください。</p>';
    return;
  }

  listContainer.innerHTML = '';

  exercises.forEach((exercise, index) => {
    const item = createExerciseItem(exercise, index, exercises.length);
    listContainer.appendChild(item);
  });
}

/**
 * 種目アイテムを作成
 */
function createExerciseItem(exercise, index, totalCount) {
  const item = document.createElement('div');
  item.className = 'exercise-item';

  // 色インジケーター
  const colorDiv = document.createElement('div');
  colorDiv.className = 'exercise-color';
  colorDiv.style.backgroundColor = exercise.color;

  // 種目情報
  const infoDiv = document.createElement('div');
  infoDiv.className = 'exercise-info';

  const nameSpan = document.createElement('div');
  nameSpan.className = 'exercise-name';
  nameSpan.textContent = exercise.name;

  infoDiv.appendChild(nameSpan);

  // 並び替えボタン
  const orderControls = document.createElement('div');
  orderControls.className = 'exercise-order-controls';

  const upBtn = document.createElement('button');
  upBtn.className = 'btn-order';
  upBtn.textContent = '↑';
  upBtn.disabled = index === 0;
  upBtn.addEventListener('click', () => handleMoveExercise(exercise.id, 'up'));

  const downBtn = document.createElement('button');
  downBtn.className = 'btn-order';
  downBtn.textContent = '↓';
  downBtn.disabled = index === totalCount - 1;
  downBtn.addEventListener('click', () => handleMoveExercise(exercise.id, 'down'));

  orderControls.appendChild(upBtn);
  orderControls.appendChild(downBtn);

  // 編集ボタン
  const editBtn = document.createElement('button');
  editBtn.className = 'btn-edit-exercise';
  editBtn.textContent = '編集';
  editBtn.addEventListener('click', () => handleEditExercise(exercise.id));

  item.appendChild(colorDiv);
  item.appendChild(infoDiv);
  item.appendChild(orderControls);
  item.appendChild(editBtn);

  return item;
}

/**
 * 追加ボタンクリック
 */
function handleAddExercise() {
  currentEditingId = null;
  openExerciseModal();
}

/**
 * 編集ボタンクリック
 */
function handleEditExercise(id) {
  currentEditingId = id;
  openExerciseModal(id);
}

/**
 * モーダルを開く
 */
function openExerciseModal(exerciseId = null) {
  const modal = document.getElementById('exercise-modal');
  const modalTitle = document.getElementById('modal-title');
  const deleteBtn = document.getElementById('modal-delete-btn');
  const nameInput = document.getElementById('exercise-name');
  const colorInput = document.getElementById('exercise-color');
  const colorTextInput = document.getElementById('exercise-color-text');

  if (!modal) return;

  if (exerciseId) {
    // 編集モード
    const exercise = getExerciseById(exerciseId);
    if (!exercise) return;

    modalTitle.textContent = '種目を編集';
    deleteBtn.classList.remove('hidden');
    nameInput.value = exercise.name;
    colorInput.value = exercise.color;
    colorTextInput.value = exercise.color;
  } else {
    // 追加モード
    modalTitle.textContent = '種目を追加';
    deleteBtn.classList.add('hidden');
    nameInput.value = '';
    colorInput.value = '#3b82f6';
    colorTextInput.value = '#3b82f6';
  }

  modal.classList.remove('hidden');
  nameInput.focus();
}

/**
 * モーダルを閉じる
 */
function closeExerciseModal() {
  const modal = document.getElementById('exercise-modal');
  const form = document.getElementById('exercise-form');

  if (modal) {
    modal.classList.add('hidden');
  }

  if (form) {
    form.reset();
  }

  currentEditingId = null;
}

/**
 * フォーム送信
 */
function handleExerciseFormSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('exercise-name');
  const colorInput = document.getElementById('exercise-color');

  const name = nameInput.value.trim();
  const color = colorInput.value;

  if (!name) {
    alert('種目名を入力してください。');
    return;
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    alert('正しい色コードを入力してください。');
    return;
  }

  try {
    if (currentEditingId) {
      // 更新
      updateExercise(currentEditingId, { name, color });
      alert('種目を更新しました。');
    } else {
      // 追加
      addExercise(name, color);
      alert('種目を追加しました。');
    }

    closeExerciseModal();
    renderExercisesList();
  } catch (error) {
    alert(error.message);
  }
}

/**
 * 削除ボタンクリック
 */
function handleDeleteExercise() {
  if (!currentEditingId) return;

  const exercise = getExerciseById(currentEditingId);
  if (!exercise) return;

  if (!confirm(`「${exercise.name}」を削除しますか？\n\n過去の記録は残りますが、新規登録時には選択できなくなります。`)) {
    return;
  }

  try {
    deleteExercise(currentEditingId);
    alert('種目を削除しました。');
    closeExerciseModal();
    renderExercisesList();
  } catch (error) {
    alert(error.message);
  }
}

/**
 * 並び順変更
 */
function handleMoveExercise(id, direction) {
  try {
    const moved = moveExercise(id, direction);
    if (moved) {
      renderExercisesList();
    }
  } catch (error) {
    alert(error.message);
  }
}
