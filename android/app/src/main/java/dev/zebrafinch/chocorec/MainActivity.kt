package dev.zebrafinch.chocorec

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import dev.zebrafinch.chocorec.ui.navigation.AppNav
import dev.zebrafinch.chocorec.ui.theme.ChocoRecTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ChocoRecTheme {
                AppNav()
            }
        }
    }
}