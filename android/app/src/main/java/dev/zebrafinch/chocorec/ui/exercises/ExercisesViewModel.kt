package dev.zebrafinch.chocorec.ui.exercises

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.zebrafinch.chocorec.domain.model.Exercise
import dev.zebrafinch.chocorec.domain.repository.ExerciseRepository
import dev.zebrafinch.chocorec.domain.repository.TrainingRepository
import dev.zebrafinch.chocorec.util.DateTimeUtil
import java.util.UUID
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class ExercisesViewModel(
    private val exerciseRepository: ExerciseRepository,
    private val trainingRepository: TrainingRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(ExercisesUiState())
    val uiState: StateFlow<ExercisesUiState> = _uiState

    init {
        loadExercises()
    }

    fun loadExercises() {
        viewModelScope.launch {
            val exercises = exerciseRepository.getActiveExercises()
            _uiState.update { it.copy(exercises = exercises) }
        }
    }

    fun addExercise(name: String, color: String) {
        viewModelScope.launch {
            val trimmedName = name.trim()
            if (trimmedName.isBlank()) return@launch
            val existingAny = exerciseRepository.getExerciseByNameAny(trimmedName)
            if (existingAny != null) {
                if (existingAny.isActive) return@launch
                val now = DateTimeUtil.nowIso()
                val order = (_uiState.value.exercises.maxOfOrNull { it.order } ?: -1) + 1
                val revived = existingAny.copy(
                    color = color,
                    order = order,
                    isActive = true,
                    updatedAt = now
                )
                exerciseRepository.updateExercise(revived)
                loadExercises()
                return@launch
            }

            val order = (_uiState.value.exercises.maxOfOrNull { it.order } ?: -1) + 1
            val now = DateTimeUtil.nowIso()
            val exercise = Exercise(
                id = UUID.randomUUID().toString(),
                name = trimmedName,
                color = color,
                order = order,
                isActive = true,
                createdAt = now,
                updatedAt = now
            )
            exerciseRepository.addExercise(exercise)
            loadExercises()
        }
    }

    fun updateExercise(id: String, name: String, color: String) {
        viewModelScope.launch {
            val existing = _uiState.value.exercises.firstOrNull { it.id == id } ?: return@launch
            val trimmedName = name.trim()
            if (trimmedName.isBlank()) return@launch

            val now = DateTimeUtil.nowIso()
            val updated = existing.copy(
                name = trimmedName,
                color = color,
                updatedAt = now
            )
            exerciseRepository.updateExercise(updated)
            if (existing.name != trimmedName) {
                trainingRepository.updateExerciseName(existing.name, trimmedName, now)
            }
            loadExercises()
        }
    }

    fun deleteExercise(id: String) {
        viewModelScope.launch {
            exerciseRepository.softDeleteExercise(id, DateTimeUtil.nowIso())
            loadExercises()
        }
    }

    fun moveExercise(id: String, direction: MoveDirection) {
        viewModelScope.launch {
            val list = _uiState.value.exercises.sortedBy { it.order }
            val index = list.indexOfFirst { it.id == id }
            if (index == -1) return@launch
            val targetIndex = if (direction == MoveDirection.UP) index - 1 else index + 1
            if (targetIndex < 0 || targetIndex >= list.size) return@launch

            val current = list[index]
            val target = list[targetIndex]
            val now = DateTimeUtil.nowIso()
            exerciseRepository.updateExerciseOrder(current.id, target.order, now)
            exerciseRepository.updateExerciseOrder(target.id, current.order, now)
            loadExercises()
        }
    }
}

enum class MoveDirection {
    UP,
    DOWN
}
