package dev.zebrafinch.chocorec.di

import android.content.Context
import androidx.room.Room
import dev.zebrafinch.chocorec.data.db.AppDatabase

object DatabaseProvider {
    @Volatile
    private var instance: AppDatabase? = null

    fun get(context: Context): AppDatabase {
        return instance ?: synchronized(this) {
            instance ?: Room.databaseBuilder(
                context.applicationContext,
                AppDatabase::class.java,
                AppDatabase.NAME
            ).build().also { instance = it }
        }
    }
}