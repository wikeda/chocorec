package dev.zebrafinch.chocorec.data.db

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "training_records",
    indices = [
        Index(value = ["date"]),
        Index(value = ["exercise_name"])
    ]
)
data class TrainingRecordEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "date") val date: String,
    @ColumnInfo(name = "exercise_name") val exerciseName: String,
    val count: Int,
    val sets: Int,
    val weight: Float?,
    @ColumnInfo(name = "created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") val updatedAt: String
)
