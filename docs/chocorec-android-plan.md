# ちょこRec Android実装方針

## 1. プロジェクト構成（案）
- app/
  - data/
    - db/ (Room)
      - AppDatabase
      - TrainingRecordEntity
      - ExerciseEntity
      - TrainingRecordDao
      - ExerciseDao
    - repository/
      - TrainingRepository
      - ExerciseRepository
    - mapper/
  - domain/
    - model/ (TrainingRecord, Exercise)
    - usecase/ (AddRecord, UpdateRecord, GetWeeklySummary など)
  - ui/
    - main/
    - history/
    - exercises/
    - components/
  - widget/
    - ChocoRecWidget
  - util/

## 2. 画面構成（Compose）
- MainScreen
  - PeriodTabs (週次/月次)
  - SummaryCard (合計負荷・記録回数)
  - StackedBarChart
  - RecordForm (ボトム固定)
- HistoryScreen
  - DateGroupedList
  - EditBottomSheet
  - CSVExportButton
- ExercisesScreen
  - ExerciseList
  - EditBottomSheet

## 3. 状態管理
- ViewModel + StateFlow
- 画面ごとにStateを定義
  - MainUiState: 期間, サマリ, グラフ, フォーム値
  - HistoryUiState: 日付グループ, 選択ID, 編集フォーム
  - ExercisesUiState: 種目一覧, 編集フォーム

## 4. CSV出力
- Storage Access Framework
- 保存完了トースト表示

## 5. ウィジェット
- 中サイズのみ
- 週次集計の合計負荷 + 記録回数表示
- タップでMainScreenのフォームへ遷移

## 6. 主要クラス（予定）
- MainViewModel
- HistoryViewModel
- ExercisesViewModel
- ChocoRecWidgetReceiver

