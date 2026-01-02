package dev.zebrafinch.chocorec.ui.exercises

import dev.zebrafinch.chocorec.domain.model.Exercise

data class ExercisesUiState(
    val exercises: List<Exercise> = emptyList()
)