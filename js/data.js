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

  // 前回回数と重さを更新
  saveLastCount(record.exercise, record.count, record.sets, record.weight || null);

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

  // 前回回数と重さを更新
  if (updates.exercise && updates.count) {
    const weight = updates.weight !== undefined ? updates.weight : updatedRecord.weight;
    saveLastCount(updates.exercise, updates.count, updates.sets || updatedRecord.sets, weight || null);
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
 * @returns {Object|null} 前回回数、セット数、重さ
 */
function getLastCount(exercise) {
  const data = loadFromStorage();
  const lastCounts = data.lastCounts ? data.lastCounts[exercise] : null;

  // 記録から最新を常に算出し、キャッシュも更新する
  const latestRecord = findLatestRecordValues(data, exercise);
  if (latestRecord) {
    if (!data.lastCounts) data.lastCounts = {};
    data.lastCounts[exercise] = latestRecord;
    saveToStorage(data);
    return latestRecord;
  }

  // 古いデータ形式（数値のみ）の場合はセット数nullで返す
  if (typeof lastCounts === 'number') {
    return { count: lastCounts, sets: null, weight: null };
  }

  // 記録が無い場合のみ既存のキャッシュを返す
  return lastCounts || null;
}

/**
 * 記録から指定種目の最新値を取得する（lastCountsが無くても復元）
 * @param {Object} data - ストレージデータ
 * @param {string} exercise - 種目名
 * @returns {Object|null} {count, sets, weight} または null
 */
function findLatestRecordValues(data, exercise) {
  const records = data.trainingRecords || [];
  const latest = records
    .filter(record => record.exercise === exercise)
    .sort((a, b) => {
      // 日付を優先、同日の場合は更新日時/作成日時で降順
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      const aUpdated = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bUpdated = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bUpdated - aUpdated;
    })[0];

  if (!latest) return null;

  return {
    count: latest.count,
    sets: latest.sets || null,
    weight: latest.weight !== undefined ? latest.weight : null
  };
}

/**
 * 指定した種目の前回の回数、セット数、重さを保存する
 * @param {string} exercise - 種目名
 * @param {number} count - 回数
 * @param {number} sets - セット数
 * @param {number|null} weight - 重さ
 */
function saveLastCount(exercise, count, sets, weight = null) {
  const data = loadFromStorage();
  if (!data.lastCounts) data.lastCounts = {};
  data.lastCounts[exercise] = { count, sets, weight };
  saveToStorage(data);
}
