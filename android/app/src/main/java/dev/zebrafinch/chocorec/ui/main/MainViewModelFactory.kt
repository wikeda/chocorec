package dev.zebrafinch.chocorec.ui.main

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import dev.zebrafinch.chocorec.di.RepositoryProvider

class MainViewModelFactory(
    private val context: Context
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            val trainingRepo = RepositoryProvider.trainingRepository(context)
            val exerciseRepo = RepositoryProvider.exerciseRepository(context)
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(trainingRepo, exerciseRepo) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}