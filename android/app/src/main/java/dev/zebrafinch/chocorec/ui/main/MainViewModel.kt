package dev.zebrafinch.chocorec.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.zebrafinch.chocorec.domain.model.TrainingRecord
import dev.zebrafinch.chocorec.domain.repository.ExerciseRepository
import dev.zebrafinch.chocorec.domain.repository.TrainingRepository
import dev.zebrafinch.chocorec.util.DateTimeUtil
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.util.UUID
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class MainViewModel(
    private val trainingRepository: TrainingRepository,
    private val exerciseRepository: ExerciseRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState
    private var exerciseColors: Map<String, String> = emptyMap()
    private var allExerciseNames: List<String> = emptyList()

    init {
        loadInitial()
    }

    fun onPeriodChanged(periodType: PeriodType) {
        _uiState.update { it.copy(periodType = periodType, periodOffset = 0) }
        refreshSummary()
    }

    fun shiftPeriod(delta: Int) {
        val nextOffset = (_uiState.value.periodOffset + delta).coerceAtMost(0)
        if (nextOffset == _uiState.value.periodOffset) return
        _uiState.update { it.copy(periodOffset = nextOffset) }
        refreshSummary()
    }

    fun onDateSelected(value: String) {
        _uiState.update { it.copy(selectedDate = value) }
    }

    fun onExerciseSelected(value: String) {
        _uiState.update { it.copy(selectedExercise = value) }
        loadLastValues(value)
    }

    fun onCountSelected(value: Int) {
        _uiState.update { it.copy(selectedCount = value) }
    }

    fun onSetsSelected(value: Int) {
        _uiState.update { it.copy(selectedSets = value) }
    }

    fun onWeightSelected(value: String) {
        _uiState.update { it.copy(selectedWeight = value) }
    }

    fun onRecord() {
        val state = _uiState.value
        if (state.selectedDate.isBlank() || state.selectedExercise.isBlank()) return

        val weight = parseWeight(state.selectedWeight)
        val record = TrainingRecord(
            id = UUID.randomUUID().toString(),
            date = state.selectedDate,
            exerciseName = state.selectedExercise,
            count = state.selectedCount,
            sets = state.selectedSets,
            weight = weight,
            createdAt = DateTimeUtil.nowIso(),
            updatedAt = DateTimeUtil.nowIso()
        )

        viewModelScope.launch {
            trainingRepository.addRecord(record)
            refreshSummary()
            selectNextExercise()
        }
    }

    fun refreshAll() {
        viewModelScope.launch {
            val allExercises = exerciseRepository.getAllExercises()
            allExerciseNames = allExercises.map { it.name }
            exerciseColors = allExercises.associate { it.name to it.color }

            val exercises = exerciseRepository.getActiveExercises().map { it.name }
            val selected = _uiState.value.selectedExercise
            val nextSelected = if (selected in exercises) selected else exercises.firstOrNull().orEmpty()
            _uiState.update { it.copy(exercises = exercises, selectedExercise = nextSelected) }
            refreshSummary()
        }
    }

    private fun loadInitial() {
        viewModelScope.launch {
            val allExercises = exerciseRepository.getAllExercises()
            allExerciseNames = allExercises.map { it.name }
            exerciseColors = allExercises.associate { it.name to it.color }

            val exercises = exerciseRepository.getActiveExercises().map { it.name }
            val dates = recentDates()
            val counts = (1..50).toList()
            val sets = (1..10).toList()
            val weights = weightOptions()

            val selectedDate = dates.firstOrNull().orEmpty()
            val selectedExercise = exercises.firstOrNull().orEmpty()
            val selectedCount = 10
            val selectedSets = 3
            val selectedWeight = "20"

            _uiState.update {
                it.copy(
                    dates = dates,
                    exercises = exercises,
                    counts = counts,
                    sets = sets,
                    weights = weights,
                    selectedDate = selectedDate,
                    selectedExercise = selectedExercise,
                    selectedCount = selectedCount,
                    selectedSets = selectedSets,
                    selectedWeight = selectedWeight
                )
            }

            if (selectedExercise.isNotBlank()) {
                loadLastValues(selectedExercise)
            }

            refreshSummary()
        }
    }

    private fun refreshSummary() {
        viewModelScope.launch {
            val range = dateRange(_uiState.value.periodType, _uiState.value.periodOffset)
            val records = trainingRepository.getRecordsByDateRange(range.first, range.second)
            val totalLoad = records.sumOf { record ->
                val weight = record.weight ?: 1f
                (record.count * record.sets * weight).toInt()
            }
            val totalRecords = records.size
            val chartDays = buildChartDays(range.first, range.second, records)
            val maxTotal = chartDays.maxOfOrNull { it.total } ?: 0

            _uiState.update {
                it.copy(
                    totalLoad = totalLoad,
                    totalRecords = totalRecords,
                    chartDays = chartDays,
                    chartMaxTotal = maxTotal
                )
            }
        }
    }

    private fun loadLastValues(exerciseName: String) {
        viewModelScope.launch {
            val latest = trainingRepository.getLatestRecordByExercise(exerciseName)
            if (latest != null) {
                _uiState.update {
                    it.copy(
                        selectedCount = latest.count,
                        selectedSets = latest.sets,
                        selectedWeight = latest.weight?.toInt()?.toString() ?: "なし"
                    )
                }
            }
        }
    }

    private suspend fun selectNextExercise() {
        val state = _uiState.value
        val index = state.exercises.indexOf(state.selectedExercise)
        if (index == -1) return
        val nextIndex = if (index + 1 < state.exercises.size) index + 1 else index
        val nextExercise = state.exercises.getOrNull(nextIndex).orEmpty()
        _uiState.update { it.copy(selectedExercise = nextExercise) }
        if (nextExercise.isNotBlank()) {
            loadLastValues(nextExercise)
        }
    }

    private fun recentDates(): List<String> {
        val today = LocalDate.now()
        return (0..6).map { offset ->
            today.minusDays(offset.toLong()).toString()
        }
    }

    private fun weightOptions(): List<String> {
        val weights = (5..100 step 5).map { it.toString() }
        return listOf("なし") + weights
    }

    private fun parseWeight(value: String): Float? {
        return value.toFloatOrNull()
    }

    private fun dateRange(periodType: PeriodType, periodOffset: Int): Pair<String, String> {
        val today = LocalDate.now()
        return when (periodType) {
            PeriodType.WEEK -> {
                val monday = today.with(DayOfWeek.MONDAY).plusWeeks(periodOffset.toLong())
                val sunday = monday.plusDays(6)
                Pair(monday.toString(), sunday.toString())
            }
            PeriodType.MONTH -> {
                val ym = YearMonth.from(today).plusMonths(periodOffset.toLong())
                Pair(ym.atDay(1).toString(), ym.atEndOfMonth().toString())
            }
        }
    }

    private fun buildChartDays(
        startDate: String,
        endDate: String,
        records: List<TrainingRecord>
    ): List<ChartDay> {
        val start = LocalDate.parse(startDate)
        val end = LocalDate.parse(endDate)
        val labelFormatter = DateTimeFormatter.ofPattern("MM/dd")
        val days = generateSequence(start) { current ->
            val next = current.plusDays(1)
            if (next.isAfter(end)) null else next
        }.toList()

        val grouped = records.groupBy { it.date }
        return days.map { day ->
            val dateKey = day.toString()
            val dayRecords = grouped[dateKey].orEmpty()
            val loads = mutableMapOf<String, Int>()

            allExerciseNames.forEach { name -> loads[name] = 0 }
            dayRecords.forEach { record ->
                val weight = record.weight ?: 1f
                val load = (record.count * record.sets * weight).toInt()
                loads[record.exerciseName] = (loads[record.exerciseName] ?: 0) + load
            }

            val segments = loads.entries
                .filter { it.value > 0 }
                .map { entry ->
                    ChartSegment(
                        name = entry.key,
                        colorHex = exerciseColors[entry.key] ?: "#cbd5e1",
                        value = entry.value
                    )
                }
            val total = segments.sumOf { it.value }
            val label = day.format(labelFormatter)
            ChartDay(
                date = dateKey,
                label = label,
                total = total,
                segments = segments
            )
        }
    }
}
