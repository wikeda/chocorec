package dev.zebrafinch.chocorec.di

import android.content.Context
import dev.zebrafinch.chocorec.data.repository.ExerciseRepositoryImpl
import dev.zebrafinch.chocorec.data.repository.TrainingRepositoryImpl
import dev.zebrafinch.chocorec.domain.repository.ExerciseRepository
import dev.zebrafinch.chocorec.domain.repository.TrainingRepository

object RepositoryProvider {
    fun trainingRepository(context: Context): TrainingRepository {
        val db = DatabaseProvider.get(context)
        return TrainingRepositoryImpl(db.trainingRecordDao())
    }

    fun exerciseRepository(context: Context): ExerciseRepository {
        val db = DatabaseProvider.get(context)
        return ExerciseRepositoryImpl(db.exerciseDao())
    }

    fun exerciseRepositoryImpl(context: Context): ExerciseRepositoryImpl {
        val db = DatabaseProvider.get(context)
        return ExerciseRepositoryImpl(db.exerciseDao())
    }
}