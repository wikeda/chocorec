/**
 * データ管理（LocalStorage操作）
 * 睡眠記録の保存、読み込み、更新、削除を行う
 */

const STORAGE_KEY = 'recSleepData';
const DATA_VERSION = '1.0';

/**
 * ローカルストレージからデータを読み込む
 * @returns {Object} { sleepRecords: [], version: string }
 */
function loadFromStorage() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) {
      return { sleepRecords: [], version: DATA_VERSION };
    }
    const data = JSON.parse(json);
    // バージョンチェック（将来のマイグレーション用）
    if (!data.version) {
      data.version = DATA_VERSION;
    }
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    alert('データの読み込みに失敗しました。');
    return { sleepRecords: [], version: DATA_VERSION };
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
 * UUIDを生成する（簡易版）
 * @returns {string} UUID文字列
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 全ての睡眠記録を取得する
 * @returns {Array} 睡眠記録の配列
 */
function getAllRecords() {
  const data = loadFromStorage();
  return data.sleepRecords || [];
}

/**
 * 日付範囲で睡眠記録を取得する
 * @param {Date} startDate - 開始日
 * @param {Date} endDate - 終了日
 * @returns {Array} 睡眠記録の配列
 */
function getRecordsByDateRange(startDate, endDate) {
  const records = getAllRecords();
  return records.filter(record => {
    const recordDate = new Date(record.startDateTime);
    return recordDate >= startDate && recordDate <= endDate;
  });
}

/**
 * 特定の日付の睡眠記録を取得する
 * @param {Date} date - 対象日
 * @returns {Array} 睡眠記録の配列
 */
function getRecordsByDate(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return getRecordsByDateRange(startOfDay, endOfDay);
}

/**
 * IDで睡眠記録を取得する
 * @param {string} id - レコードID
 * @returns {Object|null} 睡眠記録またはnull
 */
function getRecordById(id) {
  const records = getAllRecords();
  return records.find(record => record.id === id) || null;
}

/**
 * 睡眠記録を追加する
 * @param {Object} record - 睡眠記録（id, createdAt, updatedAt以外）
 * @returns {Object} 追加された睡眠記録
 */
function addRecord(record) {
  const data = loadFromStorage();
  const newRecord = {
    id: generateUUID(),
    ...record,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.sleepRecords.push(newRecord);
  saveToStorage(data);
  return newRecord;
}

/**
 * 睡眠記録を更新する
 * @param {string} id - レコードID
 * @param {Object} updates - 更新内容
 * @returns {Object|null} 更新された睡眠記録またはnull
 */
function updateRecord(id, updates) {
  const data = loadFromStorage();
  const index = data.sleepRecords.findIndex(record => record.id === id);
  if (index === -1) {
    return null;
  }
  const updatedRecord = {
    ...data.sleepRecords[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  data.sleepRecords[index] = updatedRecord;
  saveToStorage(data);
  return updatedRecord;
}

/**
 * 睡眠記録を削除する（将来拡張用）
 * @param {string} id - レコードID
 * @returns {boolean} 削除に成功したかどうか
 */
function deleteRecord(id) {
  const data = loadFromStorage();
  const index = data.sleepRecords.findIndex(record => record.id === id);
  if (index === -1) {
    return false;
  }
  data.sleepRecords.splice(index, 1);
  saveToStorage(data);
  return true;
}

/**
 * ローカルストレージをクリアする
 */
function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

