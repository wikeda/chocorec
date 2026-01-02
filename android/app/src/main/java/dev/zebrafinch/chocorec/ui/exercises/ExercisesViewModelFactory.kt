package dev.zebrafinch.chocorec.ui.exercises

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import dev.zebrafinch.chocorec.di.RepositoryProvider

class ExercisesViewModelFactory(
    private val context: Context
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ExercisesViewModel::class.java)) {
            val exerciseRepo = RepositoryProvider.exerciseRepository(context)
            val trainingRepo = RepositoryProvider.trainingRepository(context)
            @Suppress("UNCHECKED_CAST")
            return ExercisesViewModel(exerciseRepo, trainingRepo) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}