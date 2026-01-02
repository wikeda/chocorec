package dev.zebrafinch.chocorec.ui.main

enum class PeriodType {
    WEEK,
    MONTH
}

data class MainUiState(
    val periodType: PeriodType = PeriodType.WEEK,
    val totalLoad: Int = 0,
    val totalRecords: Int = 0,
    val chartDays: List<ChartDay> = emptyList(),
    val chartMaxTotal: Int = 0,
    val dates: List<String> = emptyList(),
    val exercises: List<String> = emptyList(),
    val counts: List<Int> = emptyList(),
    val sets: List<Int> = emptyList(),
    val weights: List<String> = emptyList(),
    val selectedDate: String = "",
    val selectedExercise: String = "",
    val selectedCount: Int = 0,
    val selectedSets: Int = 0,
    val selectedWeight: String = ""
)
