package dev.zebrafinch.chocorec.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import dev.zebrafinch.chocorec.ui.exercises.ExercisesScreen
import dev.zebrafinch.chocorec.ui.history.HistoryScreen
import dev.zebrafinch.chocorec.ui.main.MainScreen
import dev.zebrafinch.chocorec.ui.version.VersionScreen

object Routes {
    const val MAIN = "main"
    const val HISTORY = "history"
    const val EXERCISES = "exercises"
    const val VERSION = "version"
}

@Composable
fun AppNav(modifier: Modifier = Modifier, navController: NavHostController = rememberNavController()) {
    NavHost(
        navController = navController,
        startDestination = Routes.MAIN,
        modifier = modifier
    ) {
        composable(Routes.MAIN) {
            MainScreen(
                onNavigateMain = {
                    navController.popBackStack(Routes.MAIN, inclusive = false)
                },
                onNavigateHistory = { navController.navigate(Routes.HISTORY) },
                onNavigateExercises = { navController.navigate(Routes.EXERCISES) },
                onNavigateVersion = { navController.navigate(Routes.VERSION) }
            )
        }
        composable(Routes.HISTORY) {
            HistoryScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.EXERCISES) {
            ExercisesScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.VERSION) {
            VersionScreen(onBack = { navController.popBackStack() })
        }
    }
}
