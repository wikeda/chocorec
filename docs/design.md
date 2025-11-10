# RecSleep 設計書

## 1. 概要

### 1.1 目的
本設計書は、`docs/requirements.md`で定義されたRecSleepアプリケーションの技術設計を記載する。要件定義書に基づき、実装可能な設計を具体的に定義する。

### 1.2 設計方針
- シンプルで保守性の高いコード構造
- モバイルファーストのUX設計
- ローカルストレージベースの軽量実装
- 段階的な実装アプローチ

## 2. 技術スタック

### 2.1 使用技術
- **言語**: HTML5 / CSS3 / JavaScript (ES6+)
- **ビルドツール**: なし（Vanilla JavaScript）
- **グラフライブラリ**: Chart.js（軽量版）
- **データ保存**: LocalStorage API
- **ホスティング**: GitHub Pages

### 2.2 依存ライブラリ
- Chart.js（CDN経由）
  - 用途：積層グラフの描画
  - バージョン：最新の安定版（軽量版を優先）

## 3. アーキテクチャ設計

### 3.1 全体アーキテクチャ
```
┌─────────────────────────────────┐
│         Presentation Layer      │
│  (HTML/CSS/UI Components)        │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Application Layer           │
│  (JavaScript: app.js, ui.js)     │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Business Logic Layer        │
│  (data.js, validator.js)         │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Storage Layer               │
│  (LocalStorage API)              │
└─────────────────────────────────┘
```

### 3.2 ディレクトリ構成
```
RecSleep/
├── index.html              # メインHTMLファイル
├── history.html            # 過去記録一覧画面
├── css/
│   ├── style.css           # 基本スタイル
│   └── components.css      # UIコンポーネントスタイル
├── js/
│   ├── app.js              # アプリケーションエントリーポイント
│   ├── data.js             # データ管理（LocalStorage操作）
│   ├── validator.js        # バリデーションロジック
│   ├── sleepType.js        # 睡眠種類判定ロジック
│   ├── chart.js            # グラフ描画ロジック
│   ├── export.js           # CSVエクスポート機能
│   └── ui.js               # UI制御ロジック
├── docs/
│   ├── requirements.md     # 要件定義書
│   └── design.md           # 本設計書
└── README.md               # プロジェクト説明
```

## 4. データモデル設計

### 4.1 データ構造定義

#### 4.1.1 SleepRecord（睡眠記録）
```javascript
{
  id: string,                  // 一意のID（UUID v4を使用）
  startDateTime: string,        // ISO形式の日時文字列
  sleepDuration: {
    hours: number,              // 時間（0-23）
    minutes: number             // 分（0-55、5分単位）
  },
  sleepType: 'night' | 'day',   // 睡眠の種類
  createdAt: string,            // 作成日時（ISO形式）
  updatedAt: string             // 更新日時（ISO形式）
}
```

#### 4.1.2 StorageData（ローカルストレージ全体）
```javascript
{
  sleepRecords: SleepRecord[],
  version: string               // データスキーマのバージョン
}
```

### 4.2 データ操作API設計

#### 4.2.1 data.js の関数設計
```javascript
// データ取得
function getAllRecords(): SleepRecord[]
function getRecordsByDateRange(startDate: Date, endDate: Date): SleepRecord[]
function getRecordsByDate(date: Date): SleepRecord[]
function getRecordById(id: string): SleepRecord | null

// データ追加・更新
function addRecord(record: Omit<SleepRecord, 'id' | 'createdAt' | 'updatedAt'>): SleepRecord
function updateRecord(id: string, record: Partial<SleepRecord>): SleepRecord | null

// データ削除（将来拡張用）
function deleteRecord(id: string): boolean

// ストレージ操作
function saveToStorage(data: StorageData): void
function loadFromStorage(): StorageData
function clearStorage(): void
```

### 4.3 睡眠種類判定ロジック

#### 4.3.1 sleepType.js の実装
```javascript
/**
 * 睡眠開始時刻から睡眠の種類を判定
 * @param {Date} startDateTime - 睡眠開始日時
 * @returns {'night' | 'day'} - 睡眠の種類
 */
function determineSleepType(startDateTime: Date): 'night' | 'day' {
  const hour = startDateTime.getHours();
  // 22時以降から07時まで：夜の睡眠
  if (hour >= 22 || hour < 7) {
    return 'night';
  }
  // それ以外：昼の睡眠
  return 'day';
}
```

## 5. UIコンポーネント設計

### 5.1 メイン画面（index.html）

#### 5.1.1 レイアウト構造
```html
<body>
  <header class="header">
    <h1>RecSleep</h1>
    <button id="download-btn" class="btn-download">CSV出力</button>
  </header>
  
  <main class="main">
    <!-- グラフセクション -->
    <section class="chart-section">
      <div class="chart-tabs">
        <button id="week-tab" class="tab active">週次</button>
        <button id="month-tab" class="tab">月次</button>
      </div>
      <canvas id="sleep-chart"></canvas>
    </section>
    
    <!-- 昨日・今日の記録表 -->
    <section class="recent-records">
      <h2>今日・昨日の記録</h2>
      <table id="recent-table" class="records-table">
        <!-- 動的に生成 -->
      </table>
      <a href="history.html" class="link-history">過去記録一覧</a>
    </section>
    
    <!-- 入力フォーム -->
    <section class="input-form">
      <form id="sleep-form">
        <div class="form-row">
          <select id="date-select" name="date" required>
            <!-- 過去7日を動的に生成 -->
          </select>
          <select id="hour-select" name="hour" required>
            <!-- 00-23を動的に生成 -->
          </select>
          <span>:</span>
          <select id="minute-select" name="minute" required>
            <!-- 00-55を5分刻みで生成 -->
          </select>
          <select id="duration-hour-select" name="durationHour" required>
            <!-- 00-23を動的に生成 -->
          </select>
          <span>:</span>
          <select id="duration-minute-select" name="durationMinute" required>
            <!-- 00-55を5分刻みで生成 -->
          </select>
          <button type="submit" class="btn-submit">記録する</button>
        </div>
      </form>
    </section>
  </main>
</body>
```

#### 5.1.2 CSS設計方針
- モバイルファーストのレスポンシブデザイン
- 縦スクロールを前提としたレイアウト
- タッチ操作を考慮したボタンサイズ（最小44x44px）
- カラーパレット：
  - 夜の睡眠：濃い青（#1e3a8a、#2563eb）
  - 昼の睡眠：オレンジ（#ea580c、#fb923c）
  - 背景：白（#ffffff）
  - テキスト：ダークグレー（#1f2937）

### 5.2 過去記録一覧画面（history.html）

#### 5.2.1 レイアウト構造
```html
<body>
  <header class="header">
    <button id="back-btn" class="btn-back">← 戻る</button>
    <h1>過去記録</h1>
  </header>
  
  <main class="main">
    <section class="history-section">
      <div id="history-list" class="history-list">
        <!-- 動的に生成 -->
      </div>
    </section>
    
    <!-- 編集モーダル -->
    <div id="edit-modal" class="modal hidden">
      <div class="modal-content">
        <h2>記録を編集</h2>
        <form id="edit-form">
          <!-- 新規記録と同じフォーム構造 -->
          <div class="modal-actions">
            <button type="button" id="cancel-btn" class="btn-cancel">キャンセル</button>
            <button type="submit" class="btn-save">保存</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</body>
```

## 6. 機能詳細設計

### 6.1 睡眠記録機能

#### 6.1.1 新規記録のフロー
```
1. ユーザーがフォームに入力
   ├─ 日選択（過去7日）
   ├─ 時刻選択（時・分）
   └─ 睡眠時間選択（時・分）

2. 「記録する」ボタン押下

3. バリデーション実行
   ├─ 必須項目チェック
   └─ 値の妥当性チェック

4. 日時文字列の構築
   ├─ 選択された日付と時刻を結合
   └─ ISO形式に変換

5. 睡眠種類の判定
   ├─ sleepType.js を使用
   └─ 開始時刻から自動判定

6. レコード作成
   ├─ ID生成（UUID）
   ├─ createdAt, updatedAt 設定
   └─ SleepRecord オブジェクト生成

7. ローカルストレージへ保存
   ├─ 既存データを読み込み
   ├─ 新規レコードを追加
   └─ ストレージへ書き込み

8. UI更新
   ├─ グラフ再描画
   ├─ 昨日・今日の記録表更新
   └─ フォームリセット
```

#### 6.1.2 バリデーション設計
```javascript
// validator.js
function validateSleepRecord(formData) {
  const errors = [];
  
  // 必須項目チェック
  if (!formData.date) errors.push('日付を選択してください');
  if (formData.hour === null) errors.push('時刻を選択してください');
  if (formData.durationHour === null || formData.durationMinute === null) {
    errors.push('睡眠時間を選択してください');
  }
  
  // 睡眠時間の妥当性チェック
  if (formData.durationHour === 0 && formData.durationMinute === 0) {
    errors.push('睡眠時間は0分以上にしてください');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
```

### 6.2 グラフ表示機能

#### 6.2.1 データ集計ロジック（日付をまたぐ睡眠の分割対応）
```javascript
// chart.js
function aggregateDailySleep(records: SleepRecord[], startDate: Date, days: number) {
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
          aggregated[dateKey][record.sleepType] += minutesThisDay;
        }
      }

      // 次の日へ
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return Object.values(aggregated);
}
```

**重要な変更点**: 睡眠時間が日付をまたぐ場合、各日に分割して集計するように変更。例：11/6の22時から6時間睡眠 → 11/6に2時間 + 11/7に4時間

#### 6.2.2 Chart.js設定
```javascript
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
  
  return new Chart(canvas, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          title: { display: true, text: '睡眠時間（時間）' }
        }
      },
      plugins: {
        legend: { position: 'top' },
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
  });
}
```

### 6.3 CSVエクスポート機能

#### 6.3.1 エクスポート処理
```javascript
// export.js
function exportToCSV() {
  const records = getAllRecords();
  
  // CSVヘッダー
  const headers = [
    'ID',
    '開始日時',
    '睡眠時間(時間)',
    '睡眠時間(分)',
    '睡眠の種類',
    '作成日時',
    '更新日時'
  ];
  
  // CSVデータ行
  const rows = records.map(record => {
    const startDateTime = formatDateTime(new Date(record.startDateTime));
    const createdAt = formatDateTime(new Date(record.createdAt));
    const updatedAt = formatDateTime(new Date(record.updatedAt));
    
    return [
      record.id,
      startDateTime,
      record.sleepDuration.hours,
      record.sleepDuration.minutes,
      record.sleepType === 'night' ? '夜' : '昼',
      createdAt,
      updatedAt
    ];
  });
  
  // CSV文字列生成
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // BOM付きUTF-8でエンコード
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // ダウンロード
  const filename = `RecSleep_export_${formatDateForFilename(new Date())}.csv`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatDateForFilename(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
```

## 7. 実装フェーズ

### フェーズ1: 基礎実装
- [ ] HTML/CSSの基本構造作成
- [ ] ローカルストレージのデータ管理機能
- [ ] 睡眠種類判定ロジック
- [ ] 基本的なフォーム入力UI

### フェーズ2: 記録機能
- [ ] 新規記録の追加機能
- [ ] バリデーション機能
- [ ] 昨日・今日の記録表示
- [ ] フォームのリセット機能

### フェーズ3: グラフ表示
- [ ] Chart.jsの統合
- [ ] 週次グラフの実装
- [ ] 月次グラフの実装
- [ ] タブ切り替え機能

### フェーズ4: 過去記録機能
- [ ] 過去記録一覧画面の作成
- [ ] 記録の編集機能
- [ ] モーダルUIの実装
- [ ] 画面遷移の実装

### フェーズ5: エクスポート機能
- [ ] CSVエクスポート機能
- [ ] ダウンロードボタンの実装

### フェーズ6: 最終調整
- [ ] UI/UXの改善
- [ ] エラーハンドリングの強化
- [ ] モバイルブラウザでの動作確認
- [ ] パフォーマンス最適化

## 8. エラーハンドリング設計

### 8.1 エラーケース
- ローカルストレージへの保存失敗
- データの読み込み失敗
- 不正なデータ形式
- ブラウザのLocalStorage制限超過

### 8.2 エラー処理方針
```javascript
// data.js
function saveToStorage(data) {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem('recSleepData', json);
  } catch (error) {
    console.error('Failed to save data:', error);
    alert('データの保存に失敗しました。ブラウザの設定を確認してください。');
    throw error;
  }
}

function loadFromStorage() {
  try {
    const json = localStorage.getItem('recSleepData');
    if (!json) {
      return { sleepRecords: [], version: '1.0' };
    }
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to load data:', error);
    alert('データの読み込みに失敗しました。');
    return { sleepRecords: [], version: '1.0' };
  }
}
```

## 9. パフォーマンス考慮事項

### 9.1 最適化ポイント
- グラフの再描画は必要な時のみ実行
- 大量データの場合は仮想スクロールを検討
- LocalStorageの操作は最小限に抑制
- Chart.jsの描画は必要時のみ更新

### 9.2 データ量の見積もり
- 1レコードあたり約200バイト
- 365日 × 2回/日 = 730レコード/年
- 約146KB/年（テキストデータ）
- 5年分でも約730KB（余裕あり）

## 10. テスト戦略

### 10.1 単体テスト対象
- データ操作関数（data.js）
- バリデーション関数（validator.js）
- 睡眠種類判定関数（sleepType.js）
- CSVエクスポート関数（export.js）

### 10.2 統合テスト対象
- 記録追加から表示までのフロー
- 編集機能のフロー
- グラフの表示と切り替え
- CSVエクスポート

### 10.3 ブラウザテスト
- iOS Safari
- Android Chrome
- デスクトップブラウザ（開発用）

## 11. 将来拡張の考慮

### 11.1 データマイグレーション
- ストレージデータに`version`フィールドを保持
- バージョンアップ時の移行処理を実装可能に設計

### 11.2 拡張可能な設計
- データモデルに追加フィールドを容易に追加可能
- UIコンポーネントは再利用可能に設計
- 機能追加時も既存コードへの影響を最小化

---

**作成日**：2025年1月
**バージョン**：1.0
**状態**：設計完了



