package dev.zebrafinch.chocorec.data.db

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "exercises",
    indices = [
        Index(value = ["name"], unique = true),
        Index(value = ["is_active"]),
        Index(value = ["order_index"])
    ]
)
data class ExerciseEntity(
    @PrimaryKey val id: String,
    val name: String,
    val color: String,
    @ColumnInfo(name = "order_index") val order: Int,
    @ColumnInfo(name = "is_active") val isActive: Boolean,
    @ColumnInfo(name = "created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") val updatedAt: String
)
