package dev.zebrafinch.chocorec.util

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

    fun formatPickerDate(dateStr: String): String {
        return try {
            val date = LocalDate.parse(dateStr, dateFormatter)
            date.format(DateTimeFormatter.ofPattern("MM/dd"))
        } catch (ex: Exception) {
            dateStr
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
