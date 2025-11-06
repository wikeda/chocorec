/**
 * グラフ描画ロジック
 * Chart.jsを使用して睡眠記録の積層グラフを表示する
 */

let sleepChart = null;

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
  
  // レコードを集計
  records.forEach(record => {
    const recordDate = new Date(record.startDateTime);
    const dateKey = formatDate(recordDate);
    
    if (aggregated[dateKey]) {
      const totalMinutes = record.sleepDuration.hours * 60 + record.sleepDuration.minutes;
      aggregated[dateKey][record.sleepType] += totalMinutes;
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
  const chartData = {
    labels: data.map(d => formatDisplayDate(d.date)),
    datasets: [
      {
        label: '夜の睡眠',
        data: data.map(d => d.night / 60), // 時間に変換
        backgroundColor: '#1e3a8a',
        stack: 'sleep'
      },
      {
        label: '昼の睡眠',
        data: data.map(d => d.day / 60), // 時間に変換
        backgroundColor: '#ea580c',
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
          title: {
            display: true,
            text: '睡眠時間（時間）'
          },
          ticks: {
            stepSize: 1
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
  
  sleepChart = new Chart(canvas, config);
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
  weekStart.setDate(weekStart.getDate() - 6); // 過去7日間
  
  const aggregatedData = aggregateDailySleep(records, weekStart, 7);
  createChart(canvas, aggregatedData, 'week');
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
  monthStart.setDate(monthStart.getDate() - 29); // 過去30日間
  
  const aggregatedData = aggregateDailySleep(records, monthStart, 30);
  createChart(canvas, aggregatedData, 'month');
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
 * タブ切り替えイベントを設定する
 */
function setupChartTabs() {
  const weekTab = document.getElementById('week-tab');
  const monthTab = document.getElementById('month-tab');
  
  if (weekTab) {
    weekTab.addEventListener('click', function() {
      weekTab.classList.add('active');
      monthTab.classList.remove('active');
      updateWeekChart();
    });
  }
  
  if (monthTab) {
    monthTab.addEventListener('click', function() {
      monthTab.classList.add('active');
      weekTab.classList.remove('active');
      updateMonthChart();
    });
  }
}

