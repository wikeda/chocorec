package dev.zebrafinch.chocorec.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update

@Dao
interface TrainingRecordDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(record: TrainingRecordEntity)

    @Update
    suspend fun update(record: TrainingRecordEntity)

    @Query("DELETE FROM training_records WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("SELECT * FROM training_records WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): TrainingRecordEntity?

    @Query("SELECT * FROM training_records ORDER BY date DESC, created_at DESC")
    suspend fun getAll(): List<TrainingRecordEntity>

    @Query(
        "SELECT * FROM training_records " +
            "WHERE date BETWEEN :startDate AND :endDate " +
            "ORDER BY date ASC, created_at ASC"
    )
    suspend fun getByDateRange(startDate: String, endDate: String): List<TrainingRecordEntity>

    @Query(
        "SELECT * FROM training_records " +
            "WHERE exercise_name = :name " +
            "ORDER BY date DESC, updated_at DESC"
    )
    suspend fun getByExercise(name: String): List<TrainingRecordEntity>

    @Query(
        "SELECT * FROM training_records " +
            "WHERE exercise_name = :name " +
            "ORDER BY date DESC, updated_at DESC " +
            "LIMIT 1"
    )
    suspend fun getLatestByExercise(name: String): TrainingRecordEntity?

    @Query(
        "UPDATE training_records " +
            "SET exercise_name = :newName, updated_at = :updatedAt " +
            "WHERE exercise_name = :oldName"
    )
    suspend fun updateExerciseName(oldName: String, newName: String, updatedAt: String)
}
