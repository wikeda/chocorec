/**
 * グラフ描画ロジック
 * Chart.jsを使用してトレーニング記録の積層グラフを表示する
 */

let trainingChart = null;
let currentWeekOffset = 0; // 週のオフセット（0=今週、-1=先週、1=来週）
let currentMonthOffset = 0; // 月のオフセット（0=今月、-1=先月、1=来月）

/**
 * 日別のトレーニングデータを集計する
 * @param {Array} records - トレーニング記録の配列
 * @param {Date} startDate - 開始日
 * @param {number} days - 集計日数
 * @returns {Array} 集計されたデータ配列
 */
function aggregateDailyTraining(records, startDate, days) {
  const aggregated = {};

  // 日付ごとの初期化
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = formatDate(date); // YYYY-MM-DD

    aggregated[dateKey] = {
      date: dateKey,
      total: 0
    };

    // 各種目の初期化
    EXERCISES.forEach(ex => {
      aggregated[dateKey][ex] = 0;
    });
  }

  // レコードを集計
  records.forEach(record => {
    const dateKey = record.date;
    if (aggregated[dateKey]) {
      if (aggregated[dateKey][record.exercise] !== undefined) {
        const sets = record.sets || 3; // デフォルト3セット
        const load = record.count * sets;
        aggregated[dateKey][record.exercise] += load;
        aggregated[dateKey].total += load;
      }
    }
  });

  return Object.values(aggregated);
}

/**
 * 日付をフォーマットする（YYYY-MM-DD）
 * ui.jsにもあるが、依存関係を避けるためここでも定義（あるいはui.jsのを使う）
 * ここでは独立して定義しておく
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

  // データセットの作成
  const datasets = EXERCISES.map(exercise => {
    return {
      label: exercise,
      data: data.map(d => d[exercise]),
      backgroundColor: EXERCISE_COLORS[exercise] || '#cbd5e1',
      stack: 'training'
    };
  });

  const chartData = {
    labels: data.map(d => formatDisplayDate(d.date)),
    datasets: datasets
  };

  const config = {
    type: 'bar',
    data: chartData,
    options: {
      indexAxis: 'y', // 横棒グラフにする
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: '総負荷 (回数 × セット数)'
          },
          ticks: {
            stepSize: 10
          }
        },
        y: {
          stacked: true,
          grid: {
            display: false
          },
          ticks: {
            color: function (context) {
              // ラベルのインデックスから元の日付データを取得
              const index = context.index;
              if (index >= 0 && index < data.length) {
                const dateStr = data[index].date; // YYYY-MM-DD形式
                const date = new Date(dateStr + 'T00:00:00');
                const dayOfWeek = date.getDay(); // 0=日曜日, 6=土曜日

                if (dayOfWeek === 0) {
                  return '#ef4444'; // 日曜日: 赤
                } else if (dayOfWeek === 6) {
                  return '#3b82f6'; // 土曜日: 青
                }
              }
              return '#666666'; // 平日: グレー
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            boxWidth: 8
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              if (value === 0) return ''; // 0の場合は表示しない
              return `${context.dataset.label}: ${value}`;
            }
          }
        }
      }
    }
  };

  // 既存のグラフを破棄
  if (trainingChart) {
    trainingChart.destroy();
  }

  try {
    trainingChart = new Chart(canvas, config);
  } catch (error) {
    console.error('Failed to create chart:', error);
  }
}

/**
 * 週次グラフを更新する
 */
function updateWeekChart() {
  const canvas = document.getElementById('training-chart');
  if (!canvas) return;

  const records = getAllRecords();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 今週の月曜日を計算 (0=日, 1=月...6=土)
  // 日曜(0)の場合は-6して前の月曜にする、それ以外は1引いて調整
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() + diffToMonday);

  // オフセット適用
  const targetMonday = new Date(currentWeekMonday);
  targetMonday.setDate(targetMonday.getDate() + (currentWeekOffset * 7));

  const aggregatedData = aggregateDailyTraining(records, targetMonday, 7);

  // 週次グラフは高さ固定（スクロールなし）
  const chartContainer = canvas.parentElement;
  chartContainer.style.height = '400px'; // デフォルトの高さ

  createChart(canvas, aggregatedData, 'week');

  // 週の表示ラベルを更新
  updateWeekLabel();
  updateNavButtons();
}

/**
 * 月次グラフを更新する
 */
function updateMonthChart() {
  const canvas = document.getElementById('training-chart');
  if (!canvas) return;

  const records = getAllRecords();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 今月の1日を計算
  const currentMonthFirstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  // オフセット適用
  const targetMonthFirstDay = new Date(currentMonthFirstDay);
  targetMonthFirstDay.setMonth(targetMonthFirstDay.getMonth() + currentMonthOffset);

  // 月の日数を取得
  const year = targetMonthFirstDay.getFullYear();
  const month = targetMonthFirstDay.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const aggregatedData = aggregateDailyTraining(records, targetMonthFirstDay, daysInMonth);

  // 月次グラフは日数に応じて高さを調整（スクロール対応）
  // 1日あたり30px + マージン等
  const chartHeight = Math.max(400, daysInMonth * 30);
  const chartContainer = canvas.parentElement;
  chartContainer.style.height = `${chartHeight}px`;

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
  // コントロールの表示を維持
  const weekControls = document.querySelectorAll('#week-prev-btn, #week-label');
  const monthControls = document.querySelectorAll('#month-prev-btn, #month-label');
  weekControls.forEach(ctrl => ctrl.classList.remove('hidden'));
  monthControls.forEach(ctrl => ctrl.classList.add('hidden'));
}

/**
 * 週を後に移動する（無効化）
 */
function moveWeekForward() {
  return;
}

/**
 * 月を前に移動する
 */
function moveMonthBackward() {
  currentMonthOffset--;
  updateMonthChart();
  updateNavButtons();
  // コントロールの表示を維持
  const weekControls = document.querySelectorAll('#week-prev-btn, #week-label');
  const monthControls = document.querySelectorAll('#month-prev-btn, #month-label');
  weekControls.forEach(ctrl => ctrl.classList.add('hidden'));
  monthControls.forEach(ctrl => ctrl.classList.remove('hidden'));
}

/**
 * 月を後に移動する（無効化）
 */
function moveMonthForward() {
  return;
}

/**
 * ナビゲーションボタンの状態を更新する
 */
function updateNavButtons() {
  const weekPrevBtn = document.getElementById('week-prev-btn');
  if (weekPrevBtn) {
    weekPrevBtn.disabled = false;
  }

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
    weekTab.addEventListener('click', function () {
      weekTab.classList.add('active');
      if (monthTab) monthTab.classList.remove('active');
      currentWeekOffset = 0;
      updateWeekChart();
      updateNavButtons();
      if (typeof setupChartControls === 'function') {
        const weekControls = document.querySelectorAll('#week-prev-btn, #week-label');
        const monthControls = document.querySelectorAll('#month-prev-btn, #month-label');
        weekControls.forEach(ctrl => ctrl.classList.remove('hidden'));
        monthControls.forEach(ctrl => ctrl.classList.add('hidden'));
      }
    });
  }

  if (monthTab) {
    monthTab.addEventListener('click', function () {
      monthTab.classList.add('active');
      if (weekTab) weekTab.classList.remove('active');
      currentMonthOffset = 0;
      updateMonthChart();
      updateNavButtons();
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
  const weekControls = document.querySelectorAll('#week-prev-btn, #week-label');
  const monthControls = document.querySelectorAll('#month-prev-btn, #month-label');
  if (weekControls.length > 0 && monthControls.length > 0) {
    weekControls.forEach(ctrl => ctrl.classList.remove('hidden'));
    monthControls.forEach(ctrl => ctrl.classList.add('hidden'));
  }
  updateNavButtons();
}

