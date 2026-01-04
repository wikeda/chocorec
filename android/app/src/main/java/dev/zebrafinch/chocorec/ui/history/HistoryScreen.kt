package dev.zebrafinch.chocorec.ui.history

import android.content.Context
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.RadioButton
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Edit
import dev.zebrafinch.chocorec.R
import java.time.LocalDate
import java.time.DayOfWeek
import kotlinx.coroutines.launch

@Composable
@OptIn(ExperimentalMaterial3Api::class)
fun HistoryScreen(
    onBack: () -> Unit,
    viewModel: HistoryViewModel = viewModel(
        factory = HistoryViewModelFactory(LocalContext.current)
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val todayLabel = stringResource(R.string.history_today)
    val yesterdayLabel = stringResource(R.string.history_yesterday)
    val weekdayLabels = mapOf(
        DayOfWeek.MONDAY to stringResource(R.string.history_weekday_mon),
        DayOfWeek.TUESDAY to stringResource(R.string.history_weekday_tue),
        DayOfWeek.WEDNESDAY to stringResource(R.string.history_weekday_wed),
        DayOfWeek.THURSDAY to stringResource(R.string.history_weekday_thu),
        DayOfWeek.FRIDAY to stringResource(R.string.history_weekday_fri),
        DayOfWeek.SATURDAY to stringResource(R.string.history_weekday_sat),
        DayOfWeek.SUNDAY to stringResource(R.string.history_weekday_sun)
    )
    var showEditSheet by remember { mutableStateOf(false) }
    val csvLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("text/csv"),
        onResult = { uri ->
            if (uri != null) {
                scope.launch {
                    val content = viewModel.buildCsvContent()
                    val saved = writeCsv(context, uri, content)
                    if (saved) {
                        Toast.makeText(
                            context,
                            context.getString(R.string.toast_csv_saved),
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        }
    )

    val selectedRecord = uiState.groups
        .flatMap { it.records }
        .firstOrNull { it.id == uiState.selectedId }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(R.string.history_title)) },
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
                    IconButton(onClick = { csvLauncher.launch(viewModel.csvFileName()) }) {
                        Icon(
                            imageVector = Icons.Filled.Download,
                            contentDescription = stringResource(R.string.action_csv_save)
                        )
                    }
                    IconButton(
                        onClick = { if (uiState.selectedId != null) showEditSheet = true },
                        enabled = uiState.selectedId != null
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Edit,
                            contentDescription = stringResource(R.string.action_edit)
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        if (uiState.groups.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(16.dp)
            ) {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = stringResource(R.string.history_empty),
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(uiState.groups) { group ->
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = formatHistoryDate(
                                dateStr = group.date,
                                todayLabel = todayLabel,
                                yesterdayLabel = yesterdayLabel,
                                weekdayLabels = weekdayLabels,
                                format = stringResource(R.string.history_date_format)
                            ),
                            style = MaterialTheme.typography.titleSmall
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        group.records.forEach { record ->
                            HistoryRow(
                                record = record,
                                selected = uiState.selectedId == record.id,
                                onSelected = { viewModel.onSelectRecord(record.id) }
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                    }
                }
            }
        }

        if (showEditSheet && selectedRecord != null) {
            EditBottomSheet(
                record = selectedRecord,
                availableExercises = uiState.exercises,
                onDismiss = { showEditSheet = false },
                onSave = { date, exercise, count, sets, weight ->
                    viewModel.updateRecord(
                        id = selectedRecord.id,
                        date = date,
                        exerciseName = exercise,
                        count = count,
                        sets = sets,
                        weight = weight
                    )
                    showEditSheet = false
                },
                onDelete = {
                    viewModel.deleteRecord(selectedRecord.id)
                    showEditSheet = false
                }
            )
        }
    }
}

@Composable
private fun HistoryRow(
    record: HistoryRecordRow,
    selected: Boolean,
    onSelected: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            RadioButton(selected = selected, onClick = onSelected)
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = record.exerciseName,
                    color = Color(android.graphics.Color.parseColor(record.color))
                )
                val weightText = record.weight?.let {
                    stringResource(R.string.history_weight_suffix, it)
                } ?: ""
                Text(
                    text = stringResource(
                        R.string.history_record_summary,
                        record.count,
                        record.sets,
                        weightText
                    ),
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun EditBottomSheet(
    record: HistoryRecordRow,
    availableExercises: List<String>,
    onDismiss: () -> Unit,
    onSave: (String, String, Int, Int, Float?) -> Unit,
    onDelete: () -> Unit
) {
    val primaryGreen = Color(0xFF10B981)
    val cancelGray = Color(0xFFE5E7EB)
    val deleteGray = Color(0xFFD1D5DB)
    val noneLabel = stringResource(R.string.label_none)
    val dates = recentDates()
    val exercises = if (availableExercises.isNotEmpty()) availableExercises else listOf(record.exerciseName)
    val counts = (1..50).map { it.toString() }
    val sets = (1..10).map { it.toString() }
    val weights = listOf(noneLabel) + (5..100 step 5).map { it.toString() }

    var selectedDate by remember(record.id) { mutableStateOf(record.date) }
    var selectedExercise by remember(record.id) { mutableStateOf(record.exerciseName) }
    var selectedCount by remember(record.id) { mutableStateOf(record.count.toString()) }
    var selectedSets by remember(record.id) { mutableStateOf(record.sets.toString()) }
    var selectedWeight by remember(record.id) {
        mutableStateOf(record.weight?.toInt()?.toString() ?: noneLabel)
    }
    var showDeleteConfirm by remember { mutableStateOf(false) }

    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = stringResource(R.string.edit_title),
                style = MaterialTheme.typography.titleMedium
            )
            DropdownField(
                label = stringResource(R.string.label_date),
                options = dates,
                selected = selectedDate,
                onSelected = { selectedDate = it }
            )
            DropdownField(
                label = stringResource(R.string.label_exercise),
                options = exercises,
                selected = selectedExercise,
                onSelected = { selectedExercise = it }
            )
            DropdownField(
                label = stringResource(R.string.label_count),
                options = counts,
                selected = selectedCount,
                onSelected = { selectedCount = it }
            )
            DropdownField(
                label = stringResource(R.string.label_sets),
                options = sets,
                selected = selectedSets,
                onSelected = { selectedSets = it }
            )
            DropdownField(
                label = stringResource(R.string.label_weight),
                options = weights,
                selected = selectedWeight,
                onSelected = { selectedWeight = it }
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Button(
                    onClick = {
                        onSave(
                            selectedDate,
                            selectedExercise,
                            selectedCount.toIntOrNull() ?: record.count,
                            selectedSets.toIntOrNull() ?: record.sets,
                            selectedWeight.toFloatOrNull()
                        )
                    },
                    modifier = Modifier.weight(0.6f),
                    colors = ButtonDefaults.buttonColors(containerColor = primaryGreen)
                ) {
                    Text(text = stringResource(R.string.action_save))
                }
                Button(
                    onClick = { showDeleteConfirm = true },
                    modifier = Modifier.weight(0.4f),
                    colors = ButtonDefaults.buttonColors(containerColor = deleteGray)
                ) {
                    Text(text = stringResource(R.string.action_delete))
                }
            }
            TextButton(onClick = onDismiss, modifier = Modifier.fillMaxWidth()) {
                Text(text = stringResource(R.string.action_cancel))
            }
        }
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text(text = stringResource(R.string.delete_title)) },
            text = { Text(text = stringResource(R.string.delete_confirm)) },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteConfirm = false
                        onDelete()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = deleteGray)
                ) {
                    Text(text = stringResource(R.string.action_delete))
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text(text = stringResource(R.string.action_cancel))
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DropdownField(
    label: String,
    options: List<String>,
    selected: String,
    onSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }
    val selectedValue = if (selected.isNotBlank()) selected else options.firstOrNull().orEmpty()

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded },
        modifier = modifier
    ) {
        OutlinedTextField(
            value = selectedValue,
            onValueChange = {},
            readOnly = true,
            label = { Text(text = label) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier
                .menuAnchor()
                .fillMaxWidth()
        )
        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = { Text(text = option) },
                    onClick = {
                        onSelected(option)
                        expanded = false
                    }
                )
            }
        }
    }
}

private fun recentDates(): List<String> {
    val today = LocalDate.now()
    return (0..6).map { offset ->
        today.minusDays(offset.toLong()).toString()
    }
}

private fun formatHistoryDate(
    dateStr: String,
    todayLabel: String,
    yesterdayLabel: String,
    weekdayLabels: Map<DayOfWeek, String>,
    format: String
): String {
    val date = LocalDate.parse(dateStr)
    val today = LocalDate.now()
    val yesterday = today.minusDays(1)

    return when (date) {
        today -> todayLabel
        yesterday -> yesterdayLabel
        else -> {
            val weekday = weekdayLabels[date.dayOfWeek] ?: ""
            String.format(format, date.monthValue, date.dayOfMonth, weekday)
        }
    }
}

private fun writeCsv(context: Context, uri: Uri, content: String): Boolean {
    val bom = "\uFEFF"
    return try {
        context.contentResolver.openOutputStream(uri)?.use { output ->
            output.write((bom + content).toByteArray(Charsets.UTF_8))
        }
        true
    } catch (ex: Exception) {
        false
    }
}
