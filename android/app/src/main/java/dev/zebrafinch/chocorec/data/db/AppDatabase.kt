package dev.zebrafinch.chocorec.data.db

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = [
        TrainingRecordEntity::class,
        ExerciseEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun trainingRecordDao(): TrainingRecordDao
    abstract fun exerciseDao(): ExerciseDao

    companion object {
        const val NAME = "chocorec.db"
    }
}
