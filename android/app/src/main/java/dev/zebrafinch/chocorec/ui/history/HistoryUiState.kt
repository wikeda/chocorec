package dev.zebrafinch.chocorec.ui.history

data class HistoryRecordRow(
    val id: String,
    val date: String,
    val exerciseName: String,
    val count: Int,
    val sets: Int,
    val weight: Float?,
    val color: String
)

data class HistoryDateGroup(
    val date: String,
    val records: List<HistoryRecordRow>
)

data class HistoryUiState(
    val groups: List<HistoryDateGroup> = emptyList(),
    val exercises: List<String> = emptyList(),
    val selectedId: String? = null
)
