package dev.zebrafinch.chocorec.data.repository

import dev.zebrafinch.chocorec.data.db.ExerciseDao
import dev.zebrafinch.chocorec.data.mapper.toDomain
import dev.zebrafinch.chocorec.data.mapper.toEntity
import dev.zebrafinch.chocorec.domain.model.Exercise
import dev.zebrafinch.chocorec.domain.repository.ExerciseRepository

class ExerciseRepositoryImpl(
    private val dao: ExerciseDao
) : ExerciseRepository {
    override suspend fun addExercise(exercise: Exercise) {
        dao.insert(exercise.toEntity())
    }

    override suspend fun updateExercise(exercise: Exercise) {
        dao.update(exercise.toEntity())
    }

    override suspend fun getAllExercises(): List<Exercise> {
        return dao.getAll().map { it.toDomain() }
    }

    override suspend fun getActiveExercises(): List<Exercise> {
        return dao.getActiveOrdered().map { it.toDomain() }
    }

    override suspend fun getExerciseById(id: String): Exercise? {
        return dao.getById(id)?.toDomain()
    }

    override suspend fun getExerciseByName(name: String): Exercise? {
        return dao.getByName(name)?.toDomain()
    }

    override suspend fun softDeleteExercise(id: String, updatedAt: String) {
        dao.softDelete(id, updatedAt)
    }

    override suspend fun updateExerciseOrder(id: String, order: Int, updatedAt: String) {
        dao.updateOrder(id, order, updatedAt)
    }

    suspend fun seedDefaultsIfNeeded(exercises: List<Exercise>) {
        val existing = dao.getAll()
        if (existing.isNotEmpty()) return
        exercises.forEach { dao.insert(it.toEntity()) }
    }
}