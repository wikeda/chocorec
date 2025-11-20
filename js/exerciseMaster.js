/**
 * 種目マスタデータ管理
 * 種目の追加、更新、削除、並び順変更を管理する
 */

const EXERCISE_STORAGE_KEY = 'trainingRecExercises';
const EXERCISE_DATA_VERSION = '1.0';
const MAX_EXERCISES = 50;

// 初期種目データ（既存の9種目）
const DEFAULT_EXERCISES = [
  { name: 'レッグプレス', color: '#ef4444' },
  { name: 'チェストプレス', color: '#f97316' },
  { name: 'ラットプルダウン', color: '#f59e0b' },
  { name: 'アブベンチ', color: '#84cc16' },
  { name: 'アブダクション', color: '#10b981' },
  { name: 'アダクション', color: '#06b6d4' },
  { name: 'ディップス', color: '#3b82f6' },
  { name: 'ショルダープレス', color: '#6366f1' },
  { name: 'バイセップスカール', color: '#8b5cf6' }
];

/**
 * UUID生成
 */
function generateExerciseUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 種目データをローカルストレージから読み込む
 */
function loadExercises() {
  try {
    const json = localStorage.getItem(EXERCISE_STORAGE_KEY);
    if (!json) {
      // 初回起動時：デフォルト種目を初期化
      return initializeDefaultExercises();
    }
    const data = JSON.parse(json);
    if (!data.version) {
      data.version = EXERCISE_DATA_VERSION;
    }
    return data;
  } catch (error) {
    console.error('Failed to load exercises:', error);
    return initializeDefaultExercises();
  }
}

/**
 * デフォルト種目を初期化
 */
function initializeDefaultExercises() {
  const exercises = DEFAULT_EXERCISES.map((ex, index) => ({
    id: generateExerciseUUID(),
    name: ex.name,
    color: ex.color,
    order: index,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  const data = {
    exercises: exercises,
    version: EXERCISE_DATA_VERSION
  };

  saveExercises(data);
  return data;
}

/**
 * 種目データをローカルストレージに保存
 */
function saveExercises(data) {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(EXERCISE_STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save exercises:', error);
    alert('種目データの保存に失敗しました。');
    throw error;
  }
}

/**
 * 全種目を取得（削除済みも含む）
 */
function getAllExercises() {
  const data = loadExercises();
  return data.exercises || [];
}

/**
 * アクティブな種目のみを取得（並び順でソート）
 */
function getActiveExercises() {
  const exercises = getAllExercises();
  return exercises
    .filter(ex => ex.isActive)
    .sort((a, b) => a.order - b.order);
}

/**
 * IDで種目を取得
 */
function getExerciseById(id) {
  const exercises = getAllExercises();
  return exercises.find(ex => ex.id === id) || null;
}

/**
 * 種目名で検索（重複チェック用）
 */
function findExerciseByName(name, excludeId = null) {
  const exercises = getAllExercises();
  return exercises.find(ex =>
    ex.name === name &&
    ex.isActive &&
    ex.id !== excludeId
  ) || null;
}

/**
 * 種目を追加
 */
function addExercise(name, color) {
  // 重複チェック
  if (findExerciseByName(name)) {
    throw new Error('同じ名前の種目が既に存在します。');
  }

  const data = loadExercises();

  // 最大数チェック
  const activeCount = data.exercises.filter(ex => ex.isActive).length;
  if (activeCount >= MAX_EXERCISES) {
    throw new Error(`種目は最大${MAX_EXERCISES}件までです。`);
  }

  // 新しい並び順を計算
  const maxOrder = data.exercises.reduce((max, ex) => Math.max(max, ex.order), -1);

  const newExercise = {
    id: generateExerciseUUID(),
    name: name,
    color: color,
    order: maxOrder + 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.exercises.push(newExercise);
  saveExercises(data);
  return newExercise;
}

/**
 * 種目を更新
 */
function updateExercise(id, updates) {
  const data = loadExercises();
  const index = data.exercises.findIndex(ex => ex.id === id);

  if (index === -1) {
    throw new Error('種目が見つかりません。');
  }

  const exercise = data.exercises[index];

  // 名前変更時の重複チェック
  if (updates.name && updates.name !== exercise.name) {
    if (findExerciseByName(updates.name, id)) {
      throw new Error('同じ名前の種目が既に存在します。');
    }
  }

  const oldName = exercise.name;
  const updatedExercise = {
    ...exercise,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  data.exercises[index] = updatedExercise;
  saveExercises(data);

  // 名前が変更された場合、過去の記録も更新
  if (updates.name && updates.name !== oldName) {
    updateTrainingRecordExerciseName(oldName, updates.name);
  }

  return updatedExercise;
}

/**
 * 種目を削除（論理削除）
 */
function deleteExercise(id) {
  const data = loadExercises();
  const index = data.exercises.findIndex(ex => ex.id === id);

  if (index === -1) {
    throw new Error('種目が見つかりません。');
  }

  // 論理削除
  data.exercises[index].isActive = false;
  data.exercises[index].updatedAt = new Date().toISOString();

  saveExercises(data);
  return true;
}

/**
 * 種目の並び順を変更
 */
function moveExercise(id, direction) {
  const data = loadExercises();
  const activeExercises = data.exercises
    .filter(ex => ex.isActive)
    .sort((a, b) => a.order - b.order);

  const currentIndex = activeExercises.findIndex(ex => ex.id === id);
  if (currentIndex === -1) {
    throw new Error('種目が見つかりません。');
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= activeExercises.length) {
    return false; // 移動不可
  }

  // 順序を入れ替え
  const temp = activeExercises[currentIndex].order;
  activeExercises[currentIndex].order = activeExercises[targetIndex].order;
  activeExercises[targetIndex].order = temp;

  // 更新日時を設定
  activeExercises[currentIndex].updatedAt = new Date().toISOString();
  activeExercises[targetIndex].updatedAt = new Date().toISOString();

  // データ全体を更新
  activeExercises.forEach(ex => {
    const index = data.exercises.findIndex(e => e.id === ex.id);
    if (index !== -1) {
      data.exercises[index] = ex;
    }
  });

  saveExercises(data);
  return true;
}

/**
 * トレーニング記録の種目名を一括更新
 */
function updateTrainingRecordExerciseName(oldName, newName) {
  try {
    // data.jsのloadFromStorage/saveToStorageを使用
    if (typeof loadFromStorage !== 'function' || typeof saveToStorage !== 'function') {
      console.warn('data.js functions not available');
      return;
    }

    const data = loadFromStorage();
    let updateCount = 0;

    data.trainingRecords.forEach(record => {
      if (record.exercise === oldName) {
        record.exercise = newName;
        record.updatedAt = new Date().toISOString();
        updateCount++;
      }
    });

    if (updateCount > 0) {
      saveToStorage(data);
    }
  } catch (error) {
    console.error('Failed to update training records:', error);
  }
}

/**
 * 種目の色を取得（互換性のため）
 */
function getExerciseColor(exerciseName) {
  const exercises = getAllExercises();
  const exercise = exercises.find(ex => ex.name === exerciseName);
  return exercise ? exercise.color : '#cbd5e1'; // デフォルトグレー
}

/**
 * アクティブな種目名リストを取得（互換性のため）
 */
function getExerciseNames() {
  return getActiveExercises().map(ex => ex.name);
}

/**
 * 種目の色マップを取得（互換性のため）
 */
function getExerciseColorMap() {
  const exercises = getAllExercises();
  const colorMap = {};
  exercises.forEach(ex => {
    colorMap[ex.name] = ex.color;
  });
  return colorMap;
}
