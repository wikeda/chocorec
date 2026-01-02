package dev.zebrafinch.chocorec.domain.repository

import dev.zebrafinch.chocorec.domain.model.Exercise

interface ExerciseRepository {
    suspend fun addExercise(exercise: Exercise)
    suspend fun updateExercise(exercise: Exercise)
    suspend fun getAllExercises(): List<Exercise>
    suspend fun getActiveExercises(): List<Exercise>
    suspend fun getExerciseById(id: String): Exercise?
    suspend fun getExerciseByName(name: String): Exercise?
    suspend fun softDeleteExercise(id: String, updatedAt: String)
    suspend fun updateExerciseOrder(id: String, order: Int, updatedAt: String)
}