package dev.zebrafinch.chocorec

import android.app.Application
import dev.zebrafinch.chocorec.data.repository.DefaultExercisesSeeder
import dev.zebrafinch.chocorec.di.RepositoryProvider
import dev.zebrafinch.chocorec.util.DateTimeUtil
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ChocoRecApp : Application() {
    override fun onCreate() {
        super.onCreate()
        val exerciseRepo = RepositoryProvider.exerciseRepositoryImpl(this)
        val defaults = DefaultExercisesSeeder.create(DateTimeUtil.nowIso())
        CoroutineScope(Dispatchers.IO).launch {
            exerciseRepo.seedDefaultsIfNeeded(defaults)
        }
    }
}