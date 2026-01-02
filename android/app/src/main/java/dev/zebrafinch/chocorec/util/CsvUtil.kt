package dev.zebrafinch.chocorec.util

object CsvUtil {
    fun escape(value: String?): String {
        if (value == null) return ""
        val needsQuote = value.contains(",") || value.contains("\"") || value.contains("\n")
        return if (needsQuote) {
            "\"${value.replace("\"", "\"\"")}\""
        } else {
            value
        }
    }
}