package dev.zebrafinch.chocorec.ui.main

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.google.firebase.analytics.FirebaseAnalytics
import dev.zebrafinch.chocorec.di.RepositoryProvider
import dev.zebrafinch.chocorec.R

class MainViewModelFactory(
    private val context: Context
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            val trainingRepo = RepositoryProvider.trainingRepository(context)
            val exerciseRepo = RepositoryProvider.exerciseRepository(context)
            val noneLabel = context.getString(R.string.label_none)
            val analytics = FirebaseAnalytics.getInstance(context)
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(trainingRepo, exerciseRepo, noneLabel, analytics) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
