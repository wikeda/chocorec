package dev.zebrafinch.chocorec.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update

@Dao
interface ExerciseDao {
    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(exercise: ExerciseEntity)

    @Update
    suspend fun update(exercise: ExerciseEntity)

    @Query("SELECT * FROM exercises ORDER BY order_index ASC")
    suspend fun getAll(): List<ExerciseEntity>

    @Query("SELECT * FROM exercises WHERE is_active = 1 ORDER BY order_index ASC")
    suspend fun getActiveOrdered(): List<ExerciseEntity>

    @Query("SELECT * FROM exercises WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): ExerciseEntity?

    @Query("SELECT * FROM exercises WHERE name = :name AND is_active = 1 LIMIT 1")
    suspend fun getByName(name: String): ExerciseEntity?

    @Query("SELECT * FROM exercises WHERE name = :name LIMIT 1")
    suspend fun getByNameAny(name: String): ExerciseEntity?

    @Query("UPDATE exercises SET is_active = 0, updated_at = :updatedAt WHERE id = :id")
    suspend fun softDelete(id: String, updatedAt: String)

    @Query("UPDATE exercises SET order_index = :orderIndex, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateOrder(id: String, orderIndex: Int, updatedAt: String)
}
