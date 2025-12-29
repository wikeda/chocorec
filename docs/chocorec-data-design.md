# ちょこRec データアクセス設計

## 1. Room スキーマ

### 1.1 training_records
- id: String (UUID, PK)
- date: String (YYYY-MM-DD)
- exercise_name: String
- count: Int
- sets: Int
- weight: Float? (null可)
- created_at: String (ISO)
- updated_at: String (ISO)

### 1.2 exercises
- id: String (UUID, PK)
- name: String (ユニーク)
- color: String (#RRGGBB)
- order: Int
- is_active: Boolean
- created_at: String (ISO)
- updated_at: String (ISO)

## 2. DAO 方針

### 2.1 TrainingRecordDao
- insert(record)
- update(record)
- deleteById(id)
- getById(id)
- getAll()
- getByDateRange(startDate, endDate)
- getByExercise(name)
- getLatestByExercise(name)  // 前回値自動補完用

### 2.2 ExerciseDao
- insert(exercise)
- update(exercise)
- getAll()
- getActiveOrdered()         // is_active=true を order順
- getById(id)
- getByName(name)
- softDelete(id)
- swapOrder(idA, idB)

## 3. 集計ロジック

### 3.1 週次/ 月次
- 指定期間の records を取得
- 日付ごとに集計
- 負荷 = count * sets * weight
  - weight == null の場合は 1 として計算
- 種目ごとの積層データを作成

### 3.2 合計負荷 / 記録回数
- 合計負荷: 期間内の全レコードの負荷合計
- 記録回数: 期間内のレコード件数

## 4. CSV エクスポート
- 取得: 全 training_records
- 列: 日付, 種目, 回数, セット数, 重さ(kg), 作成日時, 更新日時
- UTF-8 BOM 付き
- 出力先: Storage Access Framework

## 5. 種目名変更の伝播
- Exercise 更新時に旧名→新名で training_records を一括更新
- 更新対象: exercise_name

## 6. 初期データ
- 初回起動時に9種目を insert
- 既存の種目順序・色を踏襲

## 7. 取得フォーマット
- date: String (YYYY-MM-DD)
- created_at / updated_at: ISO

