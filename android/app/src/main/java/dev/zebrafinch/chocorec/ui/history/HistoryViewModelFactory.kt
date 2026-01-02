package dev.zebrafinch.chocorec.ui.history

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import dev.zebrafinch.chocorec.di.RepositoryProvider

class HistoryViewModelFactory(
    private val context: Context
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(HistoryViewModel::class.java)) {
            val trainingRepo = RepositoryProvider.trainingRepository(context)
            val exerciseRepo = RepositoryProvider.exerciseRepository(context)
            @Suppress("UNCHECKED_CAST")
            return HistoryViewModel(trainingRepo, exerciseRepo) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}