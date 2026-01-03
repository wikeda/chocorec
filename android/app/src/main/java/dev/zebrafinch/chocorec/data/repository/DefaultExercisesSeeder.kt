package dev.zebrafinch.chocorec.data.repository

import dev.zebrafinch.chocorec.domain.model.Exercise

object DefaultExercisesSeeder {
    private val defaults = listOf(
        Pair("レッグプレス", "#ef4444"),
        Pair("チェストプレス", "#f97316"),
        Pair("ラットプルダウン", "#f59e0b"),
        Pair("アブベンチ", "#84cc16"),
        Pair("アブダクション", "#10b981"),
        Pair("アダクション", "#06b6d4"),
        Pair("ディップス", "#3b82f6"),
        Pair("ショルダープレス", "#6366f1"),
        Pair("バイセップスカール", "#8b5cf6"),
        Pair("ピラティス", "#f65ceeff")
    )

    fun create(nowIso: String): List<Exercise> {
        return defaults.mapIndexed { index, pair ->
            Exercise(
                id = "default-$index",
                name = pair.first,
                color = pair.second,
                order = index,
                isActive = true,
                createdAt = nowIso,
                updatedAt = nowIso
            )
        }
    }
}
