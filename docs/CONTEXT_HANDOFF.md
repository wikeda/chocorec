# CONTEXT HANDOFF (ChocoRec)

- Repo: `C:\Users\wiked\Documents\github\chocorec` (push済). Android project under `chocorec/android`.
- App ID: `dev.zebrafinch.chocorec`, app name: ちょこRec. Android 10+.
- Data: Room DB (`training_records`, `exercises`) with repositories, mappers, seed defaults.
- Features implemented: main screen (Compose), history screen with edit sheet + CSV export (SAF + BOM), exercises screen (list/add/edit/delete/reorder) + icon buttons.
- Navigation: Compose NavHost routes main/history/exercises.
- Main graph: custom Canvas stacked bars + legend (FlowRow wrapping), summary numbers right-aligned.
- Default exercises match web: レッグプレス/チェストプレス/ラットプルダウン/アブベンチ/アブダクション/アダクション/ディップス/ショルダープレス/バイセップスカール.
- CSV columns: 日付, 種目, 回数, セット数, 重さ(kg), 作成日時, 更新日時; filename `ChocoRec_export_YYYYMMDD.csv`.
- UI ongoing: adjust form widths; avoid `Modifier.weight` (compiler issue) -> use `fillMaxWidth(fraction)`.
- Icons: main top actions (dumbbell/history), history top (back/download/edit), exercises top (back/add), reorder arrows use icons.
- Commit pushed: `3adfecb` “Add Android app scaffold and core features”.

Key files:
- `android/app/src/main/java/dev/zebrafinch/chocorec/ui/main/MainScreen.kt`
- `android/app/src/main/java/dev/zebrafinch/chocorec/ui/history/HistoryScreen.kt`
- `android/app/src/main/java/dev/zebrafinch/chocorec/ui/exercises/ExercisesScreen.kt`
- `android/app/src/main/java/dev/zebrafinch/chocorec/ui/main/MainViewModel.kt`
- `android/app/src/main/java/dev/zebrafinch/chocorec/data/db/*`
