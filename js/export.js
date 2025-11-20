/**
 * CSVエクスポート機能
 * トレーニング記録データをCSV形式でダウンロードする
 */

/**
 * 日時をフォーマットする（YYYY-MM-DD HH:MM:SS形式）
 * @param {Date} date - 日時オブジェクト
 * @returns {string} フォーマットされた文字列
 */
function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * ファイル名用の日付をフォーマットする（YYYYMMDD形式）
 * @param {Date} date - 日付オブジェクト
 * @returns {string} フォーマットされた文字列
 */
function formatDateForFilename(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * CSVに出力する値をエスケープする
 * @param {*} value - エスケープする値
 * @returns {string} エスケープされた文字列
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  // カンマ、ダブルクォート、改行を含む場合はダブルクォートで囲む
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }
  return stringValue;
}

/**
 * トレーニング記録をCSV形式でエクスポートする
 */
function exportToCSV() {
  const records = getAllRecords();

  // CSVヘッダー
  const headers = [
    '日付',
    '種目',
    '回数',
    'セット数',
    '作成日時',
    '更新日時'
  ];

  // CSVデータ行
  const rows = records.map(record => {
    const createdAt = formatDateTime(new Date(record.createdAt));
    const updatedAt = formatDateTime(new Date(record.updatedAt));

    return [
      escapeCSVValue(record.date),
      escapeCSVValue(record.exercise),
      escapeCSVValue(record.count),
      escapeCSVValue(record.sets || 1), // セット数がない古いデータは1とする
      escapeCSVValue(createdAt),
      escapeCSVValue(updatedAt)
    ];
  });

  // CSV文字列生成
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // BOM付きUTF-8でエンコード（Excel対応）
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  // ダウンロード
  const filename = `TrainingRec_export_${formatDateForFilename(new Date())}.csv`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}




