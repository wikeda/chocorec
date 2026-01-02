package dev.zebrafinch.chocorec.util

import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object DateTimeUtil {
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    private val dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
    private val csvDateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
    private val fileDateFormatter = DateTimeFormatter.ofPattern("yyyyMMdd")

    fun today(): String {
        return LocalDate.now().format(dateFormatter)
    }

    fun nowIso(): String {
        return LocalDateTime.now().format(dateTimeFormatter)
    }

    fun formatHistoryDate(dateStr: String): String {
        val date = LocalDate.parse(dateStr, dateFormatter)
        val today = LocalDate.now()
        val yesterday = today.minusDays(1)

        return when (date) {
            today -> "今日"
            yesterday -> "昨日"
            else -> {
                val weekday = when (date.dayOfWeek) {
                    DayOfWeek.MONDAY -> "月"
                    DayOfWeek.TUESDAY -> "火"
                    DayOfWeek.WEDNESDAY -> "水"
                    DayOfWeek.THURSDAY -> "木"
                    DayOfWeek.FRIDAY -> "金"
                    DayOfWeek.SATURDAY -> "土"
                    DayOfWeek.SUNDAY -> "日"
                }
                "${date.monthValue}月${date.dayOfMonth}日($weekday)"
            }
        }
    }

    fun formatCsvDateTime(iso: String): String {
        return try {
            LocalDateTime.parse(iso, dateTimeFormatter).format(csvDateTimeFormatter)
        } catch (ex: Exception) {
            iso
        }
    }

    fun todayForFilename(): String {
        return LocalDate.now().format(fileDateFormatter)
    }
}