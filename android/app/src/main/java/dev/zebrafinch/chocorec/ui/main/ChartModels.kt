package dev.zebrafinch.chocorec.ui.main

data class ChartSegment(
    val name: String,
    val colorHex: String,
    val value: Int
)

data class ChartDay(
    val date: String,
    val label: String,
    val total: Int,
    val segments: List<ChartSegment>
)