package dev.zebrafinch.chocorec.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.Canvas
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.ExperimentalAnimationApi
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.rememberDrawerState
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.LayoutDirection
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import dev.zebrafinch.chocorec.R
import dev.zebrafinch.chocorec.util.DateTimeUtil
import java.time.DayOfWeek
import java.time.LocalDate
import kotlin.math.abs
import kotlinx.coroutines.launch

@Composable
@OptIn(ExperimentalMaterial3Api::class)
fun MainScreen(
    onNavigateMain: () -> Unit,
    onNavigateHistory: () -> Unit,
    onNavigateExercises: () -> Unit,
    onNavigateVersion: () -> Unit,
    viewModel: MainViewModel = viewModel(
        factory = MainViewModelFactory(LocalContext.current)
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val chartLabelWidth = 64.dp
    val lifecycleOwner = LocalLifecycleOwner.current

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                viewModel.refresh()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        ModalNavigationDrawer(
            drawerState = drawerState,
            drawerContent = {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
                    ModalDrawerSheet(
                        modifier = Modifier.widthIn(min = 200.dp, max = 240.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            NavigationDrawerItem(
                                label = { Text(text = stringResource(R.string.menu_exercises)) },
                                selected = false,
                                onClick = {
                                    scope.launch { drawerState.close() }
                                    onNavigateExercises()
                                }
                            )
                            NavigationDrawerItem(
                                label = { Text(text = stringResource(R.string.menu_history)) },
                                selected = false,
                                onClick = {
                                    scope.launch { drawerState.close() }
                                    onNavigateHistory()
                                }
                            )
                            NavigationDrawerItem(
                                label = { Text(text = stringResource(R.string.menu_version)) },
                                selected = false,
                                onClick = {
                                    scope.launch { drawerState.close() }
                                    onNavigateVersion()
                                }
                            )
                        }
                    }
                }
            }
        ) {
            CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
                Scaffold(
                    topBar = {
                        TopAppBar(
                            title = { Text(text = stringResource(R.string.app_name)) },
                            colors = TopAppBarDefaults.topAppBarColors(
                                containerColor = MaterialTheme.colorScheme.surface
                            ),
                            actions = {
                                IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                    Icon(
                                        imageVector = Icons.Filled.Menu,
                                        contentDescription = stringResource(R.string.action_menu)
                                    )
                                }
                            }
                        )
                    },
                    bottomBar = {
                        Surface(shadowElevation = 8.dp, tonalElevation = 2.dp) {
                            RecordForm(
                                dates = uiState.dates,
                                exercises = uiState.exercises,
                                counts = uiState.counts,
                                sets = uiState.sets,
                                weights = uiState.weights,
                                selectedDate = uiState.selectedDate,
                                selectedExercise = uiState.selectedExercise,
                                selectedCount = uiState.selectedCount,
                                selectedSets = uiState.selectedSets,
                                selectedWeight = uiState.selectedWeight,
                                onDateSelected = viewModel::onDateSelected,
                                onExerciseSelected = viewModel::onExerciseSelected,
                                onCountSelected = viewModel::onCountSelected,
                                onSetsSelected = viewModel::onSetsSelected,
                                onWeightSelected = viewModel::onWeightSelected,
                                onRecord = viewModel::onRecord,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp)
                                    .navigationBarsPadding()
                            )
                        }
                    }
                ) { innerPadding ->
                    val scrollState = rememberScrollState()
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                            .padding(12.dp)
                            .verticalScroll(scrollState),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        PeriodTabs(
                            periodType = uiState.periodType,
                            onPeriodSelected = viewModel::onPeriodChanged
                        )
                        SummaryRow(
                            totalLoad = uiState.totalLoad,
                            totalRecords = uiState.totalRecords
                        )
                        ChartSectionAnimated(
                            periodType = uiState.periodType,
                            periodOffset = uiState.periodOffset,
                            days = uiState.chartDays,
                            maxTotal = uiState.chartMaxTotal,
                            labelWidth = chartLabelWidth,
                            onSwipeLeft = { viewModel.shiftPeriod(1) },
                            onSwipeRight = { viewModel.shiftPeriod(-1) }
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalAnimationApi::class)
@Composable
private fun ChartSectionAnimated(
    periodType: PeriodType,
    periodOffset: Int,
    days: List<ChartDay>,
    maxTotal: Int,
    labelWidth: androidx.compose.ui.unit.Dp,
    onSwipeLeft: () -> Unit,
    onSwipeRight: () -> Unit
) {
    val target = Pair(periodType, periodOffset)
    AnimatedContent(
        targetState = target,
        transitionSpec = {
            if (initialState.first != targetState.first) {
                fadeIn().togetherWith(fadeOut())
            } else if (targetState.second < initialState.second) {
                slideInHorizontally { -it }.togetherWith(slideOutHorizontally { it })
            } else if (targetState.second > initialState.second) {
                slideInHorizontally { it }.togetherWith(slideOutHorizontally { -it })
            } else {
                fadeIn().togetherWith(fadeOut())
            }
        }
    ) {
        ChartSection(
            days = days,
            maxTotal = maxTotal,
            labelWidth = labelWidth,
            onSwipeLeft = onSwipeLeft,
            onSwipeRight = onSwipeRight
        )
    }
}

@Composable
private fun PeriodTabs(
    periodType: PeriodType,
    onPeriodSelected: (PeriodType) -> Unit
) {
    val tabs = listOf(
        stringResource(R.string.tab_week),
        stringResource(R.string.tab_month)
    )
    val selectedIndex = if (periodType == PeriodType.WEEK) 0 else 1
    TabRow(selectedTabIndex = selectedIndex) {
        tabs.forEachIndexed { index, title ->
            Tab(
                selected = selectedIndex == index,
                onClick = {
                    onPeriodSelected(if (index == 0) PeriodType.WEEK else PeriodType.MONTH)
                },
                text = { Text(text = title) }
            )
        }
    }
}

@Composable
private fun SummaryRow(totalLoad: Int, totalRecords: Int) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        SummaryCard(
            title = stringResource(R.string.summary_total_load),
            value = totalLoad.toString(),
            modifier = Modifier.weight(0.7f)
        )
        SummaryCard(
            title = stringResource(R.string.summary_total_records),
            value = totalRecords.toString(),
            modifier = Modifier.weight(0.3f)
        )
    }
}

@Composable
private fun SummaryCard(title: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(text = title, style = MaterialTheme.typography.labelMedium)
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.fillMaxWidth(),
                textAlign = androidx.compose.ui.text.style.TextAlign.End
            )
        }
    }
}

@Composable
private fun ChartSection(
    days: List<ChartDay>,
    maxTotal: Int,
    labelWidth: androidx.compose.ui.unit.Dp,
    onSwipeLeft: () -> Unit,
    onSwipeRight: () -> Unit
) {
    if (days.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp)
                .background(MaterialTheme.colorScheme.surface)
                .border(1.dp, MaterialTheme.colorScheme.outlineVariant),
            contentAlignment = Alignment.Center
        ) {
            Text(text = stringResource(R.string.placeholder_chart))
        }
        return
    }

    val legendEntries = days
        .flatMap { it.segments }
        .distinctBy { it.name }
    val density = LocalDensity.current
    val swipeThresholdPx = with(density) { 48.dp.toPx() }
    var dragTotal by remember { mutableStateOf(0f) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant)
            .padding(8.dp),
        verticalArrangement = Arrangement.spacedBy(3.dp)
    ) {
        if (legendEntries.isNotEmpty()) {
            LegendSection(entries = legendEntries)
        }
        Column(
            modifier = Modifier.pointerInput(Unit) {
                detectHorizontalDragGestures(
                    onDragEnd = {
                        if (abs(dragTotal) > swipeThresholdPx) {
                            if (dragTotal < 0f) onSwipeLeft() else onSwipeRight()
                        }
                        dragTotal = 0f
                    },
                    onHorizontalDrag = { _, dragAmount ->
                        dragTotal += dragAmount
                    }
                )
            },
            verticalArrangement = Arrangement.spacedBy(3.dp)
        ) {
            days.forEach { day ->
                ChartRow(day = day, maxTotal = maxTotal, labelWidth = labelWidth)
            }
            ChartAxis(maxTotal = maxTotal, labelWidth = labelWidth)
        }
    }
}

@Composable
@OptIn(ExperimentalLayoutApi::class)
private fun LegendSection(entries: List<ChartSegment>) {
    FlowRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        entries.forEach { entry ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .width(10.dp)
                        .height(10.dp)
                        .background(Color(android.graphics.Color.parseColor(entry.colorHex)))
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = entry.name, style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}

@Composable
private fun ChartRow(day: ChartDay, maxTotal: Int, labelWidth: androidx.compose.ui.unit.Dp) {
    val emptyColor = MaterialTheme.colorScheme.outlineVariant
    val dayColor = runCatching { LocalDate.parse(day.date).dayOfWeek }.getOrNull()
    val labelColor = when (dayColor) {
        DayOfWeek.SATURDAY -> Color(0xFF2563EB)
        DayOfWeek.SUNDAY -> Color(0xFFDC2626)
        else -> MaterialTheme.colorScheme.onSurfaceVariant
    }
    val labelStyle = MaterialTheme.typography.headlineSmall
    val gridLineColor = MaterialTheme.colorScheme.outlineVariant
    val dashEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f))
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = day.label,
            style = labelStyle,
            modifier = Modifier.width(labelWidth),
            maxLines = 1,
            overflow = TextOverflow.Clip,
            color = labelColor
        )
        Spacer(modifier = Modifier.width(8.dp))
        Canvas(modifier = Modifier
            .height(18.dp)
            .fillMaxWidth()
        ) {
            val safeMax = if (maxTotal <= 0) 1 else maxTotal
            listOf(0f, 0.25f, 0.5f, 0.75f, 1f).forEach { fraction ->
                val x = size.width * fraction
                drawLine(
                    color = gridLineColor,
                    start = Offset(x, 0f),
                    end = Offset(x, size.height),
                    strokeWidth = 1.dp.toPx(),
                    pathEffect = dashEffect
                )
            }
            var startX = 0f
            day.segments.forEach { segment ->
                val width = (segment.value.toFloat() / safeMax) * size.width
                if (width > 0f) {
                    drawRect(
                        color = Color(android.graphics.Color.parseColor(segment.colorHex)),
                        topLeft = Offset(startX, 0f),
                        size = Size(width, size.height)
                    )
                    startX += width
                }
            }
        }
    }
}

@Composable
private fun ChartAxis(maxTotal: Int, labelWidth: androidx.compose.ui.unit.Dp) {
    val safeMax = if (maxTotal <= 0) 0 else maxTotal
    val steps = listOf(
        0,
        safeMax / 4,
        safeMax / 2,
        (safeMax * 3) / 4,
        safeMax
    )
    Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Box(modifier = Modifier.width(labelWidth))
        Spacer(modifier = Modifier.width(8.dp))
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                steps.forEach { step ->
                    Text(text = step.toString(), style = MaterialTheme.typography.labelSmall)
                }
            }
        }
    }
}

@Composable
private fun RecordForm(
    dates: List<String>,
    exercises: List<String>,
    counts: List<Int>,
    sets: List<Int>,
    weights: List<String>,
    selectedDate: String,
    selectedExercise: String,
    selectedCount: Int,
    selectedSets: Int,
    selectedWeight: String,
    onDateSelected: (String) -> Unit,
    onExerciseSelected: (String) -> Unit,
    onCountSelected: (Int) -> Unit,
    onSetsSelected: (Int) -> Unit,
    onWeightSelected: (String) -> Unit,
    onRecord: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                DropdownField(
                    label = stringResource(R.string.label_date),
                    options = dates,
                    selected = selectedDate,
                    onSelected = onDateSelected,
                    modifier = Modifier.weight(0.35f),
                    displayTransform = DateTimeUtil::formatPickerDate
                )
                DropdownField(
                    label = stringResource(R.string.label_exercise),
                    options = exercises,
                    selected = selectedExercise,
                    onSelected = onExerciseSelected,
                    modifier = Modifier.weight(0.65f)
                )
            }
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                DropdownField(
                    label = stringResource(R.string.label_count),
                    options = counts.map { it.toString() },
                    selected = selectedCount.toString(),
                    onSelected = { onCountSelected(it.toInt()) },
                    modifier = Modifier
                        .weight(1f)
                        .widthIn(min = 72.dp)
                )
                DropdownField(
                    label = stringResource(R.string.label_sets),
                    options = sets.map { it.toString() },
                    selected = selectedSets.toString(),
                    onSelected = { onSetsSelected(it.toInt()) },
                    modifier = Modifier
                        .weight(1f)
                        .widthIn(min = 72.dp)
                )
                DropdownField(
                    label = stringResource(R.string.label_weight),
                    options = weights,
                    selected = selectedWeight,
                    onSelected = onWeightSelected,
                    modifier = Modifier
                        .weight(1f)
                        .widthIn(min = 72.dp)
                )
            }
            Button(
                onClick = onRecord,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
            ) {
                Text(text = stringResource(R.string.button_record))
            }
        }
    }
}
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DropdownField(
    label: String,
    options: List<String>,
    selected: String,
    onSelected: (String) -> Unit,
    displayTransform: (String) -> String = { it },
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }
    val selectedValueRaw = if (selected.isNotBlank()) selected else options.firstOrNull().orEmpty()
    val selectedValue = displayTransform(selectedValueRaw)

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
            singleLine = true,
            maxLines = 1,
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
                    text = {
                        Text(
                            text = displayTransform(option),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    },
                    onClick = {
                        onSelected(option)
                        expanded = false
                    }
                )
            }
        }
    }
}
