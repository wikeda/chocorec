package dev.zebrafinch.chocorec.ui.history

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import dev.zebrafinch.chocorec.di.RepositoryProvider
import dev.zebrafinch.chocorec.R

class HistoryViewModelFactory(
    private val context: Context
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(HistoryViewModel::class.java)) {
            val trainingRepo = RepositoryProvider.trainingRepository(context)
            val exerciseRepo = RepositoryProvider.exerciseRepository(context)
            val headers = listOf(
                context.getString(R.string.csv_header_date),
                context.getString(R.string.csv_header_exercise),
                context.getString(R.string.csv_header_count),
                context.getString(R.string.csv_header_sets),
                context.getString(R.string.csv_header_weight),
                context.getString(R.string.csv_header_created_at),
                context.getString(R.string.csv_header_updated_at)
            )
            @Suppress("UNCHECKED_CAST")
            return HistoryViewModel(trainingRepo, exerciseRepo, headers) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
