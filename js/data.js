/**
 * データ管理（LocalStorage操作）
 * トレーニング記録の保存、読み込み、更新、削除を行う
 */

const STORAGE_KEY = 'trainingRecData';
const DATA_VERSION = '1.0';

/**
 * ローカルストレージからデータを読み込む
 * @returns {Object} { trainingRecords: [], lastCounts: {}, version: string }
 */
function loadFromStorage() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) {
      return { trainingRecords: [], lastCounts: {}, version: DATA_VERSION };
    }
    const data = JSON.parse(json);
    // バージョンチェック
    if (!data.version) {
      data.version = DATA_VERSION;
    }
    // lastCountsの初期化
    if (!data.lastCounts) {
      data.lastCounts = {};
    }
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    alert('データの読み込みに失敗しました。');
    return { trainingRecords: [], lastCounts: {}, version: DATA_VERSION };
  }
}

/**
 * ローカルストレージにデータを保存する
 * @param {Object} data - 保存するデータ
 */
function saveToStorage(data) {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save data:', error);
    alert('データの保存に失敗しました。ブラウザの設定を確認してください。');
    throw error;
  }
}

/**
 * UUIDを生成する
 * @returns {string} UUID文字列
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 全てのトレーニング記録を取得する
 * @returns {Array} トレーニング記録の配列
 */
function getAllRecords() {
  const data = loadFromStorage();
  return data.trainingRecords || [];
}

/**
 * 日付範囲でトレーニング記録を取得する
 * @param {Date} startDate - 開始日
 * @param {Date} endDate - 終了日
 * @returns {Array} トレーニング記録の配列
 */
function getRecordsByDateRange(startDate, endDate) {
  const records = getAllRecords();
  return records.filter(record => {
    const recordDate = new Date(record.date);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const rDate = new Date(record.date);
    rDate.setHours(0, 0, 0, 0);

    return rDate >= start && rDate <= end;
  });
}

/**
 * 特定の日付のトレーニング記録を取得する
 * @param {Date} date - 対象日
 * @returns {Array} トレーニング記録の配列
 */
function getRecordsByDate(date) {
  const targetDateStr = date.toISOString().split('T')[0];
  const records = getAllRecords();
  return records.filter(record => record.date === targetDateStr);
}

/**
 * IDでトレーニング記録を取得する
 * @param {string} id - レコードID
 * @returns {Object|null} トレーニング記録またはnull
 */
function getRecordById(id) {
  const records = getAllRecords();
  return records.find(record => record.id === id) || null;
}

/**
 * トレーニング記録を追加する
 * @param {Object} record - トレーニング記録
 * @returns {Object} 追加されたトレーニング記録
 */
function addRecord(record) {
  const data = loadFromStorage();
  const newRecord = {
    id: generateUUID(),
    ...record,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.trainingRecords.push(newRecord);

  // 前回回数を更新
  saveLastCount(record.exercise, record.count, record.sets);

  saveToStorage(data);
  return newRecord;
}

/**
 * トレーニング記録を更新する
 * @param {string} id - レコードID
 * @param {Object} updates - 更新内容
 * @returns {Object|null} 更新されたトレーニング記録またはnull
 */
function updateRecord(id, updates) {
  const data = loadFromStorage();
  const index = data.trainingRecords.findIndex(record => record.id === id);
  if (index === -1) {
    return null;
  }

  const updatedRecord = {
    ...data.trainingRecords[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  data.trainingRecords[index] = updatedRecord;

  // 前回回数を更新
  if (updates.exercise && updates.count) {
    saveLastCount(updates.exercise, updates.count, updates.sets || updatedRecord.sets);
  }

  saveToStorage(data);
  return updatedRecord;
}

/**
 * トレーニング記録を削除する
 * @param {string} id - レコードID
 * @returns {boolean} 削除に成功したかどうか
 */
function deleteRecord(id) {
  const data = loadFromStorage();
  const index = data.trainingRecords.findIndex(record => record.id === id);
  if (index === -1) {
    return false;
  }
  data.trainingRecords.splice(index, 1);
  saveToStorage(data);
  return true;
}

/**
 * 種目の前回回数を取得する
 * @param {string} exercise - 種目名
 * @returns {Object|null} 前回回数とセット数
 */
function getLastCount(exercise) {
  const data = loadFromStorage();
  // 古いデータ形式（数値のみ）の場合はセット数nullで返す
  const lastData = data.lastCounts ? data.lastCounts[exercise] : null;
  if (typeof lastData === 'number') {
    return { count: lastData, sets: null };
  }
  return lastData;
}

/**
 * 指定した種目の前回の回数とセット数を保存する
 * @param {string} exercise - 種目名
 * @param {number} count - 回数
 * @param {number} sets - セット数
 */
function saveLastCount(exercise, count, sets) {
  const data = loadFromStorage();
  if (!data.lastCounts) data.lastCounts = {};
  data.lastCounts[exercise] = { count, sets };
  saveToStorage(data);
}
