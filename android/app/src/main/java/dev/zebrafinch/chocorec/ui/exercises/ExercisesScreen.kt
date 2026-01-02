package dev.zebrafinch.chocorec.ui.exercises

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.zebrafinch.chocorec.R
import dev.zebrafinch.chocorec.domain.model.Exercise

@Composable
@OptIn(ExperimentalMaterial3Api::class)
fun ExercisesScreen(
    onBack: () -> Unit,
    viewModel: ExercisesViewModel = viewModel(
        factory = ExercisesViewModelFactory(LocalContext.current)
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    var showSheet by remember { mutableStateOf(false) }
    var editingExercise by remember { mutableStateOf<Exercise?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(R.string.exercises_title)) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.action_back)
                        )
                    }
                },
                actions = {
                    IconButton(onClick = {
                        editingExercise = null
                        showSheet = true
                    }) {
                        Icon(
                            imageVector = Icons.Filled.Add,
                            contentDescription = stringResource(R.string.action_add)
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (uiState.exercises.isEmpty()) {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = stringResource(R.string.exercises_empty),
                        modifier = Modifier.padding(16.dp)
                    )
                }
            } else {
                uiState.exercises.sortedBy { it.order }.forEachIndexed { index, exercise ->
                    ExerciseRow(
                        exercise = exercise,
                        canMoveUp = index > 0,
                        canMoveDown = index < uiState.exercises.size - 1,
                        onEdit = {
                            editingExercise = exercise
                            showSheet = true
                        },
                        onMoveUp = { viewModel.moveExercise(exercise.id, MoveDirection.UP) },
                        onMoveDown = { viewModel.moveExercise(exercise.id, MoveDirection.DOWN) }
                    )
                }
            }
        }

        if (showSheet) {
            ExerciseEditSheet(
                exercise = editingExercise,
                onDismiss = { showSheet = false },
                onSave = { name, color ->
                    if (editingExercise == null) {
                        viewModel.addExercise(name, color)
                    } else {
                        viewModel.updateExercise(editingExercise!!.id, name, color)
                    }
                    showSheet = false
                },
                onDelete = {
                    if (editingExercise != null) {
                        viewModel.deleteExercise(editingExercise!!.id)
                    }
                    showSheet = false
                }
            )
        }
    }
}

@Composable
private fun ExerciseRow(
    exercise: Exercise,
    canMoveUp: Boolean,
    canMoveDown: Boolean,
    onEdit: () -> Unit,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            BoxColor(exercise.color)
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.fillMaxWidth(0.6f)) {
                Text(text = exercise.name, fontWeight = FontWeight.SemiBold)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                IconButton(onClick = onMoveUp, enabled = canMoveUp) {
                    Icon(
                        imageVector = Icons.Filled.KeyboardArrowUp,
                        contentDescription = "上に移動"
                    )
                }
                IconButton(onClick = onMoveDown, enabled = canMoveDown) {
                    Icon(
                        imageVector = Icons.Filled.KeyboardArrowDown,
                        contentDescription = "下に移動"
                    )
                }
            }
            Spacer(modifier = Modifier.width(8.dp))
            TextButton(onClick = onEdit) {
                Text(text = stringResource(R.string.action_edit))
            }
        }
    }
}

@Composable
private fun BoxColor(colorHex: String) {
    val color = try {
        Color(android.graphics.Color.parseColor(colorHex))
    } catch (ex: Exception) {
        Color(0xFFCBD5E1)
    }
    Column(
        modifier = Modifier
            .size(32.dp)
            .background(color, shape = MaterialTheme.shapes.small)
    ) {}
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ExerciseEditSheet(
    exercise: Exercise?,
    onDismiss: () -> Unit,
    onSave: (String, String) -> Unit,
    onDelete: () -> Unit
) {
    var name by remember(exercise?.id) { mutableStateOf(exercise?.name ?: "") }
    var color by remember(exercise?.id) { mutableStateOf(exercise?.color ?: "#3b82f6") }

    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(text = stringResource(R.string.exercises_title), style = MaterialTheme.typography.titleMedium)
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text(text = stringResource(R.string.label_name)) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = color,
                onValueChange = { color = it },
                label = { Text(text = stringResource(R.string.label_color)) },
                placeholder = { Text(text = stringResource(R.string.placeholder_color)) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Button(onClick = { onSave(name, color) }, modifier = Modifier.fillMaxWidth(0.5f)) {
                    Text(text = stringResource(R.string.action_save))
                }
                if (exercise != null) {
                    Button(onClick = onDelete, modifier = Modifier.fillMaxWidth(0.5f)) {
                        Text(text = stringResource(R.string.action_delete))
                    }
                } else {
                    Button(onClick = onDismiss, modifier = Modifier.fillMaxWidth(0.5f)) {
                        Text(text = stringResource(R.string.action_cancel))
                    }
                }
            }
        }
    }
}