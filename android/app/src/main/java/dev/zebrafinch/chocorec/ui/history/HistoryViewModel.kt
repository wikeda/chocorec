package dev.zebrafinch.chocorec.ui.history

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.zebrafinch.chocorec.domain.repository.ExerciseRepository
import dev.zebrafinch.chocorec.domain.repository.TrainingRepository
import dev.zebrafinch.chocorec.util.CsvUtil
import dev.zebrafinch.chocorec.util.DateTimeUtil
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class HistoryViewModel(
    private val trainingRepository: TrainingRepository,
    private val exerciseRepository: ExerciseRepository,
    private val csvHeaders: List<String>
) : ViewModel() {
    private val _uiState = MutableStateFlow(HistoryUiState())
    val uiState: StateFlow<HistoryUiState> = _uiState

    init {
        loadHistory()
    }

    fun onSelectRecord(id: String) {
        _uiState.update { it.copy(selectedId = id) }
    }

    fun updateRecord(
        id: String,
        date: String,
        exerciseName: String,
        count: Int,
        sets: Int,
        weight: Float?
    ) {
        viewModelScope.launch {
            val existing = trainingRepository.getRecordById(id) ?: return@launch
            val updated = existing.copy(
                date = date,
                exerciseName = exerciseName,
                count = count,
                sets = sets,
                weight = weight,
                updatedAt = DateTimeUtil.nowIso()
            )
            trainingRepository.updateRecord(updated)
            loadHistory()
            _uiState.update { it.copy(selectedId = id) }
        }
    }

    fun deleteRecord(id: String) {
        viewModelScope.launch {
            trainingRepository.deleteRecord(id)
            loadHistory()
            _uiState.update { it.copy(selectedId = null) }
        }
    }

    suspend fun buildCsvContent(): String {
        val records = trainingRepository.getAllRecords()
        val rows = records.map { record ->
            listOf(
                CsvUtil.escape(record.date),
                CsvUtil.escape(record.exerciseName),
                CsvUtil.escape(record.count.toString()),
                CsvUtil.escape(record.sets.toString()),
                CsvUtil.escape(record.weight?.toString() ?: ""),
                CsvUtil.escape(DateTimeUtil.formatCsvDateTime(record.createdAt)),
                CsvUtil.escape(DateTimeUtil.formatCsvDateTime(record.updatedAt))
            ).joinToString(",")
        }

        return buildString {
            append(csvHeaders.joinToString(","))
            append("\n")
            rows.forEach { row ->
                append(row)
                append("\n")
            }
        }
    }

    fun csvFileName(): String {
        return "ChocoRec_export_${DateTimeUtil.todayForFilename()}.csv"
    }

    private fun loadHistory() {
        viewModelScope.launch {
            val exercises = exerciseRepository.getActiveExercises()
            val colors = exercises.associate { it.name to it.color }
            val records = trainingRepository.getAllRecords()
            val grouped = records.groupBy { it.date }
                .toSortedMap(compareByDescending { it })
                .map { (date, list) ->
                    val rows = list.map {
                        HistoryRecordRow(
                            id = it.id,
                            date = it.date,
                            exerciseName = it.exerciseName,
                            count = it.count,
                            sets = it.sets,
                            weight = it.weight,
                            color = colors[it.exerciseName] ?: "#6b7280"
                        )
                    }
                    HistoryDateGroup(date = date, records = rows)
                }

            _uiState.update {
                it.copy(
                    groups = grouped,
                    exercises = exercises.map { it.name }
                )
            }
        }
    }
}
