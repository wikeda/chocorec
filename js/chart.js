/**
 * グラフ描画ロジック
 * Chart.jsを使用して睡眠記録の積層グラフを表示する
 */

let sleepChart = null;
let currentWeekOffset = 0; // 週のオフセット（0=今週、-1=先週、1=来週）
let currentMonthOffset = 0; // 月のオフセット（0=今月、-1=先月、1=来月）

/**
 * 日別の睡眠データを集計する
 * @param {Array} records - 睡眠記録の配列
 * @param {Date} startDate - 開始日
 * @param {number} days - 集計日数
 * @returns {Array} 集計されたデータ配列
 */
function aggregateDailySleep(records, startDate, days) {
  const aggregated = {};

  // 日付ごとの初期化
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = formatDate(date);
    aggregated[dateKey] = {
      date: dateKey,
      night: 0,  // 分単位
      day: 0     // 分単位
    };
  }

  // レコードを集計（日付をまたぐ睡眠時間を分割）
  records.forEach(record => {
    const sleepStart = new Date(record.startDateTime);
    const totalMinutes = record.sleepDuration.hours * 60 + record.sleepDuration.minutes;
    const sleepEnd = new Date(sleepStart.getTime() + totalMinutes * 60 * 1000);

    // 睡眠開始日から終了日まで、日ごとに分割して集計
    let currentDate = new Date(sleepStart);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate < sleepEnd) {
      const dateKey = formatDate(currentDate);

      if (aggregated[dateKey]) {
        // この日の開始時刻と終了時刻を計算
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        // この日における実際の睡眠開始・終了時刻
        const actualStart = sleepStart > dayStart ? sleepStart : dayStart;
        const actualEnd = sleepEnd < dayEnd ? sleepEnd : dayEnd;

        // この日の睡眠時間（分）
        const minutesThisDay = Math.round((actualEnd - actualStart) / (60 * 1000));

        if (minutesThisDay > 0) {
          // 睡眠の種類を判定（開始時刻で判定）
          aggregated[dateKey][record.sleepType] += minutesThisDay;
        }
      }

      // 次の日へ
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return Object.values(aggregated);
}

/**
 * 日付を表示用にフォーマットする（M/D形式）
 * @param {string} dateStr - 日付文字列（YYYY-MM-DD）
 * @returns {string} フォーマットされた文字列
 */
function formatDisplayDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

/**
 * Chart.jsを使用してグラフを作成・更新する
 * @param {HTMLCanvasElement} canvas - キャンバス要素
 * @param {Array} data - 集計済みデータ
 * @param {string} periodType - 期間タイプ（'week' | 'month'）
 */
function createChart(canvas, data, periodType) {
  // Chart.jsが読み込まれているか確認
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded');
    return;
  }
  
  const chartData = {
    labels: data.map(d => formatDisplayDate(d.date)),
    datasets: [
      {
        label: '夜の睡眠',
        data: data.map(d => d.night / 60), // 時間に変換
        backgroundColor: '#3b82f6', // 明るい青
        stack: 'sleep'
      },
      {
        label: '昼の睡眠',
        data: data.map(d => d.day / 60), // 時間に変換
        backgroundColor: '#fb923c', // 明るいオレンジ
        stack: 'sleep'
      }
    ]
  };
  
  const config = {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: 24, // 24時間固定
          title: {
            display: true,
            text: '睡眠時間（時間）'
          },
          ticks: {
            stepSize: 2
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const hours = Math.floor(context.raw);
              const minutes = Math.round((context.raw - hours) * 60);
              return `${context.dataset.label}: ${hours}時間${minutes}分`;
            }
          }
        }
      }
    }
  };
  
  // 既存のグラフを破棄
  if (sleepChart) {
    sleepChart.destroy();
  }
  
  try {
    sleepChart = new Chart(canvas, config);
  } catch (error) {
    console.error('Failed to create chart:', error);
  }
}

/**
 * 週次グラフを更新する
 */
function updateWeekChart() {
  const canvas = document.getElementById('sleep-chart');
  if (!canvas) return;
  
  const records = getAllRecords();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  // オフセットに応じて週を移動
  weekStart.setDate(weekStart.getDate() - 6 + (currentWeekOffset * 7)); // 過去7日間
  
  const aggregatedData = aggregateDailySleep(records, weekStart, 7);
  createChart(canvas, aggregatedData, 'week');
  
  // 週の表示ラベルを更新
  updateWeekLabel();
  updateNavButtons();
}

/**
 * 月次グラフを更新する
 */
function updateMonthChart() {
  const canvas = document.getElementById('sleep-chart');
  if (!canvas) return;
  
  const records = getAllRecords();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today);
  // オフセットに応じて月を移動
  monthStart.setDate(monthStart.getDate() - 29 + (currentMonthOffset * 30)); // 過去30日間
  
  const aggregatedData = aggregateDailySleep(records, monthStart, 30);
  createChart(canvas, aggregatedData, 'month');
  
  // 月の表示ラベルを更新
  updateMonthLabel();
  updateNavButtons();
}

/**
 * 現在選択されている期間に応じてグラフを更新する
 */
function updateChart() {
  const weekTab = document.getElementById('week-tab');
  const monthTab = document.getElementById('month-tab');
  
  if (weekTab && weekTab.classList.contains('active')) {
    updateWeekChart();
  } else if (monthTab && monthTab.classList.contains('active')) {
    updateMonthChart();
  }
}

/**
 * 週の表示ラベルを更新する
 */
function updateWeekLabel() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6 + (currentWeekOffset * 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const label = getWeekLabel(currentWeekOffset);
  const weekLabel = document.getElementById('week-label');
  if (weekLabel) {
    weekLabel.textContent = label;
  }
}

/**
 * 月の表示ラベルを更新する
 */
function updateMonthLabel() {
  const label = getMonthLabel(currentMonthOffset);
  const monthLabel = document.getElementById('month-label');
  if (monthLabel) {
    monthLabel.textContent = label;
  }
}

/**
 * 週のラベルを取得する
 * @param {number} offset - 週のオフセット
 * @returns {string} ラベル文字列
 */
function getWeekLabel(offset) {
  if (offset === 0) {
    return '今週';
  } else if (offset === -1) {
    return '先週';
  } else if (offset === -2) {
    return '2週間前';
  } else if (offset < 0) {
    return `${Math.abs(offset)}週間前`;
  } else {
    // 未来への移動は無効化されているので、通常は表示されない
    return '今週';
  }
}

/**
 * 月のラベルを取得する
 * @param {number} offset - 月のオフセット
 * @returns {string} ラベル文字列
 */
function getMonthLabel(offset) {
  if (offset === 0) {
    return '今月';
  } else if (offset === -1) {
    return '先月';
  } else if (offset === -2) {
    return '2ヶ月前';
  } else if (offset < 0) {
    return `${Math.abs(offset)}ヶ月前`;
  } else {
    // 未来への移動は無効化されているので、通常は表示されない
    return '今月';
  }
}

/**
 * 週を前に移動する
 */
function moveWeekBackward() {
  currentWeekOffset--;
  updateWeekChart();
  updateNavButtons();
  // コントロールの表示を維持（週次コントロールを表示）
  const weekControls = document.querySelectorAll('#week-prev-btn, #week-label');
  const monthControls = document.querySelectorAll('#month-prev-btn, #month-label');
  weekControls.forEach(ctrl => ctrl.classList.remove('hidden'));
  monthControls.forEach(ctrl => ctrl.classList.add('hidden'));
}

/**
 * 週を後に移動する（無効化：未来の睡眠は記録しない）
 */
function moveWeekForward() {
  // 未来への移動は無効化
  return;
}

/**
 * 週をリセットする（今週に戻す）
 */
function resetWeek() {
  currentWeekOffset = 0;
  updateWeekChart();
  updateNavButtons();
}

/**
 * 月を前に移動する
 */
function moveMonthBackward() {
  currentMonthOffset--;
  updateMonthChart();
  updateNavButtons();
  // コントロールの表示を維持（月次コントロールを表示）
  const weekControls = document.querySelectorAll('#week-prev-btn, #week-label');
  const monthControls = document.querySelectorAll('#month-prev-btn, #month-label');
  weekControls.forEach(ctrl => ctrl.classList.add('hidden'));
  monthControls.forEach(ctrl => ctrl.classList.remove('hidden'));
}

/**
 * 月を後に移動する（無効化：未来の睡眠は記録しない）
 */
function moveMonthForward() {
  // 未来への移動は無効化
  return;
}

/**
 * 月をリセットする（今月に戻す）
 */
function resetMonth() {
  currentMonthOffset = 0;
  updateMonthChart();
  updateNavButtons();
}

/**
 * ナビゲーションボタンの状態を更新する
 */
function updateNavButtons() {
  // 週のナビゲーションボタン（未来への移動は無効化されているので、常に有効）
  const weekPrevBtn = document.getElementById('week-prev-btn');
  if (weekPrevBtn) {
    weekPrevBtn.disabled = false;
  }
  
  // 月のナビゲーションボタン（未来への移動は無効化されているので、常に有効）
  const monthPrevBtn = document.getElementById('month-prev-btn');
  if (monthPrevBtn) {
    monthPrevBtn.disabled = false;
  }
}

/**
 * タブ切り替えイベントを設定する
 */
function setupChartTabs() {
  const weekTab = document.getElementById('week-tab');
  const monthTab = document.getElementById('month-tab');
  
  if (weekTab) {
    weekTab.addEventListener('click', function() {
      weekTab.classList.add('active');
      if (monthTab) monthTab.classList.remove('active');
      // 週のオフセットをリセット（タブ切り替え時のみ）
      currentWeekOffset = 0;
      updateWeekChart();
      updateNavButtons();
      // コントロールの表示を切り替え
      if (typeof setupChartControls === 'function') {
        const weekControls = document.querySelectorAll('#week-prev-btn, #week-label');
        const monthControls = document.querySelectorAll('#month-prev-btn, #month-label');
        weekControls.forEach(ctrl => ctrl.classList.remove('hidden'));
        monthControls.forEach(ctrl => ctrl.classList.add('hidden'));
      }
    });
  }
  
  if (monthTab) {
    monthTab.addEventListener('click', function() {
      monthTab.classList.add('active');
      if (weekTab) weekTab.classList.remove('active');
      // 月のオフセットをリセット（タブ切り替え時のみ）
      currentMonthOffset = 0;
      updateMonthChart();
      updateNavButtons();
      // コントロールの表示を切り替え
      if (typeof setupChartControls === 'function') {
        const weekControls = document.querySelectorAll('#week-prev-btn, #week-label');
        const monthControls = document.querySelectorAll('#month-prev-btn, #month-label');
        weekControls.forEach(ctrl => ctrl.classList.add('hidden'));
        monthControls.forEach(ctrl => ctrl.classList.remove('hidden'));
      }
    });
  }
}

/**
 * グラフコントロールの表示切り替えを設定する
 */
function setupChartControls() {
  // 初期状態は週次を表示
  const weekControls = document.querySelectorAll('#week-prev-btn, #week-label');
  const monthControls = document.querySelectorAll('#month-prev-btn, #month-label');
  if (weekControls.length > 0 && monthControls.length > 0) {
    weekControls.forEach(ctrl => ctrl.classList.remove('hidden'));
    monthControls.forEach(ctrl => ctrl.classList.add('hidden'));
  }
  updateNavButtons();
}

