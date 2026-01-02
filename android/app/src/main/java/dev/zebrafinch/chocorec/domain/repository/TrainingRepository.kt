package dev.zebrafinch.chocorec.domain.repository

import dev.zebrafinch.chocorec.domain.model.TrainingRecord

interface TrainingRepository {
    suspend fun addRecord(record: TrainingRecord)
    suspend fun updateRecord(record: TrainingRecord)
    suspend fun deleteRecord(id: String)
    suspend fun getRecordById(id: String): TrainingRecord?
    suspend fun getAllRecords(): List<TrainingRecord>
    suspend fun getRecordsByDateRange(startDate: String, endDate: String): List<TrainingRecord>
    suspend fun getRecordsByExercise(name: String): List<TrainingRecord>
    suspend fun getLatestRecordByExercise(name: String): TrainingRecord?
    suspend fun updateExerciseName(oldName: String, newName: String, updatedAt: String)
}