package dev.zebrafinch.chocorec.data.repository

import dev.zebrafinch.chocorec.data.db.TrainingRecordDao
import dev.zebrafinch.chocorec.data.mapper.toDomain
import dev.zebrafinch.chocorec.data.mapper.toEntity
import dev.zebrafinch.chocorec.domain.model.TrainingRecord
import dev.zebrafinch.chocorec.domain.repository.TrainingRepository

class TrainingRepositoryImpl(
    private val dao: TrainingRecordDao
) : TrainingRepository {
    override suspend fun addRecord(record: TrainingRecord) {
        dao.insert(record.toEntity())
    }

    override suspend fun updateRecord(record: TrainingRecord) {
        dao.update(record.toEntity())
    }

    override suspend fun deleteRecord(id: String) {
        dao.deleteById(id)
    }

    override suspend fun getRecordById(id: String): TrainingRecord? {
        return dao.getById(id)?.toDomain()
    }

    override suspend fun getAllRecords(): List<TrainingRecord> {
        return dao.getAll().map { it.toDomain() }
    }

    override suspend fun getRecordsByDateRange(
        startDate: String,
        endDate: String
    ): List<TrainingRecord> {
        return dao.getByDateRange(startDate, endDate).map { it.toDomain() }
    }

    override suspend fun getRecordsByExercise(name: String): List<TrainingRecord> {
        return dao.getByExercise(name).map { it.toDomain() }
    }

    override suspend fun getLatestRecordByExercise(name: String): TrainingRecord? {
        return dao.getLatestByExercise(name)?.toDomain()
    }

    override suspend fun updateExerciseName(oldName: String, newName: String, updatedAt: String) {
        dao.updateExerciseName(oldName, newName, updatedAt)
    }
}